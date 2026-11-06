// enemies.js — враги на походках walker.js: гуль (быстрый, суетливый), падший рыцарь (тяжёлый удар мечом),
// чумной доктор (держит дистанцию, бросает склянки), козлорог (таран). Попадания считаются по геометрии рига.
function segDist(p1, p2, q1, q2) { // расстояние между отрезками на плоскости + ближайшая точка на первом
  const d1 = [p2[0] - p1[0], p2[1] - p1[1]], d2 = [q2[0] - q1[0], q2[1] - q1[1]], r = [p1[0] - q1[0], p1[1] - q1[1]];
  const a = d1[0] * d1[0] + d1[1] * d1[1], e = d2[0] * d2[0] + d2[1] * d2[1], f = d2[0] * r[0] + d2[1] * r[1];
  let s, t; if (a < 1e-9 && e < 1e-9) { s = t = 0 } else if (a < 1e-9) { s = 0; t = cl(f / e, 0, 1) } else {
    const c = d1[0] * r[0] + d1[1] * r[1]; if (e < 1e-9) { t = 0; s = cl(-c / a, 0, 1) } else { const b = d1[0] * d2[0] + d1[1] * d2[1], den = a * e - b * b; s = den > 1e-9 ? cl((b * f - c * e) / den, 0, 1) : 0; t = (b * s + f) / e; if (t < 0) { t = 0; s = cl(-c / a, 0, 1) } else if (t > 1) { t = 1; s = cl((b - c) / a, 0, 1) } } }
  const P = [p1[0] + d1[0] * s, p1[1] + d1[1] * s], Q = [q1[0] + d2[0] * t, q1[1] + d2[1] * t]; return { d: Math.hypot(P[0] - Q[0], P[1] - Q[1]), p: P };
}
const ETYPES = {
  ghoul: { hp: 30, dmg: 5, range: 112, wind: .38, strike: .12, rec: .45, cd: [1.3, 2.2], score: 10, pois: 0,
    wp: { ru: 1.0, rf: .5, lean: .12, far: -.6 }, sp: { ru: -1.85, rf: -2.25, lean: .38, far: .9, lunge: .22 } },
  knight: { hp: 70, dmg: 10, range: 150, wind: .7, strike: .15, rec: .7, cd: [1.8, 2.7], score: 25, poise: .5,
    wp: { ru: -2.75, rf: -3.35, lean: -.08, far: .3 }, sp: { ru: -1.05, rf: -1.3, lean: .2, far: -.3, lunge: .08 } },
  doctor: { hp: 36, dmg: 7, range: 520, wind: .6, strike: .12, rec: .55, cd: [2.4, 3.4], score: 20, ranged: 1,
    wp: { ru: 1.35, rf: 2.3, lean: -.12, far: -.4 }, sp: { ru: -2.4, rf: -2.7, lean: .18, far: .4, lunge: 0 } },
  goatman: { hp: 100, dmg: 14, range: 420, wind: .85, strike: 0, rec: 1.1, cd: [3.0, 4.2], score: 35, poise: 1, charge: 1,
    wp: { ru: .75, rf: .4, lean: .5, far: .75 }, sp: { ru: .5, rf: .2, lean: .55, far: .5, lunge: 0 } },
};
const Enemies = {
  list: [], proj: [], clouds: [],
  reset() { this.list = []; this.proj = []; this.clouds = [] },
  spawn(type, side) {
    const R = rigDef(type), T = ETYPES[type], x = World.gateX(side), z = .04;
    const c = Walker.create({ ...R, gait: R.gait, x: 0, face: side < 0 ? 1 : -1 });
    const e = { type, R, T, c, x, z, face: c.face, hp: T.hp, maxhp: T.hp, st: 'enter', t: 0, cd: rnd(.6, 1.4), flash: 0, alpha: 0, sMul: 1, kbv: 0, cloth: 0, clothv: 0, lunge: 0, slotZ: rnd(-.15, .15), id: Math.random() };
    e.pose = Walker.update(c, DT, { dir: 0 }); this.list.push(e); Snd.gate(); FX.smoke(x, z, 60, 8, '10,12,20', 40); return e;
  },
  alive() { return this.list.filter(e => e.st !== 'dead').length },
  // ---------- движение: путь ходьбы walker.js раскладывается на x и z ----------
  move(e, dt, tx, tz, opt = {}) {
    const dxp = tx - e.x, dzp = (tz - e.z) * ZPX, d = Math.hypot(dxp, dzp), c = e.c;
    let dir = 0; if (d > (opt.tol ?? 10)) dir = Math.abs(dxp) > 12 ? Math.sign(dxp) : e.face; if (opt.dir !== undefined) dir = opt.dir;
    const x0 = c.x; e.pose = Walker.update(c, dt, { dir: opt.hold ? 0 : dir, run: opt.run, speedK: opt.speedK, hold: opt.hold, runK: opt.runK, accK: opt.accK, lean: opt.lean, crouch: opt.crouch });
    e.face = c.face; const p = Math.abs(c.x - x0), s = e.R.scale * zs(e.z);
    // торможение у цели — по прежнему направлению (иначе тело уезжает вбок от стоящих стоп)
    let mdir = null; if (p > 0) { let ax, az; if (d > 6) { const n = Math.hypot(Math.abs(dxp), dzp); ax = Math.abs(dxp) / n; az = dzp / n; e.mv = { ax, az } } else ({ ax, az } = e.mv || { ax: 1, az: 0 }); e.x += p * s * e.face * ax; e.z = cl(e.z + p * s * az / ZPX, 0, 1); mdir = { x: e.face * ax, z: az } }
    depthLegs(e, mdir);
    for (const ev of c.events) { const R = e.R; if (c.g.heavy > .2) { Snd.step(ev.power * .5, 0); FX.dust(e.x, e.z, 2 + 4 * c.g.dust, .2 + .4 * c.g.dust) } }
    // одежда — пружина от скорости
    e.clothv += ((-c.v * .0012 - e.cloth) * 60 - e.clothv * 8) * dt; e.cloth += e.clothv * dt;
  },
  // ---------- ИИ ----------
  update(dt) {
    const h = Hero.H, side = { '-1': [], '1': [] };
    for (const e of this.list) if (e.st !== 'dead' && !e.T.ranged) side[e.x < h.x ? -1 : 1].push(e);
    for (const k in side) side[k].sort((a, b) => Math.abs(a.x - h.x) - Math.abs(b.x - h.x)).forEach((e, i) => e.slot = i);
    for (const e of this.list) this.think(e, dt);
    this.list = this.list.filter(e => e.st !== 'gone');
    this.updProj(dt);
  },
  think(e, dt) {
    const h = Hero.H, T = e.T; e.t += dt; e.flash = Math.max(0, e.flash - dt * 5); e.cd -= dt;
    // отброс — короткий подскок назад (ноги в воздухе), а не скольжение по полу
    if (e.kbv) { e.x += e.kbv * dt; e.kbv *= Math.exp(-dt * 10); e.dy = -Math.min(16, Math.abs(e.kbv) * .09); if (Math.abs(e.kbv) < 14) { e.kbv = 0; e.dy = 0 } }
    e.x = cl(e.x, W.GL, W.GR);
    const toH = h.x - e.x, adx = Math.abs(toH), dz = h.z - e.z, facing = Math.sign(toH) === e.face, target = h.soul ? null : h;
    let ov = null; // переопределение позы рук: {w, ...ключ}
    switch (e.st) {
      case 'enter': { e.alpha = Math.min(1, e.alpha + dt * 2); this.move(e, dt, e.x + (e.x < W.ARENA / 2 ? 200 : -200), .3 + e.slotZ); if (e.t > 1.1) { e.st = 'move'; e.t = 0 } break }
      case 'move': {
        let tx, tz = cl(h.z + (T.ranged ? 0 : (e.slot || 0) % 2 ? e.slotZ * .6 : 0), .03, 1), run = false;
        if (T.ranged) { const want = 360, sd = Math.sign(e.x - h.x) || 1; tx = h.x + sd * want; if (tx < W.XMIN || tx > W.XMAX) tx = h.x - sd * want; tz = cl(h.z + e.slotZ, .03, 1) }
        else if (T.charge) { const sd = Math.sign(e.x - h.x) || 1; tx = h.x + sd * 300 } else { const sd = Math.sign(e.x - h.x) || 1; tx = h.x + sd * (T.range * .78 + (e.slot || 0) * 70); run = adx > 420 && e.type === 'ghoul' }
        const close = !T.ranged && adx < T.range * .85 && Math.abs(dz) < .15 && (e.slot || 0) < 2;
        // уже рядом — не пятиться, а стоять лицом к герою (разворот короткими шагами)
        if (close) this.move(e, dt, e.x, tz, { dir: facing ? 0 : Math.sign(toH), speedK: .08, tol: 6 }); else this.move(e, dt, tx, tz, { run, tol: 14 });
        const inRange = T.ranged ? adx > 200 && adx < T.range : T.charge ? adx < T.range && adx > 150 && Math.abs(dz) < .14 : adx < T.range && Math.abs(dz) < .1;
        const busy = this.list.filter(o => o !== e && (o.st === 'wind' || o.st === 'strike')).length;
        if (target && e.cd <= 0 && inRange && facing && busy < 2 && (e.slot || 0) < 2 && Math.abs(e.c.v) < e.R.L1 * 3) { e.st = 'wind'; e.t = 0; e.aim = { x: h.x, z: h.z }; if (T.charge) Snd.whoosh() }
        break;
      }
      case 'wind': {
        this.move(e, dt, e.x, e.z, { hold: true }); ov = { k: 'wp', w: sm(e.t / T.wind) };
        if (T.charge) { e.dy = Math.sin(e.t * 40) * 1.5; e.aim = { x: h.x, z: h.z } }
        if (e.t >= T.wind) { e.st = 'strike'; e.t = 0; e.done = 0; e.dy = 0; if (T.charge) { e.chDir = Math.sign(e.aim.x - e.x) || e.face; e.chZ = e.aim.z; e.chEnd = e.aim.x + e.chDir * 160 } else Snd.swing(1) }
        break;
      }
      case 'strike': {
        if (T.charge) { // таран: бег по прямой через точку, где был герой
          this.move(e, dt, e.chEnd, e.chZ, { run: true, runK: 2.6, accK: 3, lean: .35 }); ov = { k: 'sp', w: 1 };
          if (!e.done && Math.abs(h.x - e.x) < 70 && Math.abs(h.z - e.z) < .11 && Hero.damage(T.dmg, e.x, 2.2)) { e.done = 1; FX.flash(h.x, h.z, 100, 80, '255,150,120') }
          if (Math.sign(e.chEnd - e.x) !== e.chDir || e.t > 1.6 || e.x <= W.XMIN || e.x >= W.XMAX) { e.st = 'rec'; e.t = 0; Cam.kick(4); FX.dust(e.x, e.z, 8, .6) }
          break;
        }
        this.move(e, dt, e.x, e.z, { hold: true }); ov = { k: 'sp', w: sm(e.t / T.strike) };
        if (e.t >= T.strike && !e.done) { e.done = 1; this.release(e) }
        if (e.t >= T.strike) { e.st = 'rec'; e.t = 0 }
        break;
      }
      case 'rec': { this.move(e, dt, e.x, e.z, { hold: true }); ov = { k: 'sp', w: 1 - sm(e.t / T.rec) }; if (e.t >= T.rec) { e.st = 'move'; e.t = 0; e.cd = rnd(...T.cd); e.flaskOut = 0 } break }
      case 'hurt': { this.move(e, dt, e.x, e.z, { hold: true }); if (e.t > .32) { e.st = 'move'; e.t = 0 } break }
      case 'dead': break;
    }
    // поза: руки и корпус к ключу атаки
    const po = e.pose; if (ov && ov.w > 0) { const K = T[ov.k], w = ov.w, a = po.arms[0], b = po.arms[1]; a.ru = lp(a.ru, K.ru, w); a.rf = lp(a.rf, K.rf, w); b.ru = lp(b.ru, K.far, w); b.rf = lp(b.rf, K.far - .4, w); po.lean += K.lean * w; e.lunge = (K.lunge || 0) * w } else e.lunge = 0;
    if (e.st === 'hurt') po.lean -= .25 * (1 - sm(e.t / .32));
    e.G = rigGeom(e);
  },
  // удар достигает цели: точка оружия (кисть/клинок) в момент удара проверяется по телу героя
  release(e) {
    const T = e.T, h = Hero.H;
    if (T.ranged) { // бросок склянки по баллистике в точку, где был герой
      e.flaskOut = 1; const hp = rigToWorld(e, e.G.arms[0].hand), x0 = hp.x, h0 = zy(e.z) - hp.y, tt = .85, a = e.aim;
      this.proj.push({ x: x0, z: e.z, h: h0, vx: (a.x - x0) / tt, vz: (a.z - e.z) / tt, vh: (0 - h0) / tt + .5 * 900 * tt, g: 900, t: 0, tt, r: 0, aim: a });
      FX.mark(a.x, a.z, tt + .05, '120,220,90', 46); Snd.flask(); return;
    }
    const G = e.G, xf = rigXf(e), pts = [];
    if (G.weapon) { const a = rigToWorld(e, G.weapon.at, xf), b = rigToWorld(e, G.weapon.tip, xf); pts.push([a, b]) }
    const hd = rigToWorld(e, G.arms[0].hand, xf), el = rigToWorld(e, G.arms[0].el, xf); pts.push([el, hd]);
    if (Math.abs(h.z - e.z) > .12 || h.soul) return;
    const hx = h.x, body = [[hx, zy(h.z) - 10], [hx, zy(h.z) - Hero.height() * .92]], R = 34 * zs(h.z);
    for (const [a, b] of pts) { const r = segDist([a.x + e.lunge * e.face * xf.s * 100, a.y], [b.x + e.lunge * e.face * xf.s * 100, b.y], body[0], body[1]); if (r.d < R) { if (Hero.damage(T.dmg, e.x, 1)) FX.sparks(r.p[0], h.z, zy(h.z) - r.p[1], 10, '255,120,100', 300); break } }
  },
  updProj(dt) {
    const h = Hero.H;
    for (const p of this.proj) { p.t += dt; p.x += p.vx * dt; p.z += p.vz * dt; p.h += p.vh * dt; p.vh -= p.g * dt; p.r += dt * 14;
      if (p.t >= p.tt) { p.dead = 1; Snd.glass(); FX.poison(p.x, p.z); FX.sparks(p.x, p.z, 6, 8, '150,230,120', 200); this.clouds.push({ x: p.x, z: p.z, t: 0, life: 2.6 });
        if (fdist(h.x, h.z, p.x, p.z) < 58 && !h.soul) Hero.damage(ETYPES.doctor.dmg, p.x, .6) } }
    this.proj = this.proj.filter(p => !p.dead);
    for (const c of this.clouds) { c.t += dt; if (Math.random() < .3) FX.poison(c.x + rnd(-20, 20), c.z); if (fdist(h.x, h.z, c.x, c.z) < 55 && c.t > .3 && !h.soul && Math.random() < dt * 2.5) Hero.damage(2, c.x, .1) }
    this.clouds = this.clouds.filter(c => c.t < c.life);
  },
  // ---------- попадание клинка героя ----------
  hurtCapsules(e) {
    const G = e.G, xf = rigXf(e), W_ = p => { const q = rigToWorld(e, p, xf); return [q.x, q.y] }, P = e.R.P, s = xf.s, caps = [];
    caps.push([W_([0, 0]), W_(G.neck), P.torso.w * .36 * s]);
    const hn = W_(G.neck); caps.push([hn, [hn[0], hn[1] - P.head.h * .6 * s], P.head.w * .3 * s]);
    for (const l of G.legs) { caps.push([W_(l.hip), W_(l.kn), P.legN.r * .9 * s]); caps.push([W_(l.kn), W_(l.an), P.legN.r * .7 * s]) }
    caps.push([W_(G.arms[0].sh), W_(G.arms[0].hand), P.armN.r * .8 * s]);
    return caps;
  },
  bladeHits(b) {
    let any = false;
    for (const e of this.list) {
      if (e.st === 'dead' || e.st === 'enter' && e.alpha < .7 || Math.abs(e.z - b.z) > .15 || Hero.H.hitSet.has(e)) continue;
      for (const [a, c, r] of this.hurtCapsules(e)) { const q = segDist([b.x1, b.y1], [b.x2, b.y2], a, c); if (q.d < r + 6) { this.damage(e, b, q.p); any = true; break } }
    }
    return any;
  },
  damage(e, b, at) {
    Hero.H.hitSet.add(e); const dmg = [14, 12, 13][b.ak] * (Hero.H.combo.n === 0 && b.ak === 2 ? 1.3 : 1);
    e.hp -= dmg; e.flash = 1; Snd.hit(); FX.sparks(at[0], e.z, zy(e.z) - at[1], 9, '120,30,40', 280); FX.flash(at[0], e.z, zy(e.z) - at[1], 46, '200,80,80', .12); Game.hitStop(.05); Cam.kick(3);
    e.kbv = Math.sign(e.x - Hero.H.x) * (e.T.poise ? 30 : 120);
    if (e.hp <= 0) return this.kill(e);
    if (!e.T.poise || (e.st === 'move' || e.st === 'wind') && Math.random() > e.T.poise) { if (e.st !== 'strike' || !e.T.charge) { e.st = 'hurt'; e.t = 0; e.flaskOut = 0 } }
  },
  kill(e) {
    e.st = 'dead'; Game.score += e.T.score; Snd.death();
    // персонаж рассыпается пеплом: рисуем его во внеэкранный холст и режем на куски
    const xf = rigXf(e), hgt = e.R.P.torso.h * 2.6 * xf.s, w = hgt * 1.3, x0 = xf.X - w / 2, y0 = zy(e.z) - hgt * 1.08;
    const cv = renderToCanvas(() => drawRig(e), x0, y0, w, hgt * 1.15);
    FX.shatter(cv, x0, y0, { grid: [6, 9], speed: 90, up: .4, life: 1.1, ash: 1, vx: Math.sign(e.x - Hero.H.x) * 60 });
    FX.smoke(e.x, e.z, hgt * .4, 10, '15,12,22', 38); e.st = 'gone';
  },
  // ---------- рисование ----------
  drawables(list) {
    for (const e of this.list) list.push({ z: e.z, draw: () => this.draw(e), shadow: () => drawShadow(e.x, e.z, 38 * (e.type === 'goatman' ? 1.3 : 1), .36 * e.alpha) });
    for (const p of this.proj) list.push({ z: p.z, draw: () => { const I = IM.ch.doctor.flask, x = sx(p.x), y = zy(p.z) - p.h, k = rigDef('doctor').scale * zs(p.z); ctx.save(); ctx.translate(x, y); ctx.rotate(p.r); ctx.drawImage(I, -I.width * k / 2, -I.height * k / 2, I.width * k, I.height * k); ctx.restore() } });
  },
  draw(e) {
    if (e.st === 'gone') return; if (!e.G) e.G = rigGeom(e);
    const xf = rigXf(e); ctx.save(); ctx.globalAlpha = e.alpha; ctx.translate(e.lunge * e.face * xf.s * 100, 0); drawRig(e);
    if (e.flash > 0) { ctx.globalAlpha = e.flash * .75 * e.alpha; drawRig(e, { v: 'W' }) }
    if (e.st === 'wind' && e.T.charge) { ctx.globalAlpha = .3 + .3 * Math.sin(e.t * 30); drawRig(e, { v: 'W', only: 'armN' }) }
    ctx.restore();
  },
};
