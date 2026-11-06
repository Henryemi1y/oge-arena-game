// rig.js — сборка врагов и боссов из деталей (cut-out): бедро/голень/стопа, плечо/предплечье, круглые «шапки» колена,
// лодыжки и локтя, одежда, оружие, культи. Перенесено из src/characters/walkers.tpl.html (drawChar), геометрия вынесена
// в rigGeom(), чтобы по тем же точкам считать попадания. Локальные координаты: начало — таз, +x — вперёд, y — вниз.
const DRESS = {
  ghoul: { name: 'Гуль', gait: 'ghoul', size: .96, cloth: [[.52, .80, 'cloth']] },
  knight: { name: 'Падший рыцарь', gait: 'knight', size: 1.1, clothB: [.30, .78], clothF: [.70, .80], weapon: { off: -.95 } },
  doctor: { name: 'Чумной доктор', gait: 'doctor', cloth: [[.48, .74, 'cloth']], flask: 1 },
  goatman: { name: 'Козлорог', gait: 'goatman', size: 1.32, cloth: [[.55, .80, 'cloth']] },
  guardian: { name: 'Каменный страж', gait: 'guardian', boss: 1 },
  executioner: { name: 'Каменный палач', gait: 'executioner', boss: 1, axe: 1 },
};
const RIG = {};
function rigDef(id) {
  if (RIG[id]) return RIG[id];
  const P = ASSETS.ch[id], I = IM.ch[id], d = DRESS[id], l = P.legN, k = P._k;
  return RIG[id] = { id, P, I, ...d, k, L1: dist(l.root, l.joint), L2: dist(l.joint, l.end), foot: l.sole - l.end[1], scale: W.CS / k * (d.boss ? 1.7 : d.size || 1), ov: 12 * k / .5 };
}
// экранные координаты персонажа (для рисования и попаданий)
function rigXf(ch) { const s = ch.R.scale * zs(ch.z) * (ch.sMul || 1); const tk = ch.turnT > 0 ? ch.turnT / ch.turnD : 0, f = ch.face * (1 - 2 * tk) || .02; return { X: sx(ch.x) + f * s * (ch.hx || 0), Y: zy(ch.z) - (ch.pose.hip + ch.R.foot) * s + (ch.dy || 0), s, f } }
// разворот «через ребро»: при смене взгляда спрайт сжимается до ребра и раскрывается в другую сторону
function turnTick(ch, dt, dur) { if (ch.pf !== undefined && ch.pf !== ch.face) { ch.turnT = dur; ch.turnD = dur } ch.pf = ch.face; ch.turnT = Math.max(0, (ch.turnT || 0) - dt) }
function rigToWorld(ch, p, xf = rigXf(ch)) { return { x: ch.x + xf.f * xf.s * ((ch.hx || 0) + p[0]), y: xf.Y + xf.s * p[1] } }
function armChain(Pa, sh, ru, rf) {
  const U = dist(Pa.root, Pa.joint), Fa = dist(Pa.joint, Pa.end);
  const el = [sh[0] - Math.sin(ru) * U, sh[1] + Math.cos(ru) * U], wr = [el[0] - Math.sin(rf) * Fa, el[1] + Math.cos(rf) * Fa];
  const a1 = angOf(sh, el) - angOf(Pa.root, Pa.joint), a2 = angOf(el, wr) - angOf(Pa.joint, Pa.end);
  const hv = rot2([Pa.hand[0] - Pa.joint[0], Pa.hand[1] - Pa.joint[1]], a2);
  return { sh, el, wr, hand: [el[0] + hv[0], el[1] + hv[1]], a1, a2, U, Fa };
}
function rigGeom(ch) {
  const R = ch.R, P = R.P, po = ch.pose, t = P.torso, lean = po.lean;
  const Rt = (p, o = [0, 0]) => rot2([p[0] - t.hip[0] + o[0], p[1] - t.hip[1] + o[1]], lean);
  const shN = Rt(t.sh, [8, 0]), shF = Rt(t.sh, [-10, -4]), hipN = [6, 0], hipF = [-8, -3];
  const legs = [[hipN, po.legs[0], 'legN'], [hipF, po.legs[1], 'legF']].map(([h, L, part]) => ({ hip: h, kn: [h[0] + L.kx, h[1] + L.ky], an: [h[0] + L.ax, h[1] + L.ay], L, part }));
  const arms = [[shN, po.arms[0], 'armN'], [shF, po.arms[1], 'armF']].map(([sh, a, part]) => ({ ...armChain(P[part], sh, a.ru, a.rf), part }));
  const G = { legs, arms, neck: Rt(t.neck), lean, Rt, hipTop: Rt([t.hip[0], t.sh[1]]) };
  // оружие: меч рыцаря и топор палача — в ближней руке (или в дальней, если ближняя разрушена)
  if (R.weapon || R.axe) {
    const ai = ch.weaponArm || 0, A = arms[ai], wp = P.weapon; let rotW;
    if (R.axe) rotW = A.a2 + (ch.axeC ?? 1.55); else rotW = angOf(A.el, A.wr) - PI / 2 + R.weapon.off + PI;
    const tipLocal = R.axe ? wp.blade : wp.tip, tv = rot2([tipLocal[0] - wp.grip[0], tipLocal[1] - wp.grip[1]], rotW);
    G.weapon = { at: A.hand, rot: rotW, tip: [A.hand[0] + tv[0], A.hand[1] + tv[1]], arm: ai };
    if (R.axe) { const hv = rot2([wp.tip[0] - wp.grip[0], wp.tip[1] - wp.grip[1]], rotW); G.weapon.top = [A.hand[0] + hv[0], A.hand[1] + hv[1]] }
  }
  return G;
}
function rigPiece(img, piv, at, rot, clip) {
  ctx.save(); ctx.translate(at[0], at[1]); ctx.rotate(rot); ctx.translate(-piv[0], -piv[1]);
  if (clip) { ctx.beginPath(); if (clip.c) ctx.arc(clip.c[0], clip.c[1], clip.r, 0, TAU); else ctx.rect(-20, clip.y0, img.width + 40, clip.y1 - clip.y0); ctx.clip() }
  ctx.drawImage(img, 0, 0); ctx.restore();
}
// вариант картинки: '' — обычная, 'D' — затемнённая дальняя, 'W' — белый силуэт (вспышка попадания)
const rimg = (I, part, v, dark) => v === 'W' ? (I[part + 'W'] || I[part]) : dark ? (I[part + 'D'] || I[part]) : I[part];
function rigLeg(ch, G, li, v) {
  const R = ch.R, lg = G.legs[li], part = lg.part, P = R.P[part], I = rimg(R.I, part, v, li === 1), L = lg.L, ov = P.r * .55, ovA = R.ov;
  const a1 = angOf(lg.hip, lg.kn) - angOf(P.root, P.joint), a2 = angOf(lg.kn, lg.an) - angOf(P.joint, P.end);
  const a3 = L.st ? (L.footRot || 0) : (L.footRot ?? -.25 * Math.sin(PI * cl(L.lift / (ch.c.g.lift * (R.L1 + R.L2) + 1e-6), 0, 1)));
  rigPiece(I, P.end, lg.an, a3, { y0: P.end[1] - ovA, y1: I.height + 10 }); rigPiece(I, P.joint, lg.kn, a2, { y0: P.joint[1] - ov, y1: P.end[1] + ovA });
  rigPiece(I, P.end, lg.an, a2, { c: P.end, r: ovA + 6 }); rigPiece(I, P.root, lg.hip, a1, { y0: -10, y1: P.joint[1] + ov }); rigPiece(I, P.joint, lg.kn, a1, { c: P.joint, r: P.r * .92 });
}
function rigArm(ch, G, ai, v) {
  const R = ch.R, A = G.arms[ai], part = A.part, P = R.P[part], I = rimg(R.I, part, v, ai === 1), ov = P.r * .55;
  rigPiece(I, P.joint, A.el, A.a2, { y0: P.joint[1] - ov, y1: I.height + 10 }); rigPiece(I, P.root, A.sh, A.a1, { y0: -10, y1: P.joint[1] + ov }); rigPiece(I, P.joint, A.el, A.a1, { c: P.joint, r: P.r * .9 });
}
function rigWeapon(ch, G, v) { const R = ch.R, w = G.weapon; if (!w || ch.noWeapon) return; const I = rimg(R.I, 'weapon', v, w.arm === 1 && !R.axe); rigPiece(I, R.P.weapon.grip, w.at, w.rot) }
// культя: верхушка детали в точке крепления, поворот вместе с корпусом
function rigStump(ch, G, name, v) {
  const R = ch.R, P = R.P[name], I = rimg(R.I, name, v, /F$/.test(name)), isSh = name.startsWith('stumpSh'), lim = R.P[isSh ? (name.endsWith('N') ? 'armN' : 'armF') : (name.endsWith('N') ? 'legN' : 'legF')];
  const base = isSh ? G.arms[name.endsWith('N') ? 0 : 1].sh : G.legs[name.endsWith('N') ? 0 : 1].hip, r = lim.r ? (lim.root[1] - 0) : 0;
  const off = rot2([0, -lim.root[1] * .95], isSh ? G.lean : G.lean * .5), at = [base[0] + off[0], base[1] + off[1]];
  rigPiece(I, P.top, at, (isSh ? G.lean : G.lean * .5) + (ch.stumpTilt || 0));
}
function drawRig(ch, opt = {}) {
  const R = ch.R, P = R.P, I = R.I, po = ch.pose, t = P.torso, lean = po.lean, v = opt.v || '', only = opt.only, miss = ch.missing || {};
  const G = ch.G || rigGeom(ch), Rt = G.Rt, tw = I.torso.width, th = I.torso.height;
  const xf = rigXf(ch); ctx.save(); ctx.translate(xf.X, xf.Y); ctx.scale(xf.f * xf.s, xf.s);
  const want = n => !only || only === n;
  // вспышка попадания по конечности — в её собственном слое (дальняя не перекрывает ближнюю)
  const lit = (part, fn) => { fn(v); const a = opt.flash && opt.flash[part]; if (a > 0 && v !== 'W') { ctx.save(); ctx.globalAlpha *= a; fn('W'); ctx.restore() } };
  // дальняя рука, дальняя нога, задняя пола
  if (want('armF')) { if (miss.armF) { if (!only) rigStump(ch, G, 'stumpShF', v) } else { if (G.weapon && G.weapon.arm === 1) rigWeapon(ch, G, v); lit('armF', w => rigArm(ch, G, 1, w)) } }
  if (want('legF')) { if (miss.legF) { if (!only) rigStump(ch, G, 'stumpHipF', v) } else lit('legF', w => rigLeg(ch, G, 1, w)) }
  if (!only && R.clothB) rigPiece(rimg(I, 'clothB', v), P.clothB.top, Rt([R.clothB[0] * tw, R.clothB[1] * th]), lean * .4 + (ch.cloth || 0) * 1.2);
  if (want('legN')) { if (miss.legN) { if (!only) rigStump(ch, G, 'stumpHipN', v) } else lit('legN', w => rigLeg(ch, G, 0, w)) }
  if (!only) {
    rigPiece(rimg(I, 'torso', v), t.hip, [0, 0], lean);
    if (R.cloth) for (const [fx, fy, name] of R.cloth) rigPiece(rimg(I, name, v), P[name].top, Rt([fx * tw, fy * th]), lean * .4 + (ch.cloth || 0));
    if (R.clothF) rigPiece(rimg(I, 'clothF', v), P.clothF.top, Rt([R.clothF[0] * tw, R.clothF[1] * th]), lean * .4 + (ch.cloth || 0) * .8);
    rigPiece(rimg(I, 'head', v), P.head.neck, G.neck, lean * .5 + (ch.headRot || 0) + .03 * Math.sin(ch.c.t * 1.3));
  }
  if (want('armN')) {
    if (miss.armN) { if (!only) rigStump(ch, G, 'stumpShN', v) }
    else {
      if (R.flask && !ch.flaskOut && !only) rigPiece(rimg(I, 'flask', v), P.flask.grip, G.arms[0].hand, -.3);
      if (G.weapon && G.weapon.arm === 0) rigWeapon(ch, G, v);
      lit('armN', w => rigArm(ch, G, 0, w));
    }
  }
  if (opt.joints) { ctx.fillStyle = '#ffd84a'; for (const l of G.legs) for (const p of [l.hip, l.kn, l.an]) { ctx.beginPath(); ctx.arc(p[0], p[1], 4 / xf.s, 0, TAU); ctx.fill() } }
  ctx.restore();
  return G;
}
// Мир 2,5D: у каждой стопы своя точка на полу (x и глубина). walker.js считает шаг вдоль пути; здесь смещение стопы
// раскладывается по направлению движения: опорная стопа держит точку, переносимая плавно приходит в точку постановки.
// Нога тянется к стопе той же IK; таз опускается, если стопа ближе к зрителю и иначе не достать.
function depthLegs(ch, dir) {
  const po = ch.pose, R = ch.R, s = R.scale * zs(ch.z) * (ch.sMul || 1), L = R.L1 + R.L2, g = ch.c.g, fs = ch.fs || (ch.fs = [{}, {}]);
  if (dir) ch.lastDir = dir; dir = ch.lastDir || { x: ch.face, z: 0 };
  const lx = [], dy = [];
  po.legs.forEach((l, i) => {
    const F = fs[i], rel = l.fx ?? l.ax, ex = ch.x + rel * s * dir.x, ez = ch.z + rel * s * dir.z / ZPX;
    // в подскоке (отброс от удара) стопы в воздухе и едут с телом; встают на новое место при приземлении
    if (l.st && !(ch.dy < -.5)) { if (!F.st || F.x == null) { F.x = ex; F.z = ez } F.px = F.x; F.pz = F.z }
    else if (l.st) { F.x = F.px = ex; F.z = F.pz = ez; F.st = false; lx[i] = (ex - ch.x) * ch.face / s; dy[i] = (ez - ch.z) * ZPX / s; return }
    else { if (F.st) { F.cx = (F.x ?? ex) - ex; F.cz = (F.z ?? ez) - ez } const q = cl(((l.u ?? 1) - g.beta) / (1 - g.beta), 0, 1), k = 1 - sm(q); F.px = ex + (F.cx || 0) * k; F.pz = ez + (F.cz || 0) * k }
    F.st = l.st; lx[i] = (F.px - ch.x) * ch.face / s; dy[i] = (F.pz - ch.z) * ZPX / s;
  });
  const Lmax = L * .985, cap = po.legs.map((l, i) => l.lift - dy[i] + Math.sqrt(Math.max(0, Lmax * Lmax - lx[i] * lx[i]))), sk = 30 / L;
  const smin = a => { const mn = Math.min(...a); return mn - Math.log(a.reduce((q, v) => q + Math.exp(-sk * (v - mn)), 0)) / sk };
  po.hip = smin([po.hip, smin(cap) - L * .012]);
  po.legs = po.legs.map((l, i) => ({ ...l, ...Walker.ik2(lx[i], po.hip - l.lift + dy[i], R.L1, R.L2, g.digi ? -1 : 1), dz: dy[i] }));
}
// тень на полу
function drawShadow(x, z, w, a = .38) { const X = sx(x), Y = zy(z), k = zs(z); ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.ellipse(X, Y + 1, w * k, w * k * .16, 0, 0, TAU); ctx.fill() }
// рисование персонажа во внеэкранный холст (для рассыпания на куски)
function renderToCanvas(drawFn, x0, y0, w, h) {
  const c = mkCanvas(w, h), old = ctx; ctx = c.getContext('2d'); ctx.translate(-x0, -y0);
  try { drawFn() } finally { ctx = old }
  return c;
}
