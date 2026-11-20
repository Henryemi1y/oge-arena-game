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
    if (!Game.soulSeen) { Game.soulSeen = 1; UI.banner('Душа покинула тело', '', '#bfefff', 2.4) }
    else UI.banner('Душа вне тела', '', '#bfefff', 2);
  },
  // печать монолита между волнами: задача без босса, награда — здоровье
  seal() {
    const M = World.monolith; this.start({ mode: 'seal', pos: { x: M.x, z: .05, h: 300 }, spread: 650 });
    UI.banner('Печать монолита', '', '#bfefff', 2.2);
  },
  start(o) {
    Input.clearPresses(); Hero.H.qq = [];
    const p = this.prob = Problems.next(Game.level), s = this.ansStr(p.a), pos = o.pos;
    Object.assign(this, { mode: o.mode, part: o.part || null, B: o.B || null, last: o.last, slots: Math.max(4, s.length), confirm: 0, on: true, ph: 'out', t: 0, T: this.TMAX, carried: [], placed: [], msg: null, res: null, used: 0 });
    // осколки: цифры ответа + приманки (соседние цифры — типичные ошибки)
    const ds = [...s], dec = [], nDec = cl(8 - ds.length, 3, 5);
    for (let i = 0; i < nDec; i++) { const base = ds.filter(c => c !== '−'); let d = base.length && Math.random() < .6 ? (+pick(base) + pick([-1, 1, 2, -2]) + 10) % 10 : irnd(0, 9); dec.push('' + d) }
    if (p.a > 0 && Math.random() < .5) dec.push('−'); // минус-приманка, если ответ положительный
    const all = shuffle([...ds, ...dec]), M = World.monolith.x, spots = [], spread = o.spread || 640;
    this.shards = all.map(d => {
      let tx, tz, tries = 0;
      do { tx = cl(pos.x + rnd(-spread, spread), W.XMIN + 60, W.XMAX - 60); tz = rnd(.12, .95); tries++ } while (tries < 60 && (Math.abs(tx - M) < 180 || spots.some(q => fdist(q[0], q[1], tx, tz) < 130)));
      spots.push([tx, tz]); const tt = rnd(.9, 1.4), g = 900;
      return { d, x: pos.x, z: pos.z, h: pos.h, vx: (tx - pos.x) / tt, vz: (tz - pos.z) / tt, vh: (0 - pos.h) / tt + .5 * g * tt, g, t: 0, tt, landed: false, r: 0, vr: rnd(-12, 12), ph: rnd(0, TAU) };
    });
    const H = Hero.H; H.soul = true; this.ribbon = []; this.x = H.x; this.z = H.z; this.h = Hero.height() * .55; this.vx = 0; this.vz = 0; this.face = Hero.FACE; this.alpha = 0;
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
    if (this.ph === 'out') { const t = this.t, hh = Hero.height(), eob = u => { u = cl(u, 0, 1); const c = 1.7; return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2 };
      if (t <= dt + 1e-6) { this.x0 = this.x; FX.ring(this.x, this.z, 140, .45, '170,240,255', 3); FX.sparks(this.x, this.z, hh * .5, 14, '190,245,255', 320) }
      const p = eob((t - .06) / .38); this.x = this.x0 - this.face * 46 * p; this.alpha = sm(t / .1) * .95;
      this.h = t < .44 ? lp(hh * .45, hh * .45 + 80, p) : lp(hh * .45 + 80, 70, sm((t - .44) / .36)); this.sq = 1 + .38 * (1 - sm(t / .36));
      if (Math.random() < .7) FX.soulMote(this.x + rnd(-20, 20), this.z, this.h + rnd(-30, 90)); if (t > .8) { this.ph = 'free'; this.t = 0; this.sq = 1 } }
    else if (this.ph === 'free') {
      this.T -= dt; this.used += dt; const a = Input.axis(), sp = a.run ? 520 : 380, ax = a.x * sp, az = a.z * (a.run ? 1.45 : 1.15);
      this.vx = lp(this.vx, ax, 1 - Math.exp(-dt * 9)); this.vz = lp(this.vz, az, 1 - Math.exp(-dt * 9));
      this.x = cl(this.x + this.vx * dt, W.XMIN, W.XMAX); this.z = cl(this.z + this.vz * dt, 0, 1); if (Math.abs(this.vx) > 20) this.face = Math.sign(this.vx);
      this.h = 70 + 10 * Math.sin(this.t * 2.2); if (Math.random() < .25) FX.soulMote(this.x + rnd(-25, 25), this.z, this.h + rnd(-60, 90));
      { const T_ = this._tip; if (T_) { (this.ribbon = this.ribbon || []).push({ x: this.x + T_.dx, z: this.z, h: this.h - T_.dy, t: this.t }); this.ribbon = this.ribbon.filter(q => this.t - q.t < .35) } }
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
        Input.clearPresses(); H.qq = []; this.on = false; this.ph = 'off'; H.soul = false; H.inv = 1.2; Snd.setMode(Boss.b ? 'boss' : 'wave'); this.shards = []; this.placed = []; this.carried = []; FX.flash(H.x, H.z, Hero.height() * .5, 120, '140,240,255', .3);
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
      const heal = 24 + (fast ? 16 : 0); Game.heal(heal); Hero.gainUlt(20); Game.score += 100 + (fast ? 100 : 0); this.msg.heal = Game.healAmt;
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
  drawTop() { if (this.on && this.ph !== 'off') { if (this.mp) this.drawAnswer(); this.drawSoul() } },
  // пол в форме души притушён: светятся только осколки
  drawFloorDim() { if (!this.on) return; const a = this.ph === 'out' ? sm(this.t / .8) : this.ph === 'return' ? 1 - sm(this.t / .9) : 1; ctx.fillStyle = `rgba(3,6,16,${.38 * a})`; ctx.fillRect(0, W.FLOOR_TOP + 20, VW, VH - W.FLOOR_TOP) },
  // насколько прозрачным делать персонажа рядом с душой или монолитом (0 — не трогать)
  fadeFor(x) { if (!this.on || this.ph === 'off') return 0; const a = Math.abs(x - this.x), b = Math.abs(x - World.monolith.x); return Math.max(cl(1 - (a - 90) / 260, 0, 1), this.atMonolith() || Math.abs(this.x - World.monolith.x) < 400 ? cl(1 - (b - 120) / 260, 0, 1) : 0) },
  drawShard(s, x, z, h, k0, glow = 1) {
    const t = performance.now() / 1000, i = s.d === '−' ? 10 : +s.d, img = IM.shards[i], k = .88 * zs(z) * k0, X = sx(x), Y = zy(z) - h - img.height * k * .5 - (s.landed ? 8 + 5 * Math.sin(t * 2.4 + s.ph) : 0);
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
  // душа героя: цельная фигура с листа. Из неё один раз готовится «призрачная» версия: детали размыты, ядро
  // полупрозрачное, яркий контур по краю, свет в груди, к хвосту фигура тает. Каждый кадр фигура гнётся волной
  // от плеч к хвосту и в полёте тянется назад (голова впереди, хвост отстаёт), корпус наклоняется по ходу.
  spirit() {
    if (this._sp) return this._sp; const F = IM.soul.full, w = F.width, h = F.height, mk = () => mkCanvas(w, h);
    const sil = (src, col, blur = 0) => { const c = mk(), x = c.getContext('2d'); if (blur) x.filter = `blur(${blur}px)`; x.drawImage(src, 0, 0); x.filter = 'none'; if (col) { x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, w, h) } return c };
    // контур: силуэт, раздутый на 2 px, минус сам силуэт
    const rim = mk(), r = rim.getContext('2d'), solid = sil(F, '#fff');
    for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1.5, -1.5], [1.5, 1.5], [-1.5, 1.5], [1.5, -1.5]]) r.drawImage(solid, dx, dy);
    r.globalCompositeOperation = 'destination-out'; r.drawImage(solid, 0, 0); r.globalCompositeOperation = 'source-in'; r.fillStyle = 'rgb(215,255,255)'; r.fillRect(0, 0, w, h);
    r.globalCompositeOperation = 'destination-in'; const rg = r.createRadialGradient(40, 40, 30, 40, 40, h * .95); rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(.45, 'rgba(0,0,0,.6)'); rg.addColorStop(1, 'rgba(0,0,0,.08)'); r.fillStyle = rg; r.fillRect(0, 0, w, h); r.globalCompositeOperation = 'source-over';
    const c = mk(), x = c.getContext('2d');
    x.globalAlpha = .5; x.drawImage(sil(F, null, 1.4), 0, 0); x.globalAlpha = .38; x.drawImage(F, 0, 0); x.globalAlpha = 1;
    // свет в груди
    x.globalCompositeOperation = 'source-atop'; const g = x.createRadialGradient(104, 178, 0, 104, 178, 105); g.addColorStop(0, 'rgba(235,255,255,.9)'); g.addColorStop(.45, 'rgba(210,250,255,.35)'); g.addColorStop(1, 'rgba(230,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'source-over'; x.drawImage(rim, 0, 0);
    // к хвосту фигура тает
    x.globalCompositeOperation = 'destination-in'; const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(.5, 'rgba(0,0,0,.92)'); v.addColorStop(.8, 'rgba(0,0,0,.55)'); v.addColorStop(1, 'rgba(0,0,0,.15)'); x.fillStyle = v; x.fillRect(0, 0, w, h);
    const ARM = [[118, 148], [155, 145], [165, 190], [180, 225], [200, 258], [216, 290], [216, 342], [172, 342], [165, 295], [156, 262], [146, 238], [137, 215], [128, 195], [118, 170]];
    const path = q => { q.beginPath(); ARM.forEach(([px, py], i) => i ? q.lineTo(px, py) : q.moveTo(px, py)); q.closePath() };
    // маска руки с мягким краем (2 px): шов на груди не читается прямой линией
    const mask = mk(), mx = mask.getContext('2d'); mx.filter = 'blur(2px)'; mx.fillStyle = '#fff'; path(mx); mx.fill(); mx.filter = 'none';
    const arm = mk(), ax = arm.getContext('2d'); ax.drawImage(c, 0, 0); ax.globalCompositeOperation = 'destination-in'; ax.drawImage(mask, 0, 0); ax.globalCompositeOperation = 'source-over';
    // кисть чуть тусклее груди
    ax.globalCompositeOperation = 'destination-in'; const ag = ax.createLinearGradient(0, 150, 0, 340); ag.addColorStop(0, 'rgba(0,0,0,1)'); ag.addColorStop(1, 'rgba(0,0,0,.72)'); ax.fillStyle = ag; ax.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'destination-out'; x.drawImage(mask, 0, 0); x.globalCompositeOperation = 'source-over';
    // наплечник поверх руки (шапка сустава)
    // мягкое свечение силуэта — из тела уже без ближней руки (иначе на её прежнем месте остаётся «вторая рука»)
    const gl = mkCanvas(w + 60, h + 60), gx = gl.getContext('2d'); gx.filter = 'blur(14px)'; gx.drawImage(c, 30, 30); gx.filter = 'none'; gx.globalCompositeOperation = 'source-in'; gx.fillStyle = 'rgb(120,235,255)'; gx.fillRect(0, 0, gl.width, gl.height);
    const cap = mk(), cx = cap.getContext('2d'); cx.filter = 'blur(3px)'; cx.fillStyle = '#fff'; cx.beginPath(); cx.ellipse(132, 128, 26, 25, 0, 0, TAU); cx.fill(); cx.filter = 'none'; cx.globalCompositeOperation = 'source-in'; cx.drawImage(c, 0, 0); cx.globalCompositeOperation = 'source-over';
    return this._sp = { c, gl, arm, cap };
  },
  soulCanvas() {
    const { c: SP } = this.spirit(), M = 80, w = SP.width + 2 * M, h = SP.height + 20, tt = performance.now() / 1000;
    if (!this._sc || this._sc.width !== w) this._sc = mkCanvas(w, h);
    const c = this._sc, x = c.getContext('2d'), Y0 = 95, H_ = SP.height, vx = cl(this.vx * this.face, -600, 600);
    x.clearRect(0, 0, w, h);
    x.drawImage(SP, 0, 0, SP.width, Y0, M + vx * .012, 0, SP.width, Y0);
    // от плеч вниз: волна с растущей амплитудой; в полёте нижняя часть отстаёт (дуга назад)
    // полосы по 2 px встык, без перекрытия (иначе на полупрозрачной фигуре видны горизонтальные линии)
    for (let y = Y0; y < H_; y += 2) { const hh = Math.min(2, H_ - y), u = (y - Y0) / (H_ - Y0), amp = 1 + 22 * Math.pow(u, 1.5), dx = Math.sin(tt * 2.4 - u * 4.4) * amp + Math.sin(tt * 3.9 - u * 7) * 3.5 * u - vx * .13 * u * u + vx * .012 * (1 - u);
      x.drawImage(SP, 0, y, SP.width, hh, M + dx, y, SP.width, hh) }
    // рука: в полёте отводится назад (до 0,75 рад), в покое — чуть в сторону и покачивается
    const { arm, cap } = this.spirit(), PX = 138, PY = 150, ra = cl(vx * .0014, -.12, .75) - .1 + .07 * Math.sin(tt * 1.6), sdx = Math.sin(tt * 2.4 - (PY - Y0) / (H_ - Y0) * 4.4) * 1.5;
    x.save(); x.translate(M + PX + sdx, PY); x.rotate(ra); x.drawImage(arm, -PX, -PY); x.restore(); x.drawImage(cap, M + sdx, 0);
    return { c, M };
  },
  drawSoul() {
    const S = ASSETS.soul, F = IM.soul.full; if (!F) return;
    const k = W.CS / S._k * zs(this.z), X = sx(this.x), Y = zy(this.z) - this.h, tt = performance.now() / 1000, WX = 105, WY = 212;
    const { c, M } = this.soulCanvas(), { gl } = this.spirit(), lean = cl(this.vx * .0004, -.15, .15) + .03 * Math.sin(tt * 1.3), br = 1 + .012 * Math.sin(tt * 2.2);
    const put = (img, a, mode, ox, oy) => { ctx.save(); ctx.globalCompositeOperation = mode; ctx.globalAlpha = a; ctx.translate(X, Y); ctx.rotate(lean); const q = this.sq || 1; ctx.scale(this.face * k / Math.sqrt(q), k * br * q); ctx.drawImage(img, -(WX + ox), -(WY + oy)); ctx.restore() };
    // сияние: мягкое и «дышит»
    const pl = .7 + .3 * Math.sin(tt * 1.8);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = this.alpha * .45 * pl; const gr = 300 * zs(this.z); ctx.drawImage(IM.soul.glow, X - gr / 2, Y - gr * .55, gr, gr); ctx.restore();
    put(gl, this.alpha * .42 * pl, 'lighter', 30, 30);
    // сама душа (уже полупрозрачная) и лёгкое свечение поверх
    put(c, this.alpha, 'source-over', M, 0); put(c, this.alpha * .22 * pl, 'lighter', M, 0);
    // глаза
    { const ex = X + this.face * (141 - WX) * k, ey = Y + (73 - WY) * k * br, r = 7 * zs(this.z) * (1 + .2 * Math.sin(tt * 7)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = this.alpha * .7; ctx.drawImage(FX.glow('190,250,255'), ex - r, ey - r, 2 * r, 2 * r); ctx.restore() }
    // кончик хвоста в мире — для шлейфа
    { const ty = 600 - WY, tx = Math.sin(tt * 2.4 - 4.4) * 23 - cl(this.vx * this.face, -600, 600) * .085, ca = Math.cos(lean), sa = Math.sin(lean), lx = this.face * tx * k, ly = ty * k;
      this._tip = { dx: lx * ca - ly * sa, dy: lx * sa + ly * ca } }
    // несомые осколки — по кругу у души
    this.carried.forEach((s, i) => { const a = tt * 2 + i * TAU / 3, r = 46; this.drawShard(s, this.x + Math.cos(a) * r, this.z + Math.sin(a) * .03, this.h + 70 + Math.sin(a) * 18, .8) });
  },
  // уравнение на панели монолита (узкая панель, гравировка светится)
  drawMonolith(p, x, y, w, h, k) {
    const pn = ASSETS.props.monolith.panel, pk = ASSETS.props.monolith.k * k, px = x - w / 2 + pn[0] * pk, py = y - h + pn[1] * pk, pw = pn[2] * pk, ph = pn[3] * pk, tt = performance.now() / 1000;
    const act = this.on && this.prob;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(60,140,220,${act ? .12 + .05 * Math.sin(tt * 2) : .03})`; ctx.fillRect(px, py, pw, ph); ctx.restore();
    if (!act) { this.mp = null; return }
    this.mp = [px, py, pw, ph];
  },
  // ответ на панели монолита рисуется поверх персонажей: босс и тело героя его не закрывают
  drawAnswer() {
    const [px, py, pw, ph] = this.mp, tt = performance.now() / 1000;
    // на монолите — уравнение (дроби столбиком, перенос по «=» или «;») и под ним ячейки ответа с цифрами
    const n = this.slots, at = this.atMonolith(), cw = Math.min(40, (pw - 8) / n), x0 = px + pw / 2 - cw * n / 2, cy = py + ph / 2 + 8;
    ctx.save(); ctx.fillStyle = 'rgba(6,10,22,.55)'; ctx.fillRect(px, py, pw, ph);
    ctx.font = `600 15px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillStyle = '#9fd0ea'; ctx.fillText('Ответ', px + pw / 2, cy - 30);
    for (let i = 0; i < n; i++) { const s = this.placed[i], nx = i === this.placed.length && at && this.carried.length;
      ctx.fillStyle = s ? 'rgba(40,110,170,.4)' : 'rgba(10,20,40,.6)'; ctx.fillRect(x0 + i * cw + 2, cy - 20, cw - 4, 40);
      ctx.strokeStyle = this.confirm > 0 && s ? 'rgba(255,217,138,.95)' : nx ? `rgba(255,230,160,${.6 + .4 * Math.sin(tt * 8)})` : 'rgba(140,220,255,.7)'; ctx.lineWidth = nx ? 2.5 : 1.5; ctx.strokeRect(x0 + i * cw + 2, cy - 20, cw - 4, 40);
      if (s) this.drawShardAt(s, x0 + i * cw + cw / 2, cy, (cw + 4) / 74) }
    ctx.restore();
  },
  drawShardAt(s, X, Y, k) { const i = s.d === '−' ? 10 : +s.d, img = IM.shards[i]; ctx.drawImage(img, X - img.width * k / 2, Y - img.height * k / 2, img.width * k, img.height * k); if (s.d === '−') { ctx.fillStyle = '#bfefff'; ctx.fillRect(X - img.width * k * .26, Y - img.height * k * .06, img.width * k * .52, img.height * k * .13) } },
};
// перенос уравнения на строки под ширину панели
function wrapEq(t, maxW, size) {
  for (let s = size; s >= 14; s--) {
    ctx.font = `700 ${s}px ${FONT_EQ}`; const fit = p => ctx.measureText(p).width <= maxW; if (fit(t)) return { lines: [t], size: s };
    const parts = t.includes(';') ? t.split(/;\s*/) : t.includes(' = ') ? [t.slice(0, t.indexOf(' = ')), t.slice(t.indexOf(' = ') + 1)] : null;
    if (parts && parts.every(fit)) return { lines: parts, size: s };
    // по словам: не больше трёх строк
    const ws = t.split(' '), L = []; let cur = ''; for (const w of ws) { const nx = cur ? cur + ' ' + w : w; if (fit(nx)) cur = nx; else { if (cur) L.push(cur); cur = w } } if (cur) L.push(cur);
    if (L.length <= 3 && L.every(fit)) return { lines: L, size: s };
  }
  return { lines: [t], size: 13 };
}
