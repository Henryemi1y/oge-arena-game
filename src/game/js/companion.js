// companion.js — спутник: зелёный огонёк с глазом (покадровая анимация, 48 кадров). Следует за героем (или за душой),
// смотрит на ближайшую угрозу или осколок: зрачок ходит внутри белка, глаз моргает, при смене стороны огонёк
// разворачивается «через ребро». Сыплет зелёными искрами.
const Eye = {
  x: 0, z: .5, h: 200, vx: 0, vh: 0, look: 0, lookY: 0, t: 0, blink: 0, nb: 2,
  reset(x, z) { this.x = x; this.z = z; this.h = 220 },
  update(dt) {
    this.t += dt; const H = Hero.H, soul = Soul.on && Soul.ph !== 'off';
    let tx = soul ? Soul.x - Soul.face * 70 : H.x - Hero.FACE * 86, tz = soul ? Soul.z : H.z, th = soul ? Soul.h + 150 : Hero.height() + 48;
    // у монолита глаз отлетает в сторону и ниже: панель с ответом он не загораживает
    if (soul) { const mx = World.monolith.x, d = Soul.x - mx; if (Math.abs(d) < 300) { tx = mx + (d < 0 ? -1 : 1) * 270; th = 250 } }
    // мягкая пружина + парение
    this.vx += ((tx - this.x) * 18 - this.vx * 7) * dt; this.x += this.vx * dt; this.z = lp(this.z, tz, 1 - Math.exp(-dt * 5));
    const fh = th + 10 * Math.sin(this.t * 2.1); this.vh += ((fh - this.h) * 18 - this.vh * 7) * dt; this.h += this.vh * dt;
    // взгляд: ближайший враг, босс или (в форме души) ближайший осколок
    let best = null, bd = 1e9; const cand = [];
    for (const e of Enemies.list) if (e.st !== 'dead') cand.push([e.x, zy(e.z) - 120]);
    if (Boss.b) cand.push([Boss.b.x, zy(Boss.b.z) - 300]);
    if (soul) for (const s of Soul.shards) if (s.landed && !s.carried && !s.placed) cand.push([s.x, zy(s.z)]);
    const ey = zy(this.z) - this.h; for (const c of cand) { const d = Math.hypot(c[0] - this.x, c[1] - ey); if (d < bd) { bd = d; best = c } }
    const la = best ? Math.atan2(best[1] - ey, best[0] - this.x) : (Hero.FACE > 0 ? 0 : PI);
    this.look = lp(this.look, Math.cos(la), 1 - Math.exp(-dt * 6)); this.lookY = lp(this.lookY, Math.sin(la), 1 - Math.exp(-dt * 6));
    this.nb -= dt; if (this.nb < 0) { this.blink = .16; this.nb = rnd(2.5, 5) } this.blink = Math.max(0, this.blink - dt);
    if (Math.random() < .3) FX.ember(this.x + rnd(-14, 14), this.z, this.h + rnd(6, 30), IM.comp ? ['#d9ffe9', '#2fd88f'] : null);
    // сторона, куда смотрит огонёк: меняется с запасом (без дрожания), разворот за .18 с
    const want = this.look > .25 ? 1 : this.look < -.25 ? -1 : this.face || 1; if (want !== this.face) { this.face = want; this.turn = .18 } this.turn = Math.max(0, (this.turn || 0) - dt);
  },
  drawGreen() {
    const C = ASSETS.comp, I = IM.comp, X = sx(this.x), Y = zy(this.z) - this.h, t = this.t, q = .68 * zs(this.z);
    if (X < -120 || X > VW + 120) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(X, Y, 0, X, Y, 80); g.addColorStop(0, 'rgba(60,230,150,.26)'); g.addColorStop(1, 'rgba(30,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(X - 80, Y - 80, 160, 160); ctx.restore();
    const n = Math.floor(t * C.fps) % C.n, cx = (n % C.cols) * C.w, cy = Math.floor(n / C.cols) * C.h, f = this.face || 1;
    const tk = this.turn > 0 ? this.turn / .18 : 0, sxk = f * Math.max(.08, Math.abs(1 - 2 * tk)) * (tk > .5 ? -1 : 1);
    const [ex, ey, rx, ry] = C.eye;
    ctx.save(); ctx.translate(X, Y); ctx.rotate(cl(-this.vx * .0007, -.18, .18)); ctx.scale(sxk * q, q); ctx.translate(-ex, -ey);
    ctx.drawImage(I, cx, cy, C.w, C.h, 0, 0, C.w, C.h);
    // зрачок: к цели, внутри белка; в зеркале — в своих координатах
    const P = IM.compPupil, mx = rx - P.width * .42, my = ry - P.height * .42, lx = this.look * Math.sign(sxk), ly = this.lookY;
    ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, rx - .5, ry - .5, 0, 0, TAU); ctx.clip();
    ctx.drawImage(P, Math.round(ex + lx * mx * .8 - P.width / 2), Math.round(ey + ly * my * .7 - P.height / 2));
    // веко: сверху вниз и обратно (моргание .16 с)
    if (this.blink > 0) { const b = 1 - Math.abs(this.blink / .16 * 2 - 1), yl = ey - ry + 2 * ry * b; ctx.fillStyle = `rgb(${C.lid})`; ctx.fillRect(ex - rx - 2, ey - ry - 2, 2 * rx + 4, yl - (ey - ry) + 2); ctx.fillStyle = `rgb(${C.line})`; ctx.fillRect(ex - rx - 2, yl - 1.5, 2 * rx + 4, 3) }
    ctx.restore(); ctx.restore();
  },
  drawables(list) { list.push({ z: this.z + .003, draw: () => this.draw() }) },
  draw() {
    if (IM.comp) return this.drawGreen();
    const E = IM.eye, X = sx(this.x), Y = zy(this.z) - this.h, k = .24 * zs(this.z), t = this.t;
    if (X < -80 || X > VW + 80) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(X, Y, 0, X, Y, 70); g.addColorStop(0, 'rgba(70,150,255,.32)'); g.addColorStop(1, 'rgba(40,90,255,0)'); ctx.fillStyle = g; ctx.fillRect(X - 70, Y - 70, 140, 140); ctx.restore();
    // корона пламени: колышется (масштаб и наклон), второй слой — свечение
    const fw = E.flame.width * k * 1.35, fh = E.flame.height * k * 1.45, sy = 1 + .09 * Math.sin(t * 9) + .04 * Math.sin(t * 23), sxx = 1 + .05 * Math.sin(t * 7 + 1), sway = .06 * Math.sin(t * 3.3) - this.vx * .0006;
    ctx.save(); ctx.translate(X, Y + fh * .08); ctx.rotate(sway); ctx.scale(sxx, sy); ctx.drawImage(E.flame, -fw / 2, -fh * .55, fw, fh);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .6 + .2 * Math.sin(t * 13); ctx.scale(1.06, 1.12); ctx.drawImage(E.flame, -fw / 2, -fh * .56, fw, fh); ctx.restore();
    // глаз внутри оправы, зрачок поворачивается к цели
    const rw = E.ring.width * k, ir = rw * .36, ew = E.eye.width * k * .78, eh = E.eye.height * k * .78 * (this.blink > 0 ? .15 : 1);
    ctx.save(); ctx.beginPath(); ctx.arc(X, Y, ir, 0, TAU); ctx.clip(); ctx.fillStyle = '#0c1020'; ctx.fillRect(X - ir, Y - ir, 2 * ir, 2 * ir);
    ctx.translate(X + this.look * ir * .28, Y + this.lookY * ir * .25); if (this.look < 0) ctx.scale(-1, 1); ctx.drawImage(E.eye, -ew / 2, -eh / 2, ew, eh); ctx.restore();
    ctx.save(); ctx.translate(X, Y); ctx.rotate(t * .25); ctx.drawImage(E.ring, -rw / 2, -rw / 2, rw, rw); ctx.restore();
  },
};
