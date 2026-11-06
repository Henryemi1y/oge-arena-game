// soul.js — душа героя выходит из тела, когда разрушена конечность босса. Игрок водит душу, собирает осколки с цифрами
// (E — подобрать / положить, Q — вернуть последний или бросить) и складывает ответ на монолите. Тело героя в это время
// дерётся само, но урона не наносит. Верно — конечность остаётся разрушенной; неверно — собирается обратно с меньшим HP.
const Soul = {
  on: false, ph: 'off', shards: [], carried: [], placed: [], t: 0, T: 0, TMAX: 95, FAST: 35, x: 0, z: .5, h: 60, vx: 0, vz: 0, face: 1, alpha: 0, msg: null, hint: 0, mode: 'limb',
  reset() { this.on = false; this.ph = 'off'; this.shards = []; this.carried = []; this.placed = []; this.msg = null },
  ansStr(a) { return (a < 0 ? '−' : '') + Math.abs(a) },
  // разрушена конечность босса: осколки летят из неё
  begin(B, part, pos, last) {
    this.start({ mode: 'limb', B, part, pos, last });
    if (!Game.soulSeen) { Game.soulSeen = 1; UI.banner('Душа покинула тело', 'Собери осколки с цифрами ответа (E) и сложи их на монолите', '#bfefff', 4.2) }
    else UI.banner('Душа вне тела', LIMB_NAME[part] + ' разбита — реши задачу на монолите', '#bfefff', 2.2);
  },
  // печать монолита между волнами: задача без босса, награда — здоровье
  seal() {
    const M = World.monolith; this.start({ mode: 'seal', pos: { x: M.x, z: .05, h: 300 }, spread: 650 });
    UI.banner('Печать монолита', 'Реши задачу — монолит вернёт силы и откроет ворота', '#bfefff', 3.2);
  },
  start(o) {
    const p = this.prob = Problems.next(Game.level), s = this.ansStr(p.a), pos = o.pos;
    Object.assign(this, { mode: o.mode, part: o.part || null, B: o.B || null, last: o.last, slots: Math.max(4, s.length), confirm: 0, on: true, ph: 'out', t: 0, T: this.TMAX, carried: [], placed: [], msg: null, res: null, used: 0 });
    // осколки: цифры ответа + приманки (соседние цифры — типичные ошибки)
    const ds = [...s], dec = [], nDec = cl(8 - ds.length, 3, 5);
    for (let i = 0; i < nDec; i++) { const base = ds.filter(c => c !== '−'); let d = base.length && Math.random() < .6 ? (+pick(base) + pick([-1, 1, 2, -2]) + 10) % 10 : irnd(0, 9); dec.push('' + d) }
    if (p.a > 0 && Math.random() < .5) dec.push('−'); // минус-приманка, если ответ положительный
    const all = shuffle([...ds, ...dec]), M = World.monolith.x, spots = [], spread = o.spread || 950;
    this.shards = all.map(d => {
      let tx, tz, tries = 0;
      do { tx = cl(pos.x + rnd(-spread, spread), W.XMIN + 60, W.XMAX - 60); tz = rnd(.12, .95); tries++ } while (tries < 60 && (Math.abs(tx - M) < 180 || spots.some(q => fdist(q[0], q[1], tx, tz) < 130)));
      spots.push([tx, tz]); const tt = rnd(.9, 1.4), g = 900;
      return { d, x: pos.x, z: pos.z, h: pos.h, vx: (tx - pos.x) / tt, vz: (tz - pos.z) / tt, vh: (0 - pos.h) / tt + .5 * g * tt, g, t: 0, tt, landed: false, r: 0, vr: rnd(-12, 12), ph: rnd(0, TAU) };
    });
    const H = Hero.H; H.soul = true; this.x = H.x; this.z = H.z; this.h = Hero.height() * .55; this.vx = 0; this.vz = 0; this.face = Hero.FACE; this.alpha = 0;
    Snd.soulOut(); Snd.setMode('soul'); Game.stats.tasks++;
  },
  atMonolith() { return Math.abs(this.x - World.monolith.x) < 150 && this.z < .34 },
  nearShard() { let best = null, bd = 95; for (const s of this.shards) if (s.landed && !s.carried && !s.placed) { const d = fdist(this.x, this.z, s.x, s.z); if (d < bd) { bd = d; best = s } } return best },
  full() { return this.placed.length >= this.slots },
  update(dt) {
    if (!this.on) return; this.t += dt; const H = Hero.H;
    // полёт осколков
    for (const s of this.shards) if (!s.landed && !s.carried && !s.placed && !s.back) { s.t += dt; s.x += s.vx * dt; s.z += s.vz * dt; s.h += s.vh * dt; s.vh -= s.g * dt; s.r += s.vr * dt; if (s.t >= s.tt) { s.landed = true; s.h = 0; FX.dust(s.x, s.z, 3, .3); FX.chips(s.x, s.z, 0, 3, 150); Snd.step(.3, 0) } }
    for (const s of this.shards) if (s.back) { s.t += dt; const k = sm(s.t / 1); s.x = lp(s.bx, s.tx, k); s.z = lp(s.bz, s.tz, k); s.h = lp(s.bh, s.th, k) + Math.sin(PI * k) * 120; if (s.t >= 1) s.gone = 1 }
    if (this.ph === 'out') { const k = sm(this.t / .8); this.alpha = k * .92; this.h = lp(Hero.height() * .55, 70, k); if (Math.random() < .6) FX.soulMote(this.x + rnd(-20, 20), this.z, this.h + rnd(0, 80)); if (this.t > .8) { this.ph = 'free'; this.t = 0 } }
    else if (this.ph === 'free') {
      this.T -= dt; this.used += dt; const a = Input.axis(), sp = a.run ? 400 : 300, ax = a.x * sp, az = a.z * (a.run ? 1.2 : .95);
      this.vx = lp(this.vx, ax, 1 - Math.exp(-dt * 9)); this.vz = lp(this.vz, az, 1 - Math.exp(-dt * 9));
      this.x = cl(this.x + this.vx * dt, W.XMIN, W.XMAX); this.z = cl(this.z + this.vz * dt, 0, 1); if (Math.abs(this.vx) > 20) this.face = Math.sign(this.vx);
      this.h = 70 + 10 * Math.sin(this.t * 2.2); if (Math.random() < .35) FX.soulMote(this.x - this.face * rnd(0, 30), this.z, this.h + rnd(-10, 60));
      if (Input.hit('KeyE')) this.use(); if (Input.hit('KeyQ')) this.undo(); if (Input.hit('KeyR')) this.rotate();
      if (this.T <= 10 && Math.floor(this.T + dt) !== Math.floor(this.T)) Snd.tick();
      if (this.T <= 0) { this.T = 0; this.finish(false, 'Время вышло') }
    } else if (this.ph === 'result') {
      // после ошибки — разбор решения; дальше по E/Enter или сам через несколько секунд
      const minT = this.res ? 1.6 : 2.2, maxT = this.res ? 2.4 : 9;
      if (this.t > maxT || (this.t > minT && (Input.hit('KeyE') || Input.hit('Space')))) { this.ph = 'return'; this.t = 0; this.fx = this.x; this.fz = this.z; this.fh = this.h; Snd.soulIn() }
    }
    else if (this.ph === 'return') {
      const k = sm(this.t / .9); this.x = lp(this.fx, H.x, k); this.z = lp(this.fz, H.z, k); this.h = lp(this.fh, Hero.height() * .55, k); this.alpha = .92 * (1 - k * .8);
      if (this.t >= .9) {
        this.on = false; this.ph = 'off'; H.soul = false; H.inv = 1.2; Snd.setMode(Boss.b ? 'boss' : 'wave'); this.shards = []; this.placed = []; this.carried = []; FX.flash(H.x, H.z, Hero.height() * .5, 120, '140,240,255', .3);
        if (this.mode === 'limb') Boss.limbResult(this.part, this.res); else Game.sealDone(this.res);
      }
    }
    this.hint = Math.max(0, this.hint - dt); this.confirm = Math.max(0, (this.confirm || 0) - dt);
    this.shards = this.shards.filter(s => !s.gone);
  },
  // E: у монолита — положить первую цифру из рук; руки пусты — проверить (второе нажатие подтверждает, если ячейки не заполнены);
  // в поле — подобрать. Ячеек всегда не меньше четырёх: их число не подсказывает длину ответа.
  use() {
    if (this.atMonolith()) {
      if (this.carried.length && !this.full()) { const s = this.carried.shift(); s.carried = false; s.placed = true; this.placed.push(s); Snd.place(); FX.flash(World.monolith.x, World.monolith.z, 200, 60, '120,220,255', .2); return }
      if (this.placed.length && (!this.carried.length || this.full())) { if (this.confirm > 0) return this.check(); this.confirm = 2.5; Snd.tick(); return }
    }
    const s = this.nearShard(); if (s && this.carried.length < 3) { s.carried = true; this.carried.push(s); Snd.pickup(); FX.flash(s.x, s.z, 20, 40, '140,230,255', .15); return }
    this.hint = 1.2; Snd.tick();
  },
  // Q: у монолита — забрать последнюю положенную цифру в конец рук; в поле — бросить последнюю из рук
  undo() {
    if (this.atMonolith() && this.placed.length) { const s = this.placed.pop(); s.placed = false; if (this.carried.length < 3) { s.carried = true; this.carried.push(s) } else { s.landed = true; s.x = World.monolith.x + rnd(-170, 170); s.z = .4; s.h = 0 } Snd.tick(); return }
    if (this.carried.length) { const s = this.carried.pop(); s.carried = false; s.landed = true; s.x = this.x; s.z = this.z; s.h = 0; FX.dust(s.x, s.z, 2, .2); Snd.tick() }
  },
  // R: поменять порядок цифр в руках (первая уходит в конец)
  rotate() { if (this.carried.length > 1) { this.carried.push(this.carried.shift()); Snd.tick() } },
  check() {
    const v = this.placed.map(s => s.d).join(''), ok = v === this.ansStr(this.prob.a);
    this.finish(ok, ok ? 'Верно!' : 'Неверно');
  },
  finish(ok, text) {
    const fast = ok && this.used <= this.FAST, k = this.prob.k || 'Задачи', st = Game.stats.topics[k] || (Game.stats.topics[k] = { n: 0, ok: 0 }); st.n++; if (ok) st.ok++;
    this.res = ok; this.ph = 'result'; this.t = 0; this.msg = { text, ok, fast, ans: this.ansStr(this.prob.a), sol: this.prob.s || '' };
    if (ok) {
      Snd.correct(); Game.stats.solved++; FX.flash(World.monolith.x, World.monolith.z, 220, 200, '120,230,255', .6); for (const s of this.placed) s.gone = 1;
      // награда: здоровье за верный ответ, больше — за быстрый
      const heal = 24 + (fast ? 16 : 0); Game.heal(heal); Game.score += 100 + (fast ? 100 : 0); this.msg.heal = Game.healAmt;
    } else {
      Snd.wrong(); FX.flash(World.monolith.x, World.monolith.z, 220, 200, '255,90,70', .6); Cam.kick(6);
      const B = this.B, G = B && B.G; let tx = World.monolith.x, th = 300, tz = World.monolith.z;
      if (this.mode === 'limb' && G) { const p = this.part.startsWith('arm') ? G.arms[this.part === 'armN' ? 0 : 1].sh : G.legs[this.part === 'legN' ? 0 : 1].hip, q = rigToWorld(B, p); tx = q.x; th = zy(B.z) - q.y; tz = B.z }
      // осколки летят обратно (к культе — конечность соберётся; к монолиту — печать)
      for (const s of this.shards) { s.back = 1; s.t = 0; s.bx = s.carried || s.placed ? (s.placed ? World.monolith.x : this.x) : s.x; s.bz = s.placed ? World.monolith.z + .1 : s.carried ? this.z : s.z; s.bh = s.placed ? 200 : s.carried ? this.h : s.h; s.tx = tx; s.tz = tz; s.th = th; s.carried = s.placed = false; s.landed = false }
      this.carried = []; this.placed = [];
    }
  },
  // ---------- рисование ----------
  drawables(list) {
    for (const s of this.shards) if (!s.carried && !s.placed) list.push({ z: s.z, draw: () => this.drawShard(s, s.x, s.z, s.h, 1), shadow: s.landed ? () => drawShadow(s.x, s.z, 18, .3) : null });
  },
  // душа и её осколки — поверх всех персонажей (её не должно загораживать)
  drawTop() { if (this.on && this.ph !== 'off') this.drawSoul() },
  // пол в форме души притушён: светятся только осколки
  drawFloorDim() { if (!this.on) return; const a = this.ph === 'out' ? sm(this.t / .8) : this.ph === 'return' ? 1 - sm(this.t / .9) : 1; ctx.fillStyle = `rgba(3,6,16,${.38 * a})`; ctx.fillRect(0, W.FLOOR_TOP + 20, VW, VH - W.FLOOR_TOP) },
  // насколько прозрачным делать персонажа рядом с душой или монолитом (0 — не трогать)
  fadeFor(x) { if (!this.on || this.ph === 'off') return 0; const a = Math.abs(x - this.x), b = Math.abs(x - World.monolith.x); return Math.max(cl(1 - (a - 90) / 260, 0, 1), this.atMonolith() || Math.abs(this.x - World.monolith.x) < 400 ? cl(1 - (b - 120) / 260, 0, 1) : 0) },
  drawShard(s, x, z, h, k0, glow = 1) {
    const t = performance.now() / 1000, i = s.d === '−' ? 10 : +s.d, img = IM.shards[i], k = .74 * zs(z) * k0, X = sx(x), Y = zy(z) - h - img.height * k * .5 - (s.landed ? 8 + 5 * Math.sin(t * 2.4 + s.ph) : 0);
    if (X < -60 || X > VW + 60) return;
    const near = this.on && this.ph === 'free' && this.nearShard() === s;
    if (glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = (near ? 70 : 54) * zs(z) * k0 * (1 + .12 * Math.sin(t * 4 + s.ph)), g = ctx.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, `rgba(110,200,255,${near ? .62 : .4})`); g.addColorStop(1, 'rgba(60,140,255,0)'); ctx.fillStyle = g; ctx.fillRect(X - r, Y - r, 2 * r, 2 * r);
      if (s.landed) { const bw = 16 * zs(z), bh = 150 * zs(z), bg = ctx.createLinearGradient(0, Y - bh, 0, Y); bg.addColorStop(0, 'rgba(90,190,255,0)'); bg.addColorStop(1, `rgba(120,210,255,${.22 + .1 * Math.sin(t * 3 + s.ph)})`); ctx.fillStyle = bg; ctx.fillRect(X - bw / 2, Y - bh, bw, bh) }
      ctx.restore() }
    // тёмная обводка: цифра на осколке отличается от резьбы на плитах пола
    if (glow) { ctx.save(); ctx.globalAlpha = .55; ctx.translate(X, Y); ctx.rotate(s.landed ? 0 : s.r); const kk = k * 1.12; ctx.drawImage(img, -img.width * kk / 2, -img.height * kk / 2, img.width * kk, img.height * kk); ctx.restore() }
    ctx.save(); ctx.translate(X, Y); ctx.rotate(s.landed ? 0 : s.r); ctx.drawImage(img, -img.width * k / 2, -img.height * k / 2, img.width * k, img.height * k);
    if (s.d === '−') { ctx.fillStyle = 'rgba(150,225,255,.95)'; ctx.shadowColor = '#5fc8ff'; ctx.shadowBlur = 8; ctx.fillRect(-img.width * k * .26, -img.height * k * .06, img.width * k * .52, img.height * k * .13) }
    ctx.restore();
  },
  drawSoul() {
    const S = ASSETS.soul, I = IM.soul, k = W.CS / S._k * zs(this.z), X = sx(this.x), Y = zy(this.z) - this.h, t = this.t + performance.now() / 1000 * .0001, tt = performance.now() / 1000;
    // свечение
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = this.alpha * (.75 + .15 * Math.sin(tt * 3)); const gr = 330 * zs(this.z); ctx.drawImage(I.glow, X - gr / 2, Y - gr * .62, gr, gr); ctx.restore();
    ctx.save(); ctx.translate(X, Y); ctx.scale(this.face * k, k); ctx.rotate(this.vx * .0005 * this.face); ctx.globalAlpha = this.alpha;
    const T = S.torso; ctx.translate(-T.waist[0], -T.waist[1]);
    // хвост: полосы, качающиеся по синусу (сильнее к кончику)
    const tl = S.tail, ti = I.tail, n = 24, sh = ti.height / n;
    for (let i = 0; i < n; i++) { const u = i / n, dx = Math.sin(tt * 3.2 - u * 5) * 26 * Math.pow(u, 1.3) - this.vx * .05 * u * u * this.face; ctx.drawImage(ti, 0, i * sh, ti.width, sh + 1, T.waist[0] - tl.top[0] + dx, T.waist[1] - tl.top[1] + i * sh, ti.width, sh + 1) }
    const arm = (key, at, ang, a) => { const P = S[key]; ctx.save(); ctx.globalAlpha = this.alpha * a; ctx.translate(at[0], at[1]); ctx.rotate(ang); ctx.drawImage(I[key], -P.root[0], -P.root[1]); ctx.restore() };
    const sw = Math.sin(tt * 1.8), mv = cl(Math.abs(this.vx) / 300, 0, 1);
    arm('armF', T.shF, .22 + .1 * sw + .25 * mv, .75);
    ctx.drawImage(I.torso, 0, 0);
    ctx.save(); ctx.translate(T.neck[0], T.neck[1]); ctx.rotate(.04 * Math.sin(tt * 1.3) - .08 * mv); ctx.drawImage(I.head, -S.head.neck[0], -S.head.neck[1]); ctx.restore();
    arm('armN', T.shN, -.12 - .1 * sw + .3 * mv, 1);
    // наплечник поверх верха руки (как шапка сустава)
    const c = T.cap; ctx.save(); ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, TAU); ctx.clip(); ctx.drawImage(I.torso, 0, 0); ctx.restore();
    ctx.restore();
    // несомые осколки — по кругу у души
    this.carried.forEach((s, i) => { const a = tt * 2 + i * TAU / 3, r = 46; this.drawShard(s, this.x + Math.cos(a) * r, this.z + Math.sin(a) * .03, this.h + 70 + Math.sin(a) * 18, .8) });
  },
  // уравнение на панели монолита (узкая панель, гравировка светится)
  drawMonolith(p, x, y, w, h, k) {
    const pn = ASSETS.props.monolith.panel, pk = ASSETS.props.monolith.k * k, px = x - w / 2 + pn[0] * pk, py = y - h + pn[1] * pk, pw = pn[2] * pk, ph = pn[3] * pk, tt = performance.now() / 1000;
    const act = this.on && this.prob;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(60,140,220,${act ? .12 + .05 * Math.sin(tt * 2) : .03})`; ctx.fillRect(px, py, pw, ph); ctx.restore();
    if (!act) return;
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#bfefff'; ctx.shadowColor = '#3fa9ff'; ctx.shadowBlur = 10;
    // на самом монолите — та же запись, что на табличке: дроби столбиком, строки переносятся
    const lines = wrapEq(this.prob.t, pw - 6, 22), fr = /\//.test(this.prob.t); let fy = py + 16;
    ctx.font = `600 14px ${FONT_UI}`; ctx.fillStyle = '#86c9e8'; ctx.fillText(this.prob.c, px + pw / 2, fy); fy += fr ? 30 : 22;
    for (const l of lines.lines) { mathText(l, px + pw / 2, fy, lines.size, '#d8f6ff', 'center', pw - 6); fy += lines.size * (fr ? 1.6 : 1.15) }
    // ячейки ответа
    const n = this.slots, cw = Math.min(26, (pw - 10) / n), x0 = px + pw / 2 - cw * n / 2, cy = py + ph - 26;
    for (let i = 0; i < n; i++) { ctx.strokeStyle = 'rgba(140,220,255,.6)'; ctx.lineWidth = 1.5; ctx.shadowBlur = 0; ctx.strokeRect(x0 + i * cw + 2, cy - 12, cw - 4, 26); const s = this.placed[i]; if (s) this.drawShardAt(s, x0 + i * cw + cw / 2, cy + 1, (cw - 2) / 74) }
    ctx.restore();
  },
  drawShardAt(s, X, Y, k) { const i = s.d === '−' ? 10 : +s.d, img = IM.shards[i]; ctx.drawImage(img, X - img.width * k / 2, Y - img.height * k / 2, img.width * k, img.height * k); if (s.d === '−') { ctx.fillStyle = '#bfefff'; ctx.fillRect(X - img.width * k * .26, Y - img.height * k * .06, img.width * k * .52, img.height * k * .13) } },
};
// перенос уравнения на строки под ширину панели
function wrapEq(t, maxW, size) {
  for (let s = size; s >= 13; s--) {
    ctx.font = `700 ${s}px ${FONT_EQ}`; if (ctx.measureText(t).width <= maxW) return { lines: [t], size: s };
    const parts = t.includes(';') ? t.split(/;\s*/) : t.includes(' = ') ? [t.slice(0, t.indexOf(' = ')), t.slice(t.indexOf(' = ') + 1)] : [t];
    if (parts.every(p => ctx.measureText(p).width <= maxW)) return { lines: parts, size: s };
  }
  return { lines: [t], size: 9 };
}
