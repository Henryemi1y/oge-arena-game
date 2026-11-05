// critic.js — числовые проверки анимации и правил (запускаются из tools/qa_game.js в Playwright, можно и из консоли:
// __game.Critic.all()). Герой — критик из hero_run.html без изменений; враги и боссы — тот же набор метрик на walker.js;
// плюс: удары босса попадают в точку прицеливания; в форме души тело не наносит урона.
const Critic = {
  impacts: [], fake: 0,
  hero() { const r = Hero.critic(); return { score: r.score, R: r.R.map(x => [x[0], +x[1].toFixed(3), x[2], x[4]]) } },
  // профиль скорости: стоит → шаг → стоп → разворот → шаг назад → стоп → бег → стоп
  walker(id) {
    const R = rigDef(id), c = Walker.create({ ...R, gait: R.gait, x: 0, face: 1 }), L = R.L1 + R.L2, dt = 1 / 60;
    const prof = t => t < 1 ? 0 : t < 5 ? 1 : t < 7 ? 0 : t < 11 ? -1 : t < 13 ? 0 : t < 17 ? 2 : 0;
    const M = { slip: 0, sole: 0, stretch: 0, clamp: 0, jerk: 0, jerkK: '', lift: 0 }, prev = [null, null], hipW = [], thigh = [], arm = [], hist = [], J = { walk: [0, ''], run: [0, ''], trans: [0, ''] };
    for (let n = 0; n < 19 * 60; n++) {
      const t = n * dt, p = prof(t), po = Walker.update(c, dt, { dir: Math.sign(p), run: Math.abs(p) > 1 });
      po.legs.forEach((l, i) => {
        if (l.st && prev[i] && prev[i].st) M.slip = Math.max(M.slip, Math.abs(l.wx - prev[i].wx) / L * 100);
        prev[i] = { st: l.st, wx: l.wx };
        if (l.st) M.sole = Math.max(M.sole, Math.abs(l.ay - po.hip) / L * 100);
        M.stretch = Math.max(M.stretch, Math.abs(Math.hypot(l.kx, l.ky) - R.L1) / L * 100, Math.abs(Math.hypot(l.ax - l.kx, l.ay - l.ky) - R.L2) / L * 100);
        if (l.clamp > L * .005) M.clamp++;
      });
      // углы в мире; кадр разворота спрайта (зеркало) пропускается — это не рывок сустава
      if (c.face !== (c._pf ?? c.face)) hist.length = 0; c._pf = c.face;
      const f = c.face, wa = (x, y) => Math.atan2(y, x * f), wr = r => f > 0 ? r : -r;
      const cur = [wa(po.legs[0].kx, po.legs[0].ky), wa(po.legs[0].ax - po.legs[0].kx, po.legs[0].ay - po.legs[0].ky), wa(po.legs[1].kx, po.legs[1].ky), wa(po.legs[1].ax - po.legs[1].kx, po.legs[1].ay - po.legs[1].ky), wr(po.arms[0].ru), wr(po.arms[0].rf), wr(po.arms[1].ru), wr(po.lean)];
      hist.push(cur); if (hist.length >= 3) { const a = hist[hist.length - 3], b = hist[hist.length - 2], w = t > 2.5 && t < 4.9 ? 'walk' : t > 15 && t < 16.9 ? 'run' : 'trans', nv = Math.max(1, (Math.abs(c.v) / (c.g.speed * L)) ** 2); // норма по квадрату скорости — как у критика героя
        for (let k = 0; k < cur.length; k++) { const q = Math.abs(angDiff(b[k], cur[k]) - angDiff(a[k], b[k])) / nv; if (q > J[w][0]) J[w] = [q, ['бедро', 'голень', 'бедро д.', 'голень д.', 'плечо', 'предпл.', 'плечо д.', 'корпус'][k] + ' @' + t.toFixed(2)] } }
      if (t > 3 && t < 5) { hipW.push(po.hip); thigh.push(po.legs[0].ax); arm.push(-po.arms[0].ru) }
    }
    const mean = a => a.reduce((x, y) => x + y, 0) / a.length, cor = (a, b) => { const ma = mean(a), mb = mean(b); let n = 0, da = 0, db = 0; for (let i = 0; i < a.length; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2 } return n / Math.sqrt(da * db + 1e-12) };
    const sc = (v, thr) => v <= thr ? 10 : Math.round(10 * cl(1 - (v - thr) / (3 * thr), 0, 1) * 10) / 10;
    const pel = (Math.max(...hipW) - Math.min(...hipW)) / L * 100, c2 = cor(thigh, arm);
    const Rr = [['Скольжение опорной стопы', M.slip, '% ноги/кадр', .05], ['Стопа над землёй в опоре', M.sole, '% ноги', .5], ['Растяжение костей', M.stretch, '% ноги', .3], ['Нога не достаёт (IK)', M.clamp, 'кадров', 0],
      ['Рывок сустава (шаг)', J.walk[0], 'рад/кадр²', .03], ['Рывок сустава (бег)', J.run[0], 'рад/кадр²', .03], ['Рывок сустава (старт/стоп/разворот)', J.trans[0], 'рад/кадр²', .03], ['Качание таза (шаг)', pel, '% ноги', 9], ['Руки против ног', c2, 'корр.', -.5]];
    const R2 = Rr.map(([n, v, u, thr]) => [n, +v.toFixed(4), u, n === 'Руки против ног' ? (v < thr ? 10 : 0) : n.startsWith('Нога не') ? (v ? 0 : 10) : sc(v, thr)]);
    return { id, score: Math.min(...R2.map(r => r[3])), R: R2, jerkAt: [J.walk[1], J.run[1], J.trans[1]].join(' / ') };
  },
  // каждый удар босса: точка удара (кулак или лезвие) против точки прицеливания, в пикселях экрана
  bossStrikes(id) {
    const out = [], keys = BOSSDEF[id].atks.filter(k => k !== 'stomp'), H = Hero.H;
    for (const key of keys) for (const d of [.42, .55, .7, .85, 1.0]) for (const dz of [0, .08]) for (const gait of ['walk', 'hop', 'sit']) {
      Boss.reset(); const B = Boss.spawn(id); B.st = 'move'; B.alpha = 1; B.x = 1700; B.z = .5; B.face = -1; B.c.face = -1;
      if (gait === 'hop') { B.limbs.legF.alive = false; B.missing.legF = true } if (gait === 'sit') { B.limbs.legF.alive = B.limbs.legN.alive = false; B.missing.legF = B.missing.legN = true }
      H.x = B.x - 3000; for (let i = 0; i < 30 || (B.hop && B.hop.on && i < 300); i++) Boss.update(1 / 60); H.x = B.x - 50; B.st = 'stagger'; B.t = 0; B.x = 1700; B.face = B.c.face = -1; if (B.hop) B.hop.fx = B.x; for (let i = 0; i < 4; i++) Boss.update(1 / 60);
      const A = (B.R.axe && key === 'wave') ? { ...BATK.chop, far: 1, D: .45, dmg: 14, r: 60, key } : { ...BATK[key], key }, reach = Boss.armReach(B, A) * Boss.s(B);
      H.x = B.x - reach * d; H.z = B.z + dz; const T = Boss.targetFor(B, A);
      const pl = Boss.plan(B, A, T); if (!pl) { out.push({ key, d, dz, gait, ok: null }); continue }
      Boss.startAtk(B, A, T, pl); let n = 0; while (B.atk && !B.atk.done && n++ < 400) Boss.update(1 / 60);
      const L = B.lastImpact; out.push({ key, d, dz, gait, err: L ? +L.err.toFixed(2) : null, ok: L ? L.err < 4 : false });
    }
    Boss.reset(); return out;
  },
  // форма души: тело рубит босса, но HP конечностей не меняется; урон герою тоже не проходит
  soulNoDamage() {
    Game.start(); Game.test = true; Game.pi = 1; Game.next(); for (let i = 0; i < 200; i++) Game.step(1 / 60);
    const B = Boss.b; if (!B) return { ok: false, why: 'нет босса' };
    for (let i = 0; i < 120; i++) Game.step(1 / 60);
    Boss.breakLimb(B, 'legN'); const hp0 = LIMBS.map(l => B.limbs[l].hp), hhp = Hero.H.hp; this.fake = 0; let blades = 0;
    for (let i = 0; i < 60 * 12; i++) { Game.step(1 / 60); if (Hero.H.blade) blades++ }
    const hp1 = LIMBS.map(l => B.limbs[l].hp), same = hp0.every((v, i) => v === hp1[i]);
    return { ok: same && Hero.H.hp === hhp && Soul.on, limbHpBefore: hp0, limbHpAfter: hp1, heroHp: [hhp, Hero.H.hp], bodySwingFrames: blades, bodyBladeContacts: this.fake, soulStillOn: Soul.on };
  },
  all() { const r = { hero: this.hero(), walkers: Object.keys(DRESS).map(id => this.walker(id)) }; r.strikes = ['guardian', 'executioner'].map(id => ({ id, list: this.bossStrikes(id) })); return r },
};
window.__game && (window.__game.Critic = Critic);
