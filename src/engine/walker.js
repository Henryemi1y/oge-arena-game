// walker.js — общая механика ходьбы для всех персонажей (вид сбоку, мир 2,5D: x — влево/вправо, z — глубина полосы пола).
// Правила ref2game: фаза стопы — по пройденному пути (стопа не скользит), колени — двухкостная IK, высота таза — от опорной
// ноги, руки в противофазе ногам, тяжёлые персонажи — медленный шаг с «оседанием» веса, удар стопы трясёт землю.
// Модуль ничего не рисует сам: update() считает позу и события шагов, рисование — у каждого персонажа своё.
(function (G) {
  const cl = (v, a, b) => Math.max(a, Math.min(b, v)), lp = (a, b, k) => a + (b - a) * k, TAU = Math.PI * 2;
  const sm = x => { x = cl(x, 0, 1); return x * x * (3 - 2 * x) };

  // Пресеты походки. Длины — в долях длины ноги L (бедро→лодыжка); скорости — в L/с.
  const GAITS = {
    hero:        { speed: 1.25, stride: 1.30, beta: .60, lift: .16, crouch: .02, lean: .06, bob: .9,  arm: .45, elbow: .25, heavy: 0,   dwell: 0,   shake: 0,   dust: .15 },
    ghoul:       { speed: 1.70, stride: 1.10, beta: .55, lift: .18, crouch: .16, lean: .42, bob: .5,  arm: .30, elbow: .9,  heavy: 0,   dwell: 0,   shake: 0,   dust: .10, armFwd: -1.05, twitch: 1 },
    knight:      { speed: .85,  stride: 1.05, beta: .64, lift: .10, crouch: .03, lean: .04, bob: 1.0, arm: .22, elbow: .35, heavy: .35, dwell: .10, shake: .08, dust: .35 },
    doctor:      { speed: 1.00, stride: 1.10, beta: .60, lift: .12, crouch: .05, lean: .14, bob: .6,  arm: .12, elbow: .8,  heavy: 0,   dwell: 0,   shake: 0,   dust: .10, armFwd: -.35 },
    goatman:     { speed: 1.05, stride: 1.25, beta: .60, lift: .17, crouch: .07, lean: .16, bob: 1.2, arm: .50, elbow: .45, heavy: .55, dwell: .12, shake: .25, dust: .55, digi: 1 },
    guardian:    { speed: .42,  stride: 1.20, beta: .70, lift: .12, crouch: .05, lean: .03, bob: 1.6, arm: .28, elbow: .25, heavy: 1.0, dwell: .32, shake: 1.0, dust: 1.0, cracks: 1 },
    executioner: { speed: .60,  stride: 1.15, beta: .66, lift: .14, crouch: .10, lean: .20, bob: 1.3, arm: .16, elbow: .55, heavy: .80, dwell: .22, shake: .7,  dust: .8,  cracks: 1 },
  };

  // Двухкостная IK в плоскости профиля: бедро (0,0) → лодыжка (x,y), колено вперёд (dir=+1) или назад (dir=-1)
  function ik2(x, y, L1, L2, dir) {
    let d = Math.hypot(x, y); const mx = (L1 + L2) * .999; if (d > mx) { x *= mx / d; y *= mx / d; d = mx }
    const a0 = Math.atan2(y, x), al = Math.acos(cl((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const ka = a0 - dir * al; return { kx: L1 * Math.cos(ka), ky: L1 * Math.sin(ka), ax: x, ay: y, flex: Math.PI - Math.acos(cl((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1)) }
  }

  function create(def) {
    const g = { ...GAITS[def.gait || 'hero'], ...(def.gaitOverride || {}) };
    return { def, g, x: def.x || 0, z: def.z ?? .5, face: 1, v: 0, F: Math.random(), t: 0, sp: 0, spv: 0, lag: 0, lagv: 0, prevSt: [true, true], events: [], pose: null };
  }

  // input: { dir: -1|0|1, dz: -1..1, run: bool }
  function update(c, dt, input) {
    const { def, g } = c, L = def.L1 + def.L2; c.t += dt; c.events.length = 0;
    const want = input.dir * g.speed * L * (input.run ? 1.6 : 1);
    if (input.dir && Math.sign(input.dir) !== c.face && Math.abs(c.v) < .05 * L) c.face = Math.sign(input.dir);
    const tgt = Math.sign(want) === c.face || !want ? Math.abs(want) : 0, acc = L * (g.heavy > .5 ? 1.2 : 3.5);
    let base = Math.abs(c.v); base += cl(tgt - base, -acc * dt, acc * dt);
    // тяжёлая походка: тело замедляется в момент постановки стопы (вес оседает) и ускоряется в середине шага
    const S = g.stride * L, ph = ((c.F % .5) + .5) % .5 * 2, surge = 1 - g.dwell * Math.cos(TAU * ph) * sm(base / (.3 * L));
    const v = Math.max(0, base * surge); c.v = base * c.face; c.x += c.face * v * dt; c.z = cl(c.z + (input.dz || 0) * dt * .5 * (g.speed / 1.2), 0, 1);
    const m = sm(base / (.25 * g.speed * L)); c.F += v / S * dt;
    // стопы: опора — стопа стоит на земле (по пути), перенос — квинтика вперёд с подъёмом
    const feet = [0, .5].map((o, i) => {
      const u = ((c.F + o) % 1 + 1) % 1, beta = g.beta; let x, lift = 0, st = u < beta;
      if (st) x = S * beta * (.5 - u / beta) * m; else { const q = (u - beta) / (1 - beta), q5 = q * q * q * (q * (q * 6 - 15) + 10); x = (-S * beta / 2 + S * beta * q5) * m; lift = Math.pow(Math.sin(Math.PI * q), 2) * g.lift * L * m }
      return { u, x, lift, st };
    });
    // события шага: стопа коснулась земли
    feet.forEach((f, i) => { if (f.st && !c.prevSt[i] && m > .3) { c.events.push({ type: 'step', foot: i, x: c.x + c.face * f.x, z: c.z, power: g.heavy * m }); c.spv -= g.heavy * L * 1.4 } c.prevSt[i] = f.st });
    // таз: перевёрнутый маятник над опорной ногой + присед персонажа + «оседание» от удара стопы (пружина)
    const Lw = L * (1 - g.crouch); let h = 1e9;
    for (const f of feet) if (f.st) h = Math.min(h, Math.sqrt(Math.max(0, Lw * Lw - f.x * f.x)));
    if (h > 1e8) h = Lw; h = lp(Lw, h, cl(g.bob, 0, 2) * .5 + .5); if (!m) h = Lw - L * .004 * (1 + Math.sin(c.t * 1.6));
    c.spv += (-c.sp * 140 - c.spv * 16) * dt; c.sp += c.spv * dt;
    const hip = h + c.sp;
    // ноги
    const legs = feet.map(f => { const r = ik2(f.x, hip - f.lift, def.L1, def.L2, g.digi ? -1 : 1); return { ...r, st: f.st, lift: f.lift } });
    // корпус отстаёт и наклоняется; руки — маятник против ног
    c.lagv += ((c.sp * .02 - c.lag) * 90 - c.lagv * 12) * dt; c.lag += c.lagv * dt;
    const s = Math.sin(TAU * c.F), lean = g.lean * (.3 + .7 * m) + c.lag + (g.twitch ? .03 * Math.sin(c.t * 23) * m : 0);
    const armBase = g.armFwd || 0, arms = [0, 1].map(i => { const sw = (i ? 1 : -1) * s * g.arm * m; const ru = armBase + sw + .04 * Math.sin(c.t * 1.3 + i); return { ru, rf: ru - g.elbow * (.6 + .4 * Math.max(0, -sw / Math.max(g.arm, .01))) } });
    c.pose = { hip, legs, arms, lean, m, F: c.F, roll: .015 * s * m };
    return c.pose;
  }

  G.Walker = { GAITS, create, update, ik2 };
})(typeof window !== 'undefined' ? window : globalThis);
