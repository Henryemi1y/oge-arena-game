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
  ghoul: { hp: 40, dmg: 5, range: 250, stand: 150, pounce: 175, wind: .5, strike: .2, rec: .55, cd: [1.7, 2.7], score: 10, pois: 0,
    wp: { ru: 1.05, rf: .35, lean: .2, far: .9, crouch: .34, lunge: -.3 }, sp: { ru: -1.75, rf: -2.05, lean: .5, far: -1.3, lunge: .5, crouch: .1 } },
  knight: { hp: 88, dmg: 10, range: 168, wind: .7, strike: .15, rec: .7, cd: [1.6, 2.4], score: 25, poise: .5,
    wp: { ru: -2.75, rf: -3.35, lean: -.1, far: .3, crouch: .03 }, sp: { ru: -.72, rf: -.86, lean: .3, far: -.3, lunge: .16, crouch: .14 } },
  doctor: { hp: 30, dmg: 8, range: 520, wind: .6, strike: .12, rec: .55, cd: [2.1, 3.0], score: 20, ranged: 1,
    wp: { ru: 1.35, rf: 2.3, lean: -.14, far: -.4, crouch: .04 }, sp: { ru: -2.4, rf: -2.7, lean: .2, far: .4, lunge: .06, crouch: .03 } },
  goatman: { hp: 125, dmg: 14, range: 440, wind: .85, strike: 0, rec: 1.1, cd: [2.6, 3.7], score: 35, poise: 1, charge: 1,
    wp: { ru: .75, rf: .4, lean: .5, far: .75 }, sp: { ru: .5, rf: .2, lean: .55, far: .5, lunge: 0 } },
};
const Enemies = {
  list: [], proj: [], clouds: [],
  reset() { this.list = []; this.proj = []; this.clouds = [] },
  spawn(type, side) {
    const R = rigDef(type), T = ETYPES[type], x = World.gateX(side), z = .04;
    const c = Walker.create({ ...R, gait: R.gait, x: 0, face: side < 0 ? 1 : -1 }); c.t = rnd(0, 9);
    const e = { type, R, T, c, x, z, face: c.face, hp: T.hp, maxhp: T.hp, st: 'enter', t: 0, cd: rnd(.6, 1.4), flash: 0, alpha: 0, sMul: rnd(.93, 1.07), kbv: 0, cloth: 0, clothv: 0, lunge: 0, slotZ: rnd(-.15, .15), id: Math.random() };
    e.pose = Walker.update(c, DT, { dir: 0 }); this.list.push(e); Snd.gate(); FX.smoke(x, z, 60, 8, '10,12,20', 40); return e;
  },
  alive() { return this.list.filter(e => e.st !== 'dead').length },
  // ---------- движение: путь ходьбы walker.js раскладывается на x и z ----------
  move(e, dt, tx, tz, opt = {}) {
    const dxp = tx - e.x, dzp = (tz - e.z) * ZPX, d = Math.hypot(dxp, dzp), c = e.c;
    let dir = 0; if (d > (opt.tol ?? 10)) dir = Math.abs(dxp) > 12 ? Math.sign(dxp) : e.face; if (opt.dir !== undefined) dir = opt.dir;
    const x0 = c.x; e.pose = Walker.update(c, dt, { dir: opt.hold ? 0 : dir, run: opt.run, speedK: opt.speedK, hold: opt.hold, runK: opt.runK, accK: opt.accK, lean: opt.lean, crouch: opt.crouch });
    e.face = c.face; turnTick(e, dt, .16); const p = Math.abs(c.x - x0), s = e.R.scale * zs(e.z);
    // торможение у цели — по прежнему направлению (иначе тело уезжает вбок от стоящих стоп);
    // цель чуть позади (ход в глубину) — шаг с малым смещением назад, без разворота
    let mdir = null; if (p > 0) { let ax, az; if (d > 6) { const n = Math.hypot(Math.abs(dxp), dzp); ax = (Math.abs(dxp) > 12 ? Math.abs(dxp) : dxp * e.face) / n; az = dzp / n; e.mv = { ax, az } } else ({ ax, az } = e.mv || { ax: 1, az: 0 }); e.x += p * s * e.face * ax; e.z = cl(e.z + p * s * az / ZPX, 0, 1); mdir = { x: e.face * ax, z: az } }
    depthLegs(e, mdir);
    for (const ev of c.events) { if (c.g.heavy > .2) { Snd.step(ev.power * .5, 0); if ((e.R.size || 1) > 1.3 && Math.abs(c.v) > e.R.L1) FX.dust(e.x, e.z, 2 + 4 * c.g.dust, .2 + .4 * c.g.dust) } else if (Math.abs(e.x - Hero.H.x) < 600 && Math.random() < .6) Snd.step(.05, 0) }
    // одежда — пружина от скорости
    e.clothv += ((-c.v * .0012 - e.cloth) * 60 - e.clothv * 8) * dt; e.cloth += e.clothv * dt;
  },
  // ---------- ИИ ----------
  update(dt) {
    const h = Hero.H, side = { '-1': [], '1': [] };
    for (const e of this.list) if (e.st !== 'dead' && e.st !== 'dying' && !e.T.ranged) side[e.x < h.x ? -1 : 1].push(e);
    for (const k in side) side[k].sort((a, b) => Math.abs(a.x - h.x) - Math.abs(b.x - h.x)).forEach((e, i) => e.slot = i);
    for (const e of this.list) this.think(e, dt);
    this.list = this.list.filter(e => e.st !== 'gone');
    this.updProj(dt);
  },
  think(e, dt) {
    const h = Hero.H, T = e.T; e.t += dt; e.flash = Math.max(0, e.flash - dt * 9); e.hpT = Math.max(0, (e.hpT || 0) - dt); e.cd -= dt;
    // отброс — короткий подскок назад (ноги в воздухе), а не скольжение по полу
    if (e.kbv) { e.x += e.kbv * dt; e.kbv *= Math.exp(-dt * 10); e.dy = -Math.min(16, Math.abs(e.kbv) * .09); if (Math.abs(e.kbv) < 14) { e.kbv = 0; e.dy = 0 } }
    e.x = cl(e.x, W.GL, W.GR);
    const toH = h.x - e.x, adx = Math.abs(toH), dz = h.z - e.z, facing = Math.sign(toH) === e.face, target = h.soul ? null : h;
    let ov = null; // переопределение позы рук: {w, ...ключ}
    switch (e.st) {
      case 'enter': { e.alpha = Math.min(1, e.alpha + dt * 2); this.move(e, dt, e.x + (e.x < W.ARENA / 2 ? 200 : -200), .3 + e.slotZ); if (e.t > 1.1) { e.st = 'move'; e.t = 0 } break }
      case 'move': {
        let tx, tz = cl(h.z + (T.ranged ? 0 : (e.slot || 0) % 2 ? e.slotZ * .6 : 0), .03, 1), run = false; const stand = T.stand || Math.max(T.range * .84, 104 * (e.R.size || 1));
        if (T.ranged) { const want = 360, sd = Math.sign(e.x - h.x) || 1; tx = h.x + sd * want; if (tx < W.XMIN || tx > W.XMAX) tx = h.x - sd * want; tz = cl(h.z + e.slotZ, .03, 1);
          const flee = adx < want - 60; e.flee = flee ? (e.flee || 0) + dt : Math.max(0, (e.flee || 0) - dt * .5); if (e.flee > 1.5) { e.stand = 4; e.flee = 0 } if (e.stand > 0) { e.stand -= dt; tx = e.x } }
        else if (T.charge) { const sd = Math.sign(e.x - h.x) || 1; tx = h.x + sd * 300 } else { const sd = Math.sign(e.x - h.x) || 1; tx = h.x + sd * (stand + (e.slot || 0) * 75) }
        // издалека все спешат (рыцарь — тяжёлой рысью): бой начинается быстрее; вблизи — своя походка
        e.hurry = adx > (e.hurry ? 400 : 540); run = e.hurry; const runK = { knight: 1.75, goatman: 1.5 }[e.type];
        const close = !T.ranged && adx < stand * 1.02 && Math.abs(dz) < .15 && (e.slot || 0) < 2;
        // уже рядом — не пятиться, а стоять лицом к герою (разворот короткими шагами)
        // (стрелок, дошедший до своей дистанции спиной к герою, тоже разворачивается — иначе он так и стоит, не бросая)
        const there = T.ranged && Math.abs(tx - e.x) < 18 && Math.abs(tz - e.z) < .05;
        if (close || there) this.move(e, dt, e.x, tz, { dir: facing ? 0 : Math.sign(toH), speedK: .08, tol: 6 }); else this.move(e, dt, tx, tz, { run, runK, tol: 14 });
        // слишком близко к герою (его отбросило на врага) — короткий отскок назад, не разворачиваясь
        e.bsT = Math.max(0, (e.bsT || 0) - dt); if (!T.ranged && adx < 66 * (e.R.size || 1) && Math.abs(dz) < .1 && !e.kbv && !e.bsT) { e.kbv = (Math.sign(e.x - h.x) || -e.face) * 300; e.bsT = .8 }
        const inRange = T.ranged ? adx > 110 && adx < T.range : T.charge ? adx < T.range && adx > 150 && Math.abs(dz) < .14 : adx < T.range && Math.abs(dz) < .1;
        const busy = this.list.filter(o => o !== e && (o.st === 'wind' || o.st === 'strike')).length;
        if (target && e.cd <= 0 && inRange && facing && busy < (Game.pi < 2 ? 1 : 2) && (e.slot || 0) < 2 && Math.abs(e.c.v) < e.R.L1 * 3) { e.st = 'wind'; e.t = 0; e.aim = { x: h.x, z: h.z }; if (T.charge) Snd.whoosh(); else Snd.tell(); if (e.G) { const hp = rigToWorld(e, e.G.arms[0].hand); FX.flash(hp.x, e.z, zy(e.z) - hp.y, 34, '255,236,190', .14) } }
        break;
      }
      case 'wind': {
        this.move(e, dt, e.x, e.z, { hold: true, crouch: (T.wp.crouch || 0) * sm(e.t / T.wind) }); ov = { k: 'wp', w: sm(e.t / T.wind) };
        if (T.charge) { e.dy = Math.sin(e.t * 40) * 1.5; e.aim = { x: h.x, z: h.z } }
        if (e.t >= T.wind) { e.st = 'strike'; e.t = 0; e.done = 0; e.dy = 0; if (T.charge) { e.chDir = Math.sign(e.aim.x - e.x) || e.face; e.chZ = e.aim.z; e.chEnd = e.aim.x + e.chDir * 160 } else { Snd.swing(1); if (T.pounce) e.pn = { x0: e.x, d: (Math.sign(e.aim.x - e.x) || e.face) * cl(Math.abs(e.aim.x - e.x) - 92, 0, T.pounce) }; else this.swipe(e) } }
        break;
      }
      case 'strike': {
        if (T.charge) { // таран: бег по прямой через точку, где был герой
          this.move(e, dt, e.chEnd, e.chZ, { run: true, runK: 2.6, accK: 3, lean: .35 }); ov = { k: 'sp', from: 'wp', w: sm(Math.min(1, e.t / .12)) };
          if (!e.done && Math.abs(h.x - e.x) < 70 && Math.abs(h.z - e.z) < .11) { const r = Hero.damage(T.dmg, e.x, 2.2, { e }); if (r) e.done = 1; if (r === true) FX.flash(h.x, h.z, 100, 80, '255,150,120') }
          if (e.st === 'strike' && (Math.sign(e.chEnd - e.x) !== e.chDir || e.t > 1.6 || e.x <= W.XMIN || e.x >= W.XMAX)) { e.st = 'rec'; e.t = 0; Cam.kick(4); FX.dust(e.x, e.z, 8, .6) }
          break;
        }
        if (e.pn) { const u = cl(e.t / T.strike, 0, 1); e.x = cl(e.pn.x0 + e.pn.d * sm(u), W.XMIN, W.XMAX); e.dy = -Math.sin(PI * u) * 22; if (!e.pn.sw && u > .55) { e.pn.sw = 1; this.swipe(e) } }
        this.move(e, dt, e.x, e.z, { hold: true, crouch: lp(T.wp.crouch || 0, T.sp.crouch || 0, sm(e.t / T.strike)) }); ov = { k: 'sp', from: 'wp', w: sm(Math.max(0, e.t / T.strike - (e.pn ? .45 : 0)) / (e.pn ? .55 : 1)) };
        if (e.t >= T.strike && !e.done) { e.done = 1; this.release(e) }
        if (e.t >= T.strike && e.pn) { e.pn = null; e.dy = 0; FX.dust(e.x, e.z, 3, .3) }
        if (e.t >= T.strike && e.st === 'strike') { e.st = 'rec'; e.t = 0 }
        break;
      }
      case 'rec': { this.move(e, dt, e.x, e.z, { hold: true, crouch: (T.sp.crouch || 0) * (1 - sm(e.t / T.rec)) }); ov = { k: 'sp', w: 1 - sm(e.t / T.rec) }; if (e.t >= T.rec) { e.st = 'move'; e.t = 0; e.cd = rnd(...T.cd); e.flaskOut = 0 } break }
      case 'stun': { // удар отбит: враг отшатнулся и открыт для ответного удара
        this.move(e, dt, e.x, e.z, { hold: true, crouch: .12 * (1 - sm(e.t / 1.1)) }); e.stunFx = (e.stunFx || 0) + dt;
        if (e.stunFx > .22) { e.stunFx = 0; FX.sparks(e.x + rnd(-14, 14), e.z, e.R.size * 205 * zs(e.z), 2, '255,214,120', 50) }
        if (e.t > 1.1) { e.st = 'move'; e.t = 0; e.cd = rnd(.4, .9) } break }
      case 'hurt': { this.move(e, dt, e.x, e.z, { hold: true }); if (e.t > .32) { e.st = 'move'; e.t = 0 } break }
      case 'dying': { this.move(e, dt, e.x, e.z, { hold: true, crouch: .3 * sm(e.t / .38) }); e.pose.lean -= .55 * sm(e.t / .38); e.pose.arms.forEach((a, i) => { a.ru = lp(a.ru, i ? .9 : .6, sm(e.t / .38)); a.rf = a.ru - .4 }); if (e.t > .38) { e.G = rigGeom(e); this.ash(e) } break }
      case 'dead': break;
    }
    // поза: руки и корпус к ключу атаки
    const po = e.pose; if (ov && (ov.w > 0 || ov.from)) { // удар идёт из позы замаха (а не из обычной позы — иначе рука на кадр «отскакивает»)
      const K = T[ov.k], K0 = ov.from ? T[ov.from] : null, w = ov.w, a = po.arms[0], b = po.arms[1], f = (x, k0, k1) => K0 ? lp(k0, k1, w) : lp(x, k1, w);
      a.ru = f(a.ru, K0 && K0.ru, K.ru); a.rf = f(a.rf, K0 && K0.rf, K.rf); b.ru = f(b.ru, K0 && K0.far, K.far); b.rf = f(b.rf, K0 && K0.far - .4, K.far - .4);
      po.lean += K0 ? lp(K0.lean, K.lean, w) : K.lean * w; e.lunge = K0 ? lp(K0.lunge || 0, K.lunge || 0, w) : (K.lunge || 0) * w } else e.lunge = 0;
    limitArms(e, dt, e.st === 'strike' ? .45 : .3);
    e.hx = e.lunge * (e.R.L1 + e.R.L2) * .4; if (e.hx) po.legs = po.legs.map(l => ({ ...l, ...Walker.ik2(l.ax - e.hx, l.ay, e.R.L1, e.R.L2, e.c.g.digi ? -1 : 1) }));
    if (e.st === 'hurt') { const k = 1 - sm(e.t / .32); po.lean -= .42 * k; po.arms.forEach((a, i) => { a.ru = lp(a.ru, i ? .5 : .9, k * .8); a.rf = lp(a.rf, i ? .1 : .3, k * .8) }) }
    if (e.st === 'stun') { const k = 1 - sm(Math.max(0, e.t - .55) / .55); po.lean -= .4 * k; po.arms.forEach((a, i) => { a.ru = lp(a.ru, i ? .55 : .85, k); a.rf = lp(a.rf, i ? .15 : .35, k) }) }
    e.G = rigGeom(e);
  },
  // серп взмаха: дуга вокруг плеча — сверху-сзади вперёд-вниз (когти гуля бледные, меч рыцаря светлый, длиннее)
  swipe(e) {
    if (e.T.ranged || !e.G) return; const G = e.G, xf = rigXf(e), sh = rigToWorld(e, G.arms[0].sh, xf), tip = rigToWorld(e, G.weapon ? G.weapon.tip : G.arms[0].hand, xf), hd = rigToWorld(e, G.arms[0].hand, xf);
    const r = Math.max(Math.hypot(tip.x - sh.x, tip.y - sh.y), Math.hypot(hd.x - sh.x, hd.y - sh.y) * 1.25) * 1.02, f = e.face, a0 = f > 0 ? -2.0 : PI + 2.0, a1 = f > 0 ? .75 : PI - .75;
    FX.arc(sh.x, e.z, zy(e.z) - sh.y, r, a0, a1, e.type === 'knight' ? '235,240,255' : '225,235,190', e.type === 'knight' ? .24 : .2);
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
    for (const [a, b] of pts) { const r = segDist([a.x, a.y], [b.x, b.y], body[0], body[1]); if (r.d < R) { if (Hero.damage(T.dmg, e.x, 1, { e }) === true) FX.sparks(r.p[0], h.z, zy(h.z) - r.p[1], 10, '255,120,100', 300); break } }
  },
  updProj(dt) {
    const h = Hero.H;
    for (const p of this.proj) { p.t += dt; p.x += p.vx * dt; p.z += p.vz * dt; p.h += p.vh * dt; p.vh -= p.g * dt; p.r += dt * 14; if (Math.random() < dt * 50) FX.soulMote(p.x, p.z, p.h, '#a8f08a');
      if (p.t >= p.tt) { p.dead = 1; Snd.glass(); const near = fdist(h.x, h.z, p.x, p.z) < 58 && !h.soul, r = near ? Hero.damage(ETYPES.doctor.dmg, p.x, .6, { proj: p, fx: p.x - Math.sign(p.vx || 1) * 90 }) : false;
        if (r === 'parry') { FX.sparks(p.x, p.z, 60, 10, '150,230,120', 300); continue }
        FX.poison(p.x, p.z); FX.sparks(p.x, p.z, 6, 8, '150,230,120', 200); this.clouds.push({ x: p.x, z: p.z, t: 0, life: 2.6 }) } }
    this.proj = this.proj.filter(p => !p.dead);
    // облако держится ~50 клубами, а не сотнями
    for (const c of this.clouds) { c.t += dt; if (Math.random() < dt * 9) FX.poison(c.x + rnd(-20, 20), c.z, 3); if (fdist(h.x, h.z, c.x, c.z) < 55 && c.t > .3 && !h.soul && Math.random() < dt * 2.5) Hero.damage(2, c.x, .1) }
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
      if (!e.G || e.st === 'dead' || e.st === 'dying' || e.st === 'gone' || e.st === 'enter' && e.alpha < .7 || Math.abs(e.z - b.z) > .15 || Hero.H.hitSet.has(e)) continue;
      for (const [a, c, r] of this.hurtCapsules(e)) { const q = segDist([b.x1, b.y1], [b.x2, b.y2], a, c); if (q.d < r + 6) { this.damage(e, b, q.p); any = true; break } }
    }
    return any;
  },
  damage(e, b, at) {
    const rip = e.st === 'stun'; Hero.H.hitSet.add(e); const dmg = [14, 12, 13][b.ak] * (Hero.H.combo.n === 0 && b.ak === 2 ? 1.3 : 1) * (rip ? 1.8 : 1);
    if (rip) { FX.sparks(at[0], e.z, zy(e.z) - at[1], 12, '255,214,120', 360); Game.score += 10 }
    const hy = zy(e.z) - at[1], fc = Hero.FACE;
    e.hp -= dmg; e.flash = 1; e.hpT = 2.6; Game.chain(); Snd.hit(); FX.sparks(at[0], e.z, hy, 7, '255,214,170', 300); FX.sparks(at[0], e.z, hy, 6, '150,40,50', 240); FX.flash(at[0], e.z, hy, 46, '255,200,170', .1); Game.hitStop(rip ? .08 : .05); Cam.kick(rip ? 6 : 3);
    FX.cut(at[0], e.z, hy, [fc > 0 ? 1.0 : PI - 1.0, fc > 0 ? .12 : PI - .12, fc > 0 ? -.9 : PI + .9][b.ak] || 0, rip ? 120 : 84, rip ? '255,226,150' : '255,255,255');
    FX.num(at[0], e.z, hy + 26, Math.round(dmg), rip ? '#ffd98a' : '#ffffff', rip ? 26 : 19);
    // первые два удара серии почти не отталкивают (враг остаётся под клинком), третий — отбрасывает
    e.kbv = Math.sign(e.x - Hero.H.x) * (e.T.poise ? [25, 25, 80] : [70, 70, 240])[b.ak] * (rip ? 1.3 : 1);
    if (e.hp <= 0) return this.kill(e);
    // замах сбивается только в начале (гуль, доктор — первая половина, рыцарь — первые 30 %); сам удар не сбивается
    const lateWind = e.st === 'wind' && e.t > e.T.wind * (e.type === 'knight' ? .3 : .5);
    if (e.st !== 'strike' && e.st !== 'stun' && !lateWind && (!e.T.poise || (e.st === 'move' || e.st === 'wind') && Math.random() > e.T.poise)) { e.st = 'hurt'; e.t = 0; e.flaskOut = 0 }
  },
  // удар врага отбит парированием
  parried(e) { e.st = 'stun'; e.t = 0; e.done = 1; e.flaskOut = 0; e.dy = 0; e.pn = null; e.kbv = Math.sign(e.x - Hero.H.x) * (e.T.poise ? 160 : 260); Game.score += 15 },
  deflect(p) { p.dead = 1 },
  kill(e) { e.st = 'dying'; e.t = 0; e.kbv *= .5; Game.score += e.T.score; Snd.death() },
  ash(e) {
    // персонаж рассыпается пеплом: рисуем его во внеэкранный холст и режем на куски
    const xf = rigXf(e), hgt = e.R.P.torso.h * 2.6 * xf.s, w = hgt * 1.3, x0 = xf.X - w / 2, y0 = zy(e.z) - hgt * 1.08;
    const cv = renderToCanvas(() => drawRig(e), x0, y0, w, hgt * 1.15);
    FX.shatter(cv, x0, y0, { grid: [6, 9], speed: 90, up: .4, life: 1.1, ash: 1, vx: Math.sign(e.x - Hero.H.x) * 60 });
    FX.smoke(e.x, e.z, hgt * .4, 10, '15,12,22', 38); e.st = 'gone';
  },
  // ---------- рисование ----------
  drawables(list) {
    for (const e of this.list) list.push({ z: e.z, draw: () => this.draw(e), shadow: () => drawShadow(e.x, e.z, 38 * (e.type === 'goatman' ? 1.3 : 1), .36 * e.alpha) });
    // ядовитая лужа: пятно на полу показывает, где стоять нельзя
    for (const c of this.clouds) list.push({ z: c.z - .02, draw: () => { const x = sx(c.x), y = zy(c.z), a = Math.min(1, c.t * 4) * Math.min(1, (c.life - c.t) * 2), r = 58 * zs(c.z); ctx.fillStyle = `rgba(70,150,60,${.3 * a})`; ctx.strokeStyle = `rgba(150,230,110,${(.45 + .2 * Math.sin(c.t * 9)) * a})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, r, r * .3, 0, 0, TAU); ctx.fill(); ctx.stroke() } });
    for (const p of this.proj) list.push({ z: p.z, draw: () => { const I = IM.ch.doctor.flask, x = sx(p.x), y = zy(p.z) - p.h, k = rigDef('doctor').scale * zs(p.z) * 2.3; ctx.drawImage(FX.glow('150,255,120'), x - 26, y - 26, 52, 52); ctx.save(); ctx.translate(x, y); ctx.rotate(p.r); ctx.drawImage(I, -I.width * k / 2, -I.height * k / 2, I.width * k, I.height * k); ctx.restore() } });
  },
  draw(e) {
    if (e.st === 'gone') return; if (!e.G) e.G = rigGeom(e);
    if (e.st === 'wind' && e.T.charge) { // дорожка тарана на полу: куда побежит
      const k = sm(e.t / e.T.wind), y = zy(e.z), x0 = sx(e.x), L = 470 * k, f = e.face, hw = 44 * zs(e.z), g = ctx.createLinearGradient(x0, 0, x0 + f * L, 0); g.addColorStop(0, `rgba(255,90,60,${.5 * k})`); g.addColorStop(1, 'rgba(255,90,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, y - hw * .45); ctx.lineTo(x0 + f * L, y - hw * .2); ctx.lineTo(x0 + f * L, y + hw * .2); ctx.lineTo(x0, y + hw * .45); ctx.fill();
      ctx.strokeStyle = `rgba(255,150,110,${.5 * k})`; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { const xx = x0 + f * (60 + ((i * 100 + e.t * 260) % 400)) * k; ctx.beginPath(); ctx.moveTo(xx - f * 9, y - hw * .3); ctx.lineTo(xx, y); ctx.lineTo(xx - f * 9, y + hw * .3); ctx.stroke() } }
    ctx.save(); ctx.globalAlpha = e.alpha * (1 - .6 * Soul.fadeFor(e.x)); drawRig(e);
    if (e.flash > 0) { ctx.globalAlpha = e.flash * e.flash * .62 * e.alpha; drawRig(e, { v: 'W' }) }
    ctx.restore();
    if (e.hpT > 0 && e.hp > 0 && e.st !== 'dying') { // полоска здоровья над раненым врагом
      const w = 46, x = sx(e.x) - w / 2, y = zy(e.z) - (e.R.size || 1) * 232 * zs(e.z) + (e.dy || 0), k = cl(e.hp / e.maxhp, 0, 1); ctx.globalAlpha = Math.min(1, e.hpT * 2);
      ctx.fillStyle = 'rgba(6,8,14,.8)'; ctx.fillRect(x - 1, y - 1, w + 2, 6); ctx.fillStyle = k > .4 ? '#e0574a' : '#ff9a5a'; ctx.fillRect(x, y, w * k, 4); ctx.globalAlpha = 1 }
  },
};
