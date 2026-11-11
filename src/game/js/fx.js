// fx.js — частицы и эффекты: пыль (лист dust.png), трещины (cracks.png), ударные волны, искры, каменная крошка,
// угольки жаровен, ядовитые облака, «рассыпание» персонажей на куски (shatter), вспышки.
const FX = {
  P: [], rings: [], cracks: [], chunks: [], flashes: [], marks: [], nums: [], cuts: [], arcs: [],
  reset() { this.P = []; this.rings = []; this.cracks = []; this.chunks = []; this.flashes = []; this.marks = []; this.nums = []; this.cuts = []; this.arcs = [] },
  // ---- создание ----
  dust(x, z, n = 6, power = 1) {
    for (let i = 0; i < n; i++) this.P.push({ k: 'dust', x: x + rnd(-30, 30) * power, z: z + rnd(-.02, .02), h: rnd(0, 8), vx: rnd(-1, 1) * (60 + 220 * power), vz: rnd(-.05, .05), vh: rnd(10, 60) * power, t: 0, life: rnd(.4, .7) + .3 * power, s: (.3 + .45 * power) * rnd(.7, 1.2), g: -30 });
  },
  sparks(x, z, h, n = 10, col = '200,230,255', sp = 380) {
    for (let i = 0; i < n; i++) { const a = rnd(0, TAU), v = rnd(.3, 1) * sp; this.P.push({ k: 'spark', x, z, h, vx: Math.cos(a) * v, vz: 0, vh: Math.sin(a) * v * .8 + 60, t: 0, life: rnd(.15, .35), col, g: 900 }) }
  },
  chips(x, z, h, n = 8, sp = 300, col) {
    for (let i = 0; i < n; i++) { const a = rnd(-PI, 0), v = rnd(.3, 1) * sp; this.P.push({ k: 'chip', x, z: z + rnd(-.02, .02), h, vx: Math.cos(a) * v, vz: rnd(-.1, .1), vh: -Math.sin(a) * v, t: 0, life: rnd(.8, 1.6), s: rnd(2, 6), r: rnd(0, TAU), vr: rnd(-12, 12), col: col || pick(['#7b8090', '#5d6271', '#9ea3b0', '#4a4e5a']), g: 1100 }) }
  },
  // радиальные градиенты рисуются заранее в маленькие спрайты (дешевле, чем создавать градиент на каждую частицу)
  _sp: {},
  puff(col) { return this._sp['p' + col] || (this._sp['p' + col] = this._grad([[0, `rgba(${col},.9)`], [1, `rgba(${col},0)`]])) },
  glow(col) { return this._sp['g' + col] || (this._sp['g' + col] = this._grad([[0, 'rgba(255,255,255,.85)'], [.35, `rgba(${col},.45)`], [1, `rgba(${col},0)`]])) },
  _grad(stops) { const c = mkCanvas(64, 64), x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); for (const [o, v] of stops) g.addColorStop(o, v); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c },
  ember(x, z, h) { this.P.push({ k: 'ember', x, z, h, vx: rnd(-15, 15), vz: 0, vh: rnd(50, 110), t: 0, life: rnd(.5, 1.1), g: -20 }) },
  smoke(x, z, h, n = 6, col = '20,18,28', sz = 30) { for (let i = 0; i < n; i++) this.P.push({ k: 'smoke', x: x + rnd(-20, 20), z, h: h + rnd(-20, 20), vx: rnd(-40, 40), vz: 0, vh: rnd(20, 70), t: 0, life: rnd(.6, 1.2), s: sz * rnd(.6, 1.3), col, g: -10 }) },
  poison(x, z, n = 14) { for (let i = 0; i < n; i++) this.P.push({ k: 'smoke', a: .3, x: x + rnd(-44, 44), z: z + rnd(-.03, .03), h: rnd(0, 34), vx: rnd(-40, 40), vz: 0, vh: rnd(8, 46), t: 0, life: rnd(.9, 1.9), s: rnd(18, 36), col: pick(['62,120,58', '96,150,64', '40,84,52', '130,170,80']), g: -5 }) },
  soulMote(x, z, h, col) { this.P.push({ k: 'mote', col, x, z, h, vx: rnd(-20, 20), vz: 0, vh: rnd(15, 50), t: 0, life: rnd(.6, 1.2), g: -10 }) },
  ring(x, z, r1 = 220, life = .55, col = '200,215,240', w = 3) { this.rings.push({ x, z, r1, t: 0, life, col, w }) },
  crack(x, z, s = 1, life = 7) { this.cracks.push({ x, z, s, t: 0, life, i: (Math.random() * IM.cracks.length) | 0, flip: Math.random() < .5 }) },
  flash(x, z, h, r = 70, col = '170,215,255', life = .16) { this.flashes.push({ x, z, h, r, col, t: 0, life }) },
  // число урона: всплывает и гаснет
  num(x, z, h, text, col = '#ffffff', size = 20) { this.nums.push({ x: x + rnd(-10, 10), z, h, text: String(text), col, size, t: 0, life: .75, vx: rnd(-26, 26) }) },
  // росчерк попадания: узкая светлая «линза» под углом удара
  cut(x, z, h, ang, len = 90, col = '255,255,255', life = .14) { this.cuts.push({ x, z, h, ang, len, col, t: 0, life }) },
  // серп взмаха (когти, меч врага): дуга от a0 до a1 вокруг точки, толще в середине; углы — экранные
  arc(x, z, h, r, a0, a1, col = '255,255,255', life = .2) { this.arcs.push({ x, z, h, r, a0, a1, col, t: 0, life }) },
  mark(x, z, life, col = '255,90,60', r = 60) { const m = { x, z, t: 0, life, col, r }; this.marks.push(m); return m },
  // рассыпать готовое изображение (offscreen canvas) на куски: камень — тяжёлые обломки, пепел — лёгкие, тают
  shatter(cv, x0, y0, opt = {}) {
    const n = opt.grid || [5, 8], cw = cv.width / n[0], ch = cv.height / n[1], cx = opt.cx ?? cv.width / 2, cy = opt.cy ?? cv.height / 2, cxt = cv.getContext('2d');
    let data; try { data = cxt.getImageData(0, 0, cv.width, cv.height).data } catch (e) { data = null }
    for (let i = 0; i < n[0]; i++) for (let j = 0; j < n[1]; j++) {
      const sx0 = i * cw, sy0 = j * ch;
      if (data) { // пропустить пустые клетки
        let any = 0; for (let yy = sy0 | 0; yy < sy0 + ch && !any; yy += 4) for (let xx = sx0 | 0; xx < sx0 + cw; xx += 4) if (data[((yy | 0) * cv.width + (xx | 0)) * 4 + 3] > 40) { any = 1; break }
        if (!any) continue;
      }
      const pad = 6, c = mkCanvas(cw + 2 * pad, ch + 2 * pad), x = c.getContext('2d'), j1 = () => rnd(-pad, pad);
      x.beginPath(); x.moveTo(pad + j1(), pad + j1()); x.lineTo(pad + cw + j1(), pad + j1()); x.lineTo(pad + cw + j1(), pad + ch + j1()); x.lineTo(pad + j1(), pad + ch + j1()); x.closePath(); x.clip();
      x.drawImage(cv, sx0 - pad, sy0 - pad, cw + 2 * pad, ch + 2 * pad, 0, 0, cw + 2 * pad, ch + 2 * pad);
      const px = sx0 + cw / 2, py = sy0 + ch / 2, a = Math.atan2(py - cy, px - cx), sp = (opt.speed || 260) * rnd(.4, 1.1);
      this.chunks.push({ c, wx: x0 + px + Cam.x, y: y0 + py, vx: Math.cos(a) * sp + (opt.vx || 0) + rnd(-40, 40), vy: Math.sin(a) * sp * .6 - rnd(80, 260) * (opt.up ?? 1), r: 0, vr: rnd(-6, 6), t: 0,
        life: (opt.life || 1.2) * rnd(.7, 1.2), gy: opt.ground ?? (y0 + cv.height), g: opt.g ?? 1300, ash: opt.ash, w: cw + 2 * pad, h: ch + 2 * pad });
    }
  },
  // ---- шаг ----
  step(dt) {
    for (const p of this.P) {
      p.t += dt; p.x += p.vx * dt; p.z += p.vz * dt; p.h += p.vh * dt; p.vh -= p.g * dt;
      if (p.k === 'chip' && p.h < 0) { p.h = 0; p.vh *= -.35; p.vx *= .6; p.vr *= .6 } if (p.k === 'chip') p.r += p.vr * dt;
      if (p.k === 'dust') { p.vx *= Math.exp(-dt * 3) } if (p.k === 'smoke') p.vx *= Math.exp(-dt * 2);
    }
    this.P = this.P.filter(p => p.t < p.life);
    for (const r of this.rings) r.t += dt; this.rings = this.rings.filter(r => r.t < r.life);
    for (const c of this.cracks) c.t += dt; this.cracks = this.cracks.filter(c => c.t < c.life);
    for (const f of this.flashes) f.t += dt; this.flashes = this.flashes.filter(f => f.t < f.life);
    for (const m of this.marks) m.t += dt; this.marks = this.marks.filter(m => m.t < m.life && !m.dead);
    for (const k of ['nums', 'cuts', 'arcs']) { for (const o of this[k]) o.t += dt; this[k] = this[k].filter(o => o.t < o.life) }
    for (const n of this.nums) { n.x += n.vx * dt; n.h += (70 - 90 * n.t / n.life) * dt }
    for (const c of this.chunks) {
      c.t += dt; c.wx += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt;
      if (c.ash) { c.vy -= 120 * dt; c.vx *= Math.exp(-dt * 2); c.vy *= Math.exp(-dt * 2) } else { c.vy += c.g * dt; if (c.y > c.gy) { c.y = c.gy; c.vy *= -.25; c.vx *= .55; c.vr *= .5 } }
    }
    this.chunks = this.chunks.filter(c => c.t < c.life);
    if (this.P.length > 1400) this.P.splice(0, this.P.length - 1400);
  },
  // ---- рисование ----
  drawGround() {
    for (const c of this.cracks) { const img = IM.cracks[c.i], x = sx(c.x), y = zy(c.z), k = .55 * c.s * zs(c.z), a = c.t < c.life - 1.5 ? 1 : (c.life - c.t) / 1.5; if (x < -300 || x > VW + 300) continue; ctx.save(); ctx.globalAlpha = a * .95; ctx.translate(x, y); ctx.scale(c.flip ? -1 : 1, .55); ctx.drawImage(img, -img.width * k / 2, -img.height * k / 2, img.width * k, img.height * k); ctx.restore() }
    for (const m of this.marks) { // метка прицела босса на полу
      const x = sx(m.x), y = zy(m.z), k = m.t / m.life, pulse = .6 + .4 * Math.sin(m.t * 14), r = m.r * zs(m.z) * (1.15 - .25 * k);
      ctx.save(); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(${m.col},${.5 + .4 * pulse})`; ctx.fillStyle = `rgba(${m.col},${.10 + .12 * k})`;
      ctx.beginPath(); ctx.ellipse(x, y, r, r * .3, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, y, r * (1 - k), r * .3 * (1 - k), 0, 0, TAU); ctx.stroke(); ctx.restore();
    }
    for (const r of this.rings) { const x = sx(r.x), y = zy(r.z), k = r.t / r.life, rr = 20 + r.r1 * sm(k); ctx.strokeStyle = `rgba(${r.col},${.55 * (1 - k)})`; ctx.lineWidth = r.w * (1 - k * .5); ctx.beginPath(); ctx.ellipse(x, y, rr, rr * .27, 0, 0, TAU); ctx.stroke() }
  },
  drawAir() {
    const DI = IM.dust, fw = DI.width / 6;
    for (const p of this.P) {
      const x = sx(p.x), y = zy(p.z) - p.h, k = p.t / p.life; if (x < -100 || x > VW + 100) continue;
      if (p.k === 'dust') { const f = Math.min(5, (k * 6) | 0), sz = DI.height * p.s * (1 + k * .8); ctx.globalAlpha = .8 * (1 - k * .7); ctx.drawImage(DI, f * fw, 0, fw, DI.height, x - sz / 2, y - sz * .75, sz, sz) }
      else if (p.k === 'spark') { ctx.globalAlpha = 1 - k; ctx.strokeStyle = `rgb(${p.col})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - p.vx * .03, y + p.vh * .03); ctx.stroke() }
      else if (p.k === 'chip') { ctx.globalAlpha = Math.min(1, (1 - k) * 3); ctx.fillStyle = p.col; ctx.save(); ctx.translate(x, y); ctx.rotate(p.r); ctx.fillRect(-p.s, -p.s * .7, p.s * 2, p.s * 1.4); ctx.restore() }
      else if (p.k === 'ember') { ctx.globalAlpha = 1 - k; ctx.fillStyle = k < .5 ? '#bfe6ff' : '#4d8dff'; ctx.fillRect(x - 1.5, y - 1.5, 3, 3) }
      else if (p.k === 'mote') { ctx.globalAlpha = (1 - k) * .9; ctx.fillStyle = p.col || '#b8f6ff'; ctx.fillRect(x - 1.5, y - 1.5, 3, 3) }
      else if (p.k === 'smoke') { const r = p.s * (1 + k); ctx.globalAlpha = (p.a || .4) * (1 - k) * Math.min(1, p.t * 6); ctx.drawImage(this.puff(p.col), x - r, y - r, 2 * r, 2 * r) }
    }
    ctx.globalAlpha = 1;
    for (const c of this.chunks) { const x = c.wx - Cam.x, k = c.t / c.life; ctx.save(); ctx.globalAlpha = c.ash ? (1 - k) * .9 : Math.min(1, (1 - k) * 4); ctx.translate(x, c.y); ctx.rotate(c.r); if (c.ash) ctx.scale(1 - k * .6, 1 - k * .6); ctx.drawImage(c.c, -c.w / 2, -c.h / 2); ctx.restore() }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const f of this.flashes) { const a = 1 - f.t / f.life, x = sx(f.x), y = zy(f.z) - f.h, r = f.r * (1 + .8 * (1 - a)); ctx.globalAlpha = a; ctx.drawImage(this.glow(f.col), x - r, y - r, 2 * r, 2 * r); ctx.globalAlpha = 1 }
    for (const c of this.cuts) { // росчерк: вытягивается и тает
      const k = c.t / c.life, x = sx(c.x), y = zy(c.z) - c.h, L = c.len * (.45 + .55 * sm(k * 2.2)), wd = 7 * (1 - k); ctx.save(); ctx.translate(x, y); ctx.rotate(c.ang); ctx.globalAlpha = 1 - k * k;
      ctx.fillStyle = `rgb(${c.col})`; ctx.beginPath(); ctx.moveTo(-L, 0); ctx.quadraticCurveTo(0, -wd, L, 0); ctx.quadraticCurveTo(0, wd, -L, 0); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-L * .7, 0); ctx.quadraticCurveTo(0, -wd * .4, L * .7, 0); ctx.quadraticCurveTo(0, wd * .4, -L * .7, 0); ctx.fill(); ctx.restore() }
    for (const a of this.arcs) { // серп: внешняя дуга и более пологая внутренняя, сходятся на концах
      const k = a.t / a.life, x = sx(a.x), y = zy(a.z) - a.h, S = a.a1 - a.a0, e1 = a.a0 + S * Math.min(1, .35 + k * 1.6), e0 = a.a0 + S * sm(Math.max(0, k * 1.5 - .5)) * .8, h2 = Math.abs(e1 - e0) / 2; if (h2 < .05) continue;
      const mid = (e0 + e1) / 2, c = a.r * Math.sin(h2), r2 = Math.max(c * 1.02, a.r * 1.45), d2 = Math.sqrt(r2 * r2 - c * c), cm = a.r * Math.cos(h2), cx2 = x + Math.cos(mid) * (cm - d2), cy2 = y + Math.sin(mid) * (cm - d2);
      const p0 = [x + Math.cos(e0) * a.r, y + Math.sin(e0) * a.r], p1 = [x + Math.cos(e1) * a.r, y + Math.sin(e1) * a.r];
      ctx.globalAlpha = (1 - k) * .9; ctx.fillStyle = `rgb(${a.col})`; ctx.beginPath(); ctx.arc(x, y, a.r, e0, e1, S < 0); ctx.arc(cx2, cy2, r2, Math.atan2(p1[1] - cy2, p1[0] - cx2), Math.atan2(p0[1] - cy2, p0[0] - cx2), S > 0); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1 }
    ctx.restore();
    // числа урона — поверх всего в мире
    for (const n of this.nums) { const k = n.t / n.life, x = sx(n.x), y = zy(n.z) - n.h, sc = 1 + .5 * Math.max(0, 1 - n.t / .09); ctx.globalAlpha = Math.min(1, (1 - k) * 2.5); ctx.font = `700 ${Math.round(n.size * sc)}px ${FONT_TITLE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(8,8,16,.85)'; ctx.strokeText(n.text, x, y); ctx.fillStyle = n.col; ctx.fillText(n.text, x, y) }
    ctx.globalAlpha = 1;
  },
};
