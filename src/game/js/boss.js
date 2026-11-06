// boss.js — каменные боссы: «Каменный страж» (кулаки, топот, волна по полу) и «Каменный палач» (огромный топор).
// Конечности с отдельным HP; разрушенная — оставляет культю и рассыпается на осколки с цифрами (дальше — душа и монолит).
// Удары прицельные: в начале замаха запоминается точка, где стоит герой; в момент удара рука (или лезвие топора)
// решается двухкостной IK ровно в эту точку — при любом приседе и наклоне корпуса.
const LIMBS = ['armN', 'armF', 'legN', 'legF'];
const LIMB_NAME = { armN: 'Ближняя рука', armF: 'Дальняя рука', legN: 'Ближняя нога', legF: 'Дальняя нога' };
const BOSSDEF = {
  guardian: { hp: { armN: 95, armF: 95, legN: 105, legF: 105 }, atks: ['slam', 'sweep', 'stomp', 'wave'], cd: [2.6, 3.6], speedK: 1 },
  executioner: { hp: { armN: 105, armF: 105, legN: 115, legF: 115 }, atks: ['chop', 'cleave', 'stomp', 'wave'], cd: [1.5, 2.4], speedK: 1.15 },
};
// ключи атак: wk — поза замаха; hit — высота цели над полом ('g' — пол, 'c' — грудь героя); D — желаемая дальность (доля длины руки)
const BATK = {
  slam: { arm: 1, wind: .95, strike: .24, hold: .8, rec: .6, dmg: 14, th: .82, r: 78, wk: { ru: -3.35, flex: .7, crouch: .05, lean: -.2 }, D: .62 },
  sweep: { arm: 1, wind: .7, strike: .2, hold: .3, rec: .55, dmg: 10, th: .42, r: 72, wk: { ru: 1.35, flex: .3, crouch: .06, lean: -.14 }, D: .72 },
  wave: { arm: 1, wind: .8, strike: .2, hold: .55, rec: .55, dmg: 9, th: 0, r: 60, wk: { ru: -3.2, flex: .6, crouch: .02, lean: -.15 }, D: .5, far: 1 },
  chop: { arm: 1, axe: 1, wind: 1.0, strike: .2, hold: 1.1, rec: .7, dmg: 18, th: 0, r: 80, wk: { ru: -3.5, flex: .9, crouch: 0, lean: -.22, axeC: 2.3 }, axeHit: 1.35, D: .62 },
  cleave: { arm: 1, axe: 1, wind: .75, strike: .22, hold: .16, rec: .7, dmg: 12, th: .45, r: 80, wk: { ru: 1.2, flex: .5, crouch: .03, lean: -.12, axeC: .9 }, axeHit: 1.55, D: .78 },
  stomp: { leg: 1, wind: .85, strike: .15, hold: .35, rec: .5, dmg: 12, radius: 200 },
};
const Boss = {
  b: null, waves: [],
  reset() { this.b = null; this.waves = [] },
  spawn(id) {
    const R = rigDef(id), D = BOSSDEF[id], x = cl(Hero.H.x + 620, W.XMIN + 300, W.XMAX - 120), face = -1;
    const c = Walker.create({ ...R, gait: R.gait, x: 0, face, gaitOverride: id === 'executioner' ? { arm: .08 } : {} });
    const B = this.b = { id, R, D, c, x, z: .55, face, pose: null, G: null, limbs: {}, missing: {}, st: 'enter', t: 0, cd: 1.5, alpha: 0, sMul: 1, weaponArm: 0, axeC: 1.55, gait: 'walk', atk: null, regrowK: .55, flash: {}, stagger: 0, hop: null, cloth: 0, dy: 0 };
    for (const l of LIMBS) B.limbs[l] = { hp: D.hp[l], max: D.hp[l], alive: true, regrow: 0 };
    B.pose = Walker.update(c, DT, { dir: 0 }); B.G = rigGeom(B);
    this.waves = []; Snd.roar(); Cam.kick(16); return B;
  },
  L(B) { return B.R.L1 + B.R.L2 },
  s(B) { return B.R.scale * zs(B.z) },
  armIdx(B) { return B.limbs.armN.alive ? 0 : B.limbs.armF.alive ? 1 : -1 },
  legsAlive(B) { return (B.limbs.legN.alive ? 1 : 0) + (B.limbs.legF.alive ? 1 : 0) },
  // ---------- IK руки в точку: эффектор — кулак или лезвие топора (жёстко связан с предплечьем) ----------
  effector(B, ai, axeC) {
    const Pa = B.R.P[ai ? 'armF' : 'armN']; let E = [Pa.hand[0] - Pa.joint[0], Pa.hand[1] - Pa.joint[1]];
    if (B.R.axe && B.weaponArm === ai) { const wp = B.R.P.weapon, v = rot2([wp.blade[0] - wp.grip[0], wp.blade[1] - wp.grip[1]], axeC); E = [E[0] + v[0], E[1] + v[1]] }
    return { Pa, E };
  },
  ikArm(Pa, E, sh, T) {
    const U = dist(Pa.root, Pa.joint), Lx = Math.hypot(E[0], E[1]), d = dist(sh, T), dd = cl(d, Math.abs(U - Lx) + 1, (U + Lx) * .9995), a0 = angOf(sh, T), al = Math.acos(cl((U * U + dd * dd - Lx * Lx) / (2 * U * dd), -1, 1));
    let best = null; const Tc = [sh[0] + Math.cos(a0) * dd, sh[1] + Math.sin(a0) * dd];
    for (const sg of [1, -1]) {
      const ea = a0 + sg * al, el = [sh[0] + U * Math.cos(ea), sh[1] + U * Math.sin(ea)]; let ru = ea - PI / 2;
      while (ru < -3.93) ru += TAU; while (ru > 2.36) ru -= TAU;
      const a2 = angOf(el, Tc) - Math.atan2(E[1], E[0]), rf0 = a2 + angOf(Pa.joint, Pa.end) - PI / 2, flex = angDiff(rf0, ru), rf = ru - flex;
      const sc = (flex >= -.08 && flex <= 2.8 ? 0 : 10) + el[0] * .002;
      if (!best || sc < best.sc) best = { ru, rf, flex, sc, miss: Math.max(0, d - (U + Lx)) };
    }
    return best;
  },
  // поза-гипотеза для проверки досягаемости (таз над стопами, корпус наклонён)
  shoulderAt(B, ai, crouch, lean) {
    const L = this.L(B), hip = this.hipBase(B) - crouch * L, po = { ...B.pose, hip, lean: this.restLean(B) + lean };
    const G = rigGeom({ ...B, pose: po }); return { sh: G.arms[ai].sh, hip };
  },
  // наклон корпуса в стойке (без хода): от него считается поза удара
  restLean(B) { return B.gait === 'sit' ? .12 : B.gait === 'hop' ? .05 : B.c.g.lean * .3 },
  hipBase(B) { const L = this.L(B); return B.gait === 'sit' ? this.sitHip(B) : B.gait === 'hop' ? L * .88 : L * (1 - B.c.g.crouch) * .99 },
  sitHip(B) { const t = B.R.P.torso; return (B.R.I.torso.height - t.hip[1]) * .78 - B.R.foot },
  // цель в локальных координатах босса (от таза, вперёд +x, вниз +y) при данной высоте таза
  localT(B, T, hip) { const s = this.s(B); return [(T.x - B.x) * B.face / s, hip + B.R.foot - T.h / s] },
  // найти присед и наклон, при которых рука достаёт цель с запасом; null — недостижимо
  plan(B, A, T) {
    const ai = A.ai ?? this.armIdx(B); if (ai < 0) return null;
    const axes = A.axe && B.R.axe ? [A.axeHit, A.axeHit + .25, A.axeHit - .25, A.axeHit + .5, A.axeHit - .5, A.axeHit + .8, A.axeHit + 1.1] : [0];
    for (let lean = -.1; lean <= 1.1; lean += .075) for (let cr = 0; cr <= (B.gait === 'sit' ? 0 : .4); cr += .05) {
      const { sh, hip } = this.shoulderAt(B, ai, cr, lean), Tl = this.localT(B, T, hip);
      if (Tl[0] < 40) return null; // цель сзади или под ногами
      for (const axeC of axes) {
        const { Pa, E } = this.effector(B, ai, axeC), U = dist(Pa.root, Pa.joint), reach = U + Math.hypot(E[0], E[1]), d = dist(sh, Tl);
        const inner = Math.abs(U - Math.hypot(E[0], E[1])) + reach * .08; // у топора длинный рычаг: слишком близкую цель не достать
        if (d < reach * .94 && d > Math.max(reach * .4, inner)) { const k = this.ikArm(Pa, E, sh, Tl); if (k.flex > .05 && k.flex < 2.4) return { ai, crouch: cr, lean, axeC } }
      }
    }
    return null;
  },
  // точка прицеливания: где стоит герой (по x и z) на высоте th роста героя; волна — с места, на полу перед боссом
  targetFor(B, A) {
    const h = Hero.H; if (A.far) return { x: B.x + B.face * this.armReach(B, A) * this.s(B) * A.D, z: B.z, h: A.axe ? 2 : (B.R.P.armN.r * .7) * this.s(B) };
    const hh = Hero.height(); return { x: h.x, z: h.z, h: A.th ? A.th * hh : A.axe ? 2 : (B.R.P.armN.r * .7) * this.s(B) };
  },
  // ---------- шаг ----------
  update(dt) {
    const B = this.b; if (!B) return; B.t += dt; const h = Hero.H, L = this.L(B);
    for (const l of LIMBS) { B.flash[l] = Math.max(0, (B.flash[l] || 0) - dt * 5); const lm = B.limbs[l]; if (lm.regrow > 0) lm.regrow = Math.max(0, lm.regrow - dt / 1.1) }
    B.weaponArm = B.limbs.armN.alive ? 0 : 1;
    const nLeg = this.legsAlive(B), gait = nLeg === 2 ? 'walk' : nLeg === 1 ? 'hop' : 'sit';
    // смена походки: старые точки стоп (они остались там, где босс стоял до прыжков) сбрасываются под тело
    if (gait !== B.gait) { B.fs = [{}, {}]; B.c.feet.forEach(f => { f.ax = null; f.st = true; f.stInit = 0 }); B.c.moving = false } B.gait = gait;
    const ctl = { dir: 0, tx: B.x, tz: B.z, hold: false, crouch: 0, lean: 0 };
    let armOv = null, legOv = null;
    switch (B.st) {
      case 'enter': B.alpha = Math.min(1, B.alpha + dt * .9); ctl.tx = B.x - 300 * B.face * -1; ctl.dir = B.face; if (B.t > 2.2) { B.st = 'move'; B.t = 0 } break;
      case 'move': {
        if (B.next && (B.nextT = (B.nextT || 0) + dt) > (B.cd <= 0 ? 1.2 : 2.6)) { B.next = null; B.nextT = 0 } // не выходит достать — выбрать другой удар
        const A = B.next || (B.next = this.choose(B)); const s = this.s(B), dx = h.x - B.x, adx = Math.abs(dx);
        const want = A ? (A.D * this.armReach(B, A) * s) : 160, side = Math.sign(B.x - h.x) || 1;
        ctl.tx = h.x + side * want; ctl.tz = cl(h.z, .12, .95); if (A && A.far) ctl.tx = B.x; // волна — с места
        // ближе нужного — не отходить (иначе босс поворачивается спиной и уходит); ударить можно и отсюда
        if (A && !A.far && !A.leg) { const R = this.armReach(B, A) * s; if (adx < .98 * R) ctl.tx = B.x }
        if (A && A.leg) ctl.tx = h.x + side * 120;
        B.cd -= dt;
        B.planT = (B.planT || 0) - dt;
        if (B.cd <= 0 && A && B.planT <= 0 && Math.sign(dx) === B.face && !(B.hop && B.hop.on)) { // замах — только когда стоит (не в прыжке); поиск позы — не чаще 6 раз в секунду
          B.planT = .16;
          const T = this.targetFor(B, A), pl = A.leg ? (nLeg > 1 ? { ok: 1 } : null) : this.plan(B, A, T);
          if (!pl && A.far) { B.next = null; B.cd = .3; break }
          if (pl && (A.far || A.leg || Math.abs(h.z - B.z) < .07)) { if (!A.far && !A.leg) T.z = B.z; this.startAtk(B, A, T, pl); break }
        }
        break;
      }
      case 'atk': { const r = this.atkStep(B, dt, ctl); armOv = r.arm; legOv = r.leg; break }
      case 'stagger': ctl.hold = true; ctl.lean = -.22 * Math.sin(PI * cl(B.t / 1.2, 0, 1)); if (B.t > 1.2) { B.st = 'move'; B.t = 0; B.cd = .8 } break;
      case 'dying': ctl.hold = true; ctl.lean = .3 * sm(B.t / 1.5); B.dy = 40 * sm(B.t / 1.6); if (B.t > 1.6 && !B.gone) this.crumble(B); break;
    }
    if (B.st === 'move' || B.st === 'enter') { const dx = ctl.tx - B.x; ctl.dir = Math.abs(dx) > 30 ? Math.sign(dx) : (Math.abs((ctl.tz - B.z) * ZPX) > 9 ? B.face : 0); if (B.st === 'move' && Math.abs(dx) <= 30 && Math.sign(h.x - B.x) !== B.face && Math.abs(h.x - B.x) > 40) ctl.dir = Math.sign(h.x - B.x) }
    this.locomote(B, dt, ctl);
    // палач держит топор на плече, когда не бьёт (это же — исходная поза замаха)
    const po = B.pose;
    if (B.R.axe && B.limbs[B.weaponArm ? 'armF' : 'armN'].alive) { const a = po.arms[B.weaponArm], sit = B.gait === 'sit'; B.sitK = lp(B.sitK || 0, sit ? 1 : 0, 1 - Math.exp(-dt * 4)); const k = B.sitK; a.ru = lp(-.35, .55, k) + po.lean; a.rf = lp(-2.5, -.5, k) + po.lean; B.axeC = lp(1.3, 1.9, k) }
    if (B.st === 'atk' && B.atk && !B.atk.A.leg) this.applyArm(B);
    // удар и удержание — точно в цель (IK), без ограничения; остальные смены позы рук — плавно
    if (!(B.st === 'atk' && B.atk && (B.atk.ph === 'strike' || B.atk.ph === 'hold'))) limitArms(B, dt, .3); else B._sa = B.pose.arms.map(a => [a.ru, a.rf]);
    if (legOv) { const lg = po.legs[legOv.li], lift = Math.max(0, legOv.lift), r = Walker.ik2(lg.ax + legOv.dx, po.hip - lift, B.R.L1, B.R.L2, 1); Object.assign(lg, r, { st: lift < 1, lift, footRot: -.35 * cl(lift / (L * .3), 0, 1) }) }
    B.G = rigGeom(B);
    // след оружия: точка удара по кадрам фазы удара
    if (B.atk && !B.atk.A.leg && (B.atk.ph === 'strike' || (B.atk.ph === 'hold' && B.atk.t < .05))) { const P = this.effPoint(B, B.G, B.atk.pl.ai); (B.trail || (B.trail = [])).push({ x: P.x, y: P.y, t: B.t }) } if (B.trail) B.trail = B.trail.filter(p => B.t - p.t < .22);
    // каменная крошка сыплется с культей
    for (const l of LIMBS) if (!B.limbs[l].alive && Math.random() < dt * 12) { const G = B.G, p = l.startsWith('arm') ? G.arms[l === 'armN' ? 0 : 1].sh : G.legs[l === 'legN' ? 0 : 1].hip, q = rigToWorld(B, p); FX.chips(q.x, B.z, zy(B.z) - q.y + 10, 1, 60) }
    if (B.atk && B.atk.impact && !B.atk.done) this.impact(B);
    this.updWaves(dt);
  },
  armReach(B, A) { const ai = A.ai ?? Math.max(0, this.armIdx(B)), { Pa, E } = this.effector(B, ai, A.axeHit ?? 0); return dist(Pa.root, Pa.joint) + Math.hypot(E[0], E[1]) },
  choose(B) {
    const ai = this.armIdx(B), nLeg = this.legsAlive(B), h = Hero.H, far = Math.abs(h.x - B.x) > 640 || (B.gait === 'sit' && Math.abs(h.x - B.x) > 360);
    let list = B.D.atks.filter(k => { const A = BATK[k]; if (A.arm && ai < 0) return false; if (A.axe && (!B.R.axe)) return false; if (A.leg && (nLeg < 2)) return false; if (!A.axe && B.R.axe && A.arm && !A.far) return false; return true });
    const mk = k => (B.R.axe && k === 'wave') ? { ...BATK.chop, far: 1, D: .45, dmg: 9, r: 60, key: k } : { ...BATK[k], key: k };
    if (far) { const w = list.filter(k => BATK[k].far).map(mk).find(A => this.plan(B, A, this.targetFor(B, A))); if (w) return w; if (list.includes('stomp')) return mk('stomp') }
    list = list.filter(k => !BATK[k].far || Math.random() < .2); if (!list.length) return null;
    // рукой/оружием — втрое чаще, чем топот; вплотную (рука не разворачивается) — топот
    const close = Math.abs(h.x - B.x) < (B.gait === 'sit' ? .55 : .4) * this.armReach(B, BATK[B.R.axe ? 'chop' : 'slam']) * this.s(B);
    // палач вплотную бьёт свободной рукой (топором так близко не замахнуться)
    const off = B.R.axe ? 1 - B.weaponArm : -1;
    if (close && off >= 0 && off !== B.weaponArm && B.limbs[off ? 'armF' : 'armN'].alive && Math.random() < (B.gait === 'sit' ? .85 : .45)) return { ...BATK.sweep, key: 'punch', ai: off, dmg: 10, wind: .6 };
    if (close && list.includes('stomp') && Math.random() < .6) return mk('stomp');
    const wl = list.flatMap(k => BATK[k].leg ? [k] : [k, k, k]); return mk(pick(wl));
  },
  startAtk(B, A, T, pl) {
    B.st = 'atk'; B.t = 0; B.atk = { A, T, pl, ph: 'wind', t: 0, z0: B.z, done: 0 }; B.next = null; B.nextT = 0; B.trail = []; Snd.windup(B.id === 'guardian' ? 1 : .8);
    if (!A.leg) B.atk.mark = FX.mark(T.x, T.z, A.wind + A.strike + .05, A.th ? '255,170,80' : '255,90,60', A.r);
    else B.atk.mark = FX.mark(B.x, B.z, A.wind + A.strike + .05, '255,120,60', A.radius);
  },
  atkStep(B, dt, ctl) {
    const k = B.atk, A = k.A, h = Hero.H, L = this.L(B); k.t += dt; ctl.hold = true; let arm = null, leg = null;
    const ph = k.ph, wk = A.wk || {}, P = k.pl;
    // z босса подтягивается к точке удара к моменту удара (выпад)
    const e = ph === 'wind' ? sm(k.t / A.wind) : ph === 'strike' ? Math.pow(cl(k.t / A.strike, 0, 1), 2.2) : ph === 'hold' ? 1 : 1 - sm(k.t / A.rec);
    if (A.leg) { // топот: нога поднимается и бьёт в землю там же, где стояла
      const li = B.limbs.legN.alive ? 0 : 1, lift = ph === 'wind' ? L * .42 * sm(k.t / A.wind) : ph === 'strike' ? L * .42 * (1 - Math.pow(k.t / A.strike, 2)) : 0;
      ctl.lean = ph === 'wind' ? -.12 * e : 0; leg = { li, lift, dx: ph === 'wind' ? L * .08 * e : ph === 'strike' ? L * .08 * (1 - k.t / A.strike) : 0 };
    } else {
      // присед и наклон: к позе замаха, затем к позе удара (найдена в plan), в конце — обратно
      ctl.crouch = ph === 'wind' ? lp(0, wk.crouch, e) : ph === 'rec' ? lp(0, P.crouch, e) : lp(wk.crouch, P.crouch, e);
      ctl.lean = ph === 'wind' ? lp(0, wk.lean, e) : ph === 'rec' ? lp(0, P.lean, e) : lp(wk.lean, P.lean, e);
    }
    if (ph === 'wind' && k.t >= A.wind) { k.ph = 'strike'; k.t = 0; if (A.axe) Snd.axe(); else Snd.swing(2) }
    else if (ph === 'strike' && k.t >= A.strike) { k.ph = 'hold'; k.t = 0; k.impact = 1 }
    else if (ph === 'hold' && k.t >= A.hold) { k.ph = 'rec'; k.t = 0 }
    else if (ph === 'rec' && k.t >= A.rec) { B.st = 'move'; B.t = 0; B.cd = rnd(...B.D.cd); B.atk = null }
    return { arm, leg };
  },
  // ---------- передвижение: шаги (walker.js), прыжки на одной ноге, сидя на культях ----------
  locomote(B, dt, ctl) {
    const c = B.c, L = this.L(B), s = this.s(B);
    if (B.gait === 'walk') {
      const x0 = c.x; B.pose = Walker.update(c, dt, { dir: ctl.hold ? 0 : ctl.dir, hold: ctl.hold, crouch: ctl.crouch, speedK: B.D.speedK * (B.st === 'enter' ? .8 : 1) }); B.face = c.face;
      const p = Math.abs(c.x - x0); let dir = null; if (p > 0) { const dxp = ctl.tx - B.x, dzp = (ctl.tz - B.z) * ZPX, n = Math.hypot(dxp, dzp); if (n > 6) B.mv = { ax: Math.abs(dxp) / n, az: dzp / n }; const { ax, az } = B.mv || { ax: 1, az: 0 }; B.x += p * s * B.face * ax; B.z = cl(B.z + p * s * az / ZPX, .1, .96); dir = { x: B.face * ax, z: az } }
      depthLegs(B, dir);
      for (const ev of c.events) this.stepFx(B, ev.foot);
    } else if (B.gait === 'hop') this.hopStep(B, dt, ctl);
    else this.sitStep(B, dt, ctl);
    B.pose.baseLean = B.pose.lean; B.pose.lean += ctl.lean || 0; turnTick(B, dt, .34);
    B.x = cl(B.x, W.XMIN - 40, W.XMAX + 40);
  },
  stepFx(B, foot) {
    const g = B.c.g, G = rigGeom(B), lg = G.legs[foot] || G.legs[0], p = rigToWorld(B, lg.an), x = p.x, near = Math.abs(Hero.H.x - B.x) < 900;
    Cam.kick(g.shake * 11 * (near ? 1 : .3)); FX.dust(x, B.z, 2 + 3 * g.dust, .3 + .3 * g.dust); FX.crack(x, B.z, .8); FX.ring(x, B.z, 200, .55); Snd.step(.9, 1);
  },
  hopStep(B, dt, ctl) {
    const c = B.c, L = this.L(B), s = this.s(B), li = B.limbs.legN.alive ? 0 : 1; c.t += dt;
    const hp = B.hop || (B.hop = { u: 0, on: 0, fx: B.x, x0: B.x, z0: B.z });
    hp.rest = Math.max(0, (hp.rest || 0) - dt);
    const moving = ctl.dir !== 0 && !ctl.hold; if (moving && !hp.on && hp.rest <= 0) { hp.on = 1; hp.u = 0; hp.x0 = B.x; hp.z0 = B.z; hp.dir = ctl.dir; hp.dz = cl((ctl.tz - B.z), -.12, .12); hp.mark = FX.mark(B.x + hp.dir * L * .55 * s, cl(B.z + hp.dz, .1, .96), .9, '255,140,70', 105) }
    if (moving && hp.dir !== B.face) { B.face = hp.dir }
    let hipH = L * .88 - L * .006 * (1 + Math.sin(c.t * 1.6)) - (ctl.hold ? (ctl.crouch || 0) * L : 0), lift = 0, lean = .05, fx = hp.fx;
    const len = L * .55 * s;
    if (hp.on) {
      hp.u += dt / 1.25; const u = hp.u;
      if (u < .35) { const e = sm(u / .35); hipH = lp(L * .88, L * .7, e); lean = .05 + .2 * e }
      else if (u < .7) { const q = (u - .35) / .35, e = sm(q); B.x = hp.x0 + hp.dir * len * e; B.z = cl(hp.z0 + hp.dz * e, .1, .96); hipH = L * .7 + L * .32 * Math.sin(PI * q); lift = L * .2 * Math.sin(PI * q); fx = lp(hp.fx, hp.x0 + hp.dir * len, e); lean = .25 - .15 * q }
      else { if (!hp.landed) { hp.landed = 1; hp.fx = B.x; this.stepFx(B, li); Cam.kick(16); FX.ring(B.x, B.z, 260, .6); if (fdist(Hero.H.x, Hero.H.z, B.x, B.z) < 100) Hero.damage(7, B.x, 1.5) } fx = hp.fx; hipH = lp(L * .66, L * .88, sm((u - .7) / .3)); lean = .1 * (1 - (u - .7) / .3) }
      if (u >= 1) { hp.on = 0; hp.landed = 0; hp.fx = B.x; hp.rest = 1.1 }
    } else hp.fx = lp(hp.fx, B.x, 0); // опорная стопа стоит
    if (!hp.on) hp.fx = hp.fx ?? B.x;
    const fl = (fx - B.x) * B.face / s; const a = Walker.ik2(fl, hipH - lift, B.R.L1, B.R.L2, 1);
    const legs = [null, null]; legs[li] = { ...a, st: lift < 1, lift }; legs[1 - li] = { ...a, st: true, lift: 0 };
    const sw = Math.sin(c.t * 2) * .05, arms = [{ ru: -.2 - lean * .6 + sw, rf: -.6 - lean }, { ru: .25 - lean * .3 - sw, rf: -.2 }];
    B.pose = { hip: hipH, legs, arms, lean, m: hp.on ? 1 : 0, F: 0, roll: 0 };
  },
  sitStep(B, dt, ctl) {
    const c = B.c; c.t += dt; const hip = this.sitHip(B);
    if (!ctl.hold && ctl.dir && ctl.dir !== B.face) { B.face = ctl.dir; FX.dust(B.x, B.z, 10, .8); Cam.kick(6); Snd.step(.6, 1) }
    const dummy = Walker.ik2(0, Math.max(10, hip), B.R.L1, B.R.L2, 1), sw = Math.sin(c.t * 1.7) * .05;
    B.pose = { hip, legs: [{ ...dummy, st: true, lift: 0 }, { ...dummy, st: true, lift: 0 }], arms: [{ ru: -.5 + sw, rf: -1.1 }, { ru: -.2 - sw, rf: -.7 }], lean: .12 + .015 * Math.sin(c.t * 1.3), m: 0, F: 0, roll: 0 };
  },
  // ---------- поза руки атаки: IK каждый кадр от текущего плеча (точно в цель к концу удара и в фазе удержания) ----------
  applyArm(B) {
    const k = B.atk; if (!k || k.A.leg) return; const A = k.A, P = k.pl, po = B.pose, ai = P.ai, wk = A.wk, ph = k.ph;
    const t = k.t, e = ph === 'wind' ? sm(t / A.wind) : ph === 'strike' ? Math.pow(cl(t / A.strike, 0, 1), 2.2) : ph === 'hold' ? 1 : 1 - sm(t / A.rec);
    const aH = P.axeC ?? 0, axeC = A.axe ? (ph === 'wind' ? lp(1.55, wk.axeC, e) : ph === 'rec' ? lp(1.55, aH, e) : lp(wk.axeC, aH, e)) : 0;
    const G = rigGeom(B), sh = G.arms[ai].sh, { Pa, E } = this.effector(B, ai, aH), Tl = this.localT(B, k.T, po.hip), sol = this.ikArm(Pa, E, sh, Tl);
    const base = po.arms[ai], wru = wk.ru, wfl = wk.flex;
    let ru, flex;
    if (ph === 'wind') { const bf = angDiff(base.rf, base.ru); ru = lp(base.ru, wru, e); flex = lp(bf, wfl, e) }
    else if (ph === 'strike') { ru = lp(wru, sol.ru, e); flex = lp(wfl, sol.flex, e) }
    else if (ph === 'hold') { ru = sol.ru; flex = sol.flex }
    else { const bf = angDiff(base.rf, base.ru); ru = lp(base.ru, sol.ru, e); flex = lp(bf, sol.flex, e) }
    po.arms[ai] = { ru, rf: ru - flex }; if (A.axe) B.axeC = ph === 'hold' ? aH : axeC;
  },
  impact(B) {
    const k = B.atk, A = k.A, h = Hero.H; k.done = 1; if (k.mark) k.mark.dead = 1;
    const s = this.s(B);
    if (A.leg) { const G = B.G, li = B.limbs.legN.alive ? 0 : 1, p = rigToWorld(B, G.legs[li].an); this.stepFx(B, li); Cam.kick(20); FX.ring(p.x, B.z, A.radius * 1.4, .7, '230,210,190', 5); FX.crack(p.x, B.z, 1.3); Snd.quake(1);
      if (fdist(h.x, h.z, p.x, B.z) < A.radius) Hero.damage(A.dmg, p.x, 2); k.err = 0;
      if (B.id === 'guardian') for (const d of [-1, 1]) this.waves.push({ x: p.x + d * 60, z: B.z, dir: d, v: 520, t: 0, life: 1.7, hit: 0, acc: 0 });
      return }
    const G = B.G, ai = k.pl.ai, P = this.effPoint(B, G, ai), T = { x: k.T.x, y: zy(B.z) - k.T.h };
    FX.flash(P.x, B.z, zy(B.z) - P.y, A.axe ? 120 : 90, '255,220,170', .2);
    k.err = Math.hypot(P.x - T.x, P.y - T.y); B.lastImpact = { err: k.err, P, T, key: A.key || '', z: B.z }; Critic.impacts.push({ id: B.id, key: A.key, err: +k.err.toFixed(2), gait: B.gait, t: Game.time });
    if (!A.th) { Cam.kick(A.axe ? 18 : 15); FX.crack(k.T.x, B.z, A.axe ? 1.2 : 1); FX.dust(k.T.x, B.z, 12, 1); FX.chips(k.T.x, B.z, 4, 14, 420); FX.ring(k.T.x, B.z, 180, .5); Snd.quake(.8); Snd.stoneHit();
      if (A.far) this.waves.push({ x: k.T.x, z: B.z, dir: B.face, v: 560, t: 0, life: 1.9, hit: 0, acc: 0 });
      else if (fdist(h.x, h.z, k.T.x, B.z) < A.r * zs(B.z)) Hero.damage(A.dmg, B.x, 1.6) }
    else { Cam.kick(10); Snd.stoneHit(); Snd.quake(.4); FX.dust(k.T.x, B.z, 6, .6); FX.ring(k.T.x, B.z, 110, .35, '255,220,180', 3); if (Math.abs(h.x - k.T.x) < A.r && Math.abs(h.z - B.z) < .13) Hero.damage(A.dmg, B.x, 2) }
  },
  effPoint(B, G, ai) { if (B.R.axe && B.weaponArm === ai && G.weapon) return rigToWorld(B, G.weapon.tip); return rigToWorld(B, G.arms[ai].hand) },
  // волна по полу: камни выталкивает из пола, проходит по прямой
  updWaves(dt) {
    const h = Hero.H;
    for (const w of this.waves) { w.t += dt; w.x += w.dir * w.v * dt; w.acc += dt; if (w.acc > .06) { w.acc = 0; FX.chips(w.x, w.z, 0, 4, 240); FX.dust(w.x, w.z, 2, .5); if (Math.random() < .35) FX.crack(w.x, w.z, .5, 3) }
      if (!w.hit && Math.abs(h.x - w.x) < 36 && Math.abs(h.z - w.z) < .1) { if (Hero.damage(9, w.x - w.dir * 50, 1.2)) w.hit = 1 }
      if (w.x < W.XMIN || w.x > W.XMAX) w.t = w.life }
    this.waves = this.waves.filter(w => w.t < w.life);
  },
  // ---------- попадания по конечностям ----------
  limbCaps(B) {
    const G = B.G, xf = rigXf(B), Wp = p => { const q = rigToWorld(B, p, xf); return [q.x, q.y] }, P = B.R.P, s = xf.s, out = [];
    G.arms.forEach((a, i) => { const part = i ? 'armF' : 'armN'; if (B.limbs[part].alive) out.push({ part, near: !i, caps: [[Wp(a.sh), Wp(a.el), P[part].r * .95 * s], [Wp(a.el), Wp(a.hand), P[part].r * .85 * s]] }) });
    G.legs.forEach((l, i) => { const part = i ? 'legF' : 'legN'; if (B.limbs[part].alive && B.gait !== 'sit') out.push({ part, near: !i, caps: [[Wp(l.hip), Wp(l.kn), P[part].r * .8 * s], [Wp(l.kn), Wp(l.an), P[part].r * .7 * s]] }) });
    out.sort((a, b) => b.near - a.near); return out;
  },
  bladeHits(b) {
    const B = this.b; if (!B || B.st === 'enter' || B.st === 'dying' || Math.abs(B.z - b.z) > .2 || Hero.H.hitSet.has(B)) return null;
    let best = null;
    for (const L of this.limbCaps(B)) for (const [a, c, r] of L.caps) { const q = segDist([b.x1, b.y1], [b.x2, b.y2], a, c); if (q.d < r + (B.gait === 'sit' && L.part.startsWith('arm') ? 26 : 6) && (!best || (L.near && !best.near) || (L.near === best.near && q.d < best.d))) best = { part: L.part, d: q.d, p: q.p, near: L.near } }
    if (!best) { // корпус: клинок отскакивает
      const G = B.G, xf = rigXf(B), a = rigToWorld(B, [0, 0], xf), c = rigToWorld(B, G.neck, xf), q = segDist([b.x1, b.y1], [b.x2, b.y2], [a.x, a.y], [c.x, c.y]);
      if (q.d < B.R.P.torso.w * .4 * xf.s) { Hero.H.hitSet.add(B); Snd.clang(); FX.sparks(q.p[0], B.z, zy(B.z) - q.p[1], 12, '255,230,170', 340); return { part: null } }
      return null;
    }
    Hero.H.hitSet.add(B);
    return best;
  },
  hitLimb(part, b, at, real = true) {
    const B = this.b, lm = B.limbs[part], dmg = [12, 10, 11][b.ak] * (b.ak === 2 && Hero.H.combo.n === 0 ? 1.3 : 1);
    Snd.stoneHit(); FX.chips(at[0], B.z, zy(B.z) - at[1], 7, 320); FX.sparks(at[0], B.z, zy(B.z) - at[1], 6, '230,230,255', 260);
    if (!real) { Critic.fake++; return } // душа вне тела: тело дерётся только для вида (без стоп-кадра и тряски — душа не дёргается)
    Cam.kick(4); Game.hitStop(.06);
    lm.hp -= dmg; B.flash[part] = 1; Game.stats.hits++;
    if (lm.hp <= 0) this.breakLimb(B, part);
  },
  breakLimb(B, part) {
    const lm = B.limbs[part]; lm.hp = 0; lm.alive = false;
    // конечность рассыпается: рисуем только её во внеэкранный холст и режем на камни
    const xf = rigXf(B), G = B.G, pts = part.startsWith('arm') ? [G.arms[part === 'armN' ? 0 : 1].sh, G.arms[part === 'armN' ? 0 : 1].hand] : [G.legs[part === 'legN' ? 0 : 1].hip, G.legs[part === 'legN' ? 0 : 1].an];
    const p0 = rigToWorld(B, pts[0], xf), p1 = rigToWorld(B, pts[1], xf), cx = (p0.x + p1.x) / 2, cy = (p0.y + p1.y) / 2, sz = Math.hypot(p1.x - p0.x, p1.y - p0.y) + 260 * xf.s / .5;
    const x0 = sx(cx) - sz / 2, y0 = cy - sz / 2, cv = renderToCanvas(() => drawRig(B, { only: part }), x0, y0, sz, sz);
    B.missing[part] = true; if (B.R.axe && part === 'armN' && B.limbs.armF.alive) B.weaponArm = 1;
    FX.shatter(cv, x0, y0, { grid: [4, 7], speed: 340, up: 1, life: 1.6, ground: zy(B.z) - 6, g: 1500 });
    FX.chips(cx, B.z, zy(B.z) - cy, 26, 520); FX.dust(cx, B.z, 14, 1.2); FX.flash(cx, B.z, zy(B.z) - cy, 160, '150,220,255', .3); Snd.breakStone(); Cam.kick(18); Game.hitStop(.12);
    B.st = 'stagger'; B.t = 0; B.atk = null; B.next = null; for (const m of FX.marks) m.dead = 1;
    if (B.gait === 'walk' && part.startsWith('leg')) { B.hop = null }
    Game.stats.broken++;
    const all = LIMBS.every(l => !B.limbs[l].alive);
    Soul.begin(B, part, { x: cx, z: B.z, h: zy(B.z) - cy }, all);
  },
  // ответ на монолите: верно — конечность остаётся разрушенной; неверно — собирается обратно с меньшим HP
  limbResult(part, ok) {
    const B = this.b; if (!B) return; const lm = B.limbs[part];
    if (ok) { if (LIMBS.every(l => !B.limbs[l].alive)) { B.st = 'dying'; B.t = 0; Snd.roar() } return }
    lm.alive = true; lm.max = Math.max(40, Math.round(lm.max * B.regrowK)); lm.hp = lm.max; lm.regrow = 1; B.missing[part] = false;
    if (B.R.axe && part === 'armN') B.weaponArm = 0;
    if (B.st === 'dying') { B.st = 'move'; B.t = 0 }
    Snd.regrow(); FX.flash(B.x, B.z, 300, 220, '255,120,90', .4); Cam.kick(10);
  },
  crumble(B) {
    B.gone = 1; const xf = rigXf(B), hgt = B.R.P.torso.h * 2.4 * xf.s, w = hgt * 1.2, x0 = xf.X - w / 2, y0 = zy(B.z) - hgt * 1.05;
    const cv = renderToCanvas(() => drawRig(B), x0, y0, w, hgt * 1.12);
    FX.shatter(cv, x0, y0, { grid: [7, 11], speed: 380, up: 1, life: 2.2, ground: zy(B.z) - 4 }); FX.dust(B.x, B.z, 30, 1.6); FX.chips(B.x, B.z, 120, 40, 600); Snd.breakStone(); Snd.quake(1); Cam.kick(26);
    this.b = null; Game.bossDown(B.id);
  },
  // ---------- рисование ----------
  drawables(list) {
    const B = this.b; if (!B) return;
    list.push({ z: B.z, draw: () => this.draw(B), shadow: () => drawShadow(B.x, B.z, B.gait === 'sit' ? 120 : 95, .45 * B.alpha) });
    for (const w of this.waves) list.push({ z: w.z, draw: () => { const x = sx(w.x), y = zy(w.z), k = 1 - w.t / w.life; ctx.fillStyle = `rgba(90,96,112,${k})`; for (let i = 0; i < 4; i++) { const xx = x - w.dir * i * 22, hh = (30 - i * 6) * (1 + .2 * Math.sin(w.t * 30 + i)); ctx.beginPath(); ctx.moveTo(xx - 12, y); ctx.lineTo(xx - 3, y - hh); ctx.lineTo(xx + 4, y - hh * .7); ctx.lineTo(xx + 12, y); ctx.fill() } } });
  },
  draw(B) {
    if (B.gone) return; ctx.save(); ctx.globalAlpha = B.alpha * (1 - .65 * Soul.fadeFor(B.x)); const flash = {}; for (const l of LIMBS) { const lm = B.limbs[l]; if (lm.alive) flash[l] = Math.max(B.flash[l] || 0, lm.regrow) * .7 } drawRig(B, { flash });
    ctx.restore();
    // след оружия в ударе
    if (B.trail && B.trail.length > 1) { ctx.save(); ctx.lineCap = 'round'; for (let i = 1; i < B.trail.length; i++) { const a = B.trail[i - 1], b = B.trail[i], al = 1 - (B.t - b.t) / .22; if (al <= 0) continue; ctx.strokeStyle = B.R.axe ? `rgba(255,170,110,${.55 * al})` : `rgba(200,220,255,${.45 * al})`; ctx.lineWidth = (B.R.axe ? 22 : 30) * al; ctx.beginPath(); ctx.moveTo(sx(a.x), a.y); ctx.lineTo(sx(b.x), b.y); ctx.stroke() } ctx.restore() }
  },
};
