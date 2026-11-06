// walker.js — общая механика ходьбы для всех персонажей (вид сбоку, мир 2,5D: x — влево/вправо, z — глубина полосы пола).
// Правила ref2game: фаза стопы — по пройденному пути, опорная стопа держит точку на земле (якорь в мире, не скользит),
// колени — двухкостная IK, высота таза — от опорной ноги (и никогда выше, чем она достаёт), руки в противофазе ногам,
// тяжёлые персонажи — медленный шаг с «оседанием» веса, удар стопы трясёт землю. При остановке ноги «досеменивают»
// в ровную стойку под телом короткими шагами (стопа переставляется по воздуху, а не тянется по полу).
// Модуль ничего не рисует сам: update() считает позу и события шагов, рисование — у каждого персонажа своё.
(function (G) {
  const cl = (v, a, b) => Math.max(a, Math.min(b, v)), lp = (a, b, k) => a + (b - a) * k, TAU = Math.PI * 2;
  const sm = x => { x = cl(x, 0, 1); return x * x * (3 - 2 * x) };
  const fr = x => ((x % 1) + 1) % 1;

  // Пресеты походки. Длины — в долях длины ноги L (бедро→лодыжка); скорости — в L/с; stance — разнос стоп в покое.
  const GAITS = {
    hero:        { speed: 1.25, stride: 1.30, beta: .60, lift: .16, crouch: .02, lean: .06, bob: .9,  arm: .45, elbow: .25, heavy: 0,   dwell: 0,   shake: 0,   dust: .15, stance: .07 },
    ghoul:       { speed: 1.60, stride: 1.10, beta: .55, lift: .15, crouch: .16, lean: .42, bob: .5,  arm: .30, elbow: .9,  heavy: 0,   dwell: 0,   shake: 0,   dust: .10, armFwd: -1.05, twitch: 1, stance: .09 },
    knight:      { speed: .85,  stride: 1.05, beta: .64, lift: .10, crouch: .03, lean: .04, bob: 1.0, arm: .22, elbow: .35, heavy: .35, dwell: .10, shake: .08, dust: .35, stance: .08 },
    doctor:      { speed: 1.00, stride: 1.10, beta: .60, lift: .12, crouch: .05, lean: .14, bob: .6,  arm: .12, elbow: .8,  heavy: 0,   dwell: 0,   shake: 0,   dust: .10, armFwd: -.35, stance: .06 },
    goatman:     { speed: 1.05, stride: 1.25, beta: .60, lift: .17, crouch: .07, lean: .16, bob: 1.2, arm: .50, elbow: .45, heavy: .55, dwell: .12, shake: .25, dust: .55, digi: 1, stance: .09 },
    guardian:    { speed: .42,  stride: 1.20, beta: .70, lift: .12, crouch: .05, lean: .03, bob: 1.6, arm: .28, elbow: .25, heavy: 1.0, dwell: .32, shake: 1.0, dust: 1.0, cracks: 1, stance: .10 },
    executioner: { speed: .60,  stride: 1.15, beta: .66, lift: .14, crouch: .10, lean: .20, bob: 1.3, arm: .16, elbow: .55, heavy: .80, dwell: .22, shake: .7,  dust: .8,  cracks: 1, stance: .10 },
  };

  // Двухкостная IK в плоскости профиля: бедро (0,0) → лодыжка (x,y), колено вперёд (dir=+1) или назад (dir=-1)
  function ik2(x, y, L1, L2, dir) {
    let d = Math.hypot(x, y), clamp = 0; const mx = (L1 + L2) * .999; if (d > mx) { clamp = d - mx; x *= mx / d; y *= mx / d; d = mx }
    const a0 = Math.atan2(y, x), al = Math.acos(cl((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const ka = a0 - dir * al; return { kx: L1 * Math.cos(ka), ky: L1 * Math.sin(ka), ax: x, ay: y, clamp, flex: Math.PI - Math.acos(cl((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1)) }
  }

  function create(def) {
    const g = { ...GAITS[def.gait || 'hero'], ...(def.gaitOverride || {}) };
    return { def, g, x: def.x || 0, z: def.z ?? .5, face: def.face || 1, v: 0, F: .02, t: 0, sp: 0, spv: 0, lag: 0, lagv: 0, events: [], pose: null,
      feet: [{ st: true, ax: null, lx: 0, px: 0 }, { st: true, ax: null, lx: 0, px: 0 }] };
  }

  // input: { dir: -1|0|1, run: bool, dz?: -1..1, speedK?: множитель скорости, hold?: стоять (не шагать), crouch?: доп. присед (доля L), lean?: доп. наклон }
  function update(c, dt, input) {
    const { def, g } = c, L = def.L1 + def.L2; c.t += dt; c.events.length = 0;
    const want = (input.hold ? 0 : input.dir) * g.speed * L * (input.run ? (input.runK || 1.6) : 1) * (input.speedK || 1);
    if (input.dir && !input.hold && Math.sign(input.dir) !== c.face && Math.abs(c.v) < .05 * L) c.face = Math.sign(input.dir);
    const tgt = Math.sign(want) === c.face || !want ? Math.abs(want) : 0, acc = L * (g.heavy > .5 ? 1.2 : 3.5) * (input.accK || 1);
    let base = Math.abs(c.v); base += cl(tgt - base, -acc * dt, acc * dt); if (input.hold) base = Math.max(0, base - acc * 3 * dt);
    // доля движения и относительная скорость сглажены во времени: при резкой остановке перенос стопы не дёргается
    const rel0 = base / (g.speed * L), m0 = sm(base / (.25 * g.speed * L)); if (c.mf == null) { c.mf = m0; c.relf = rel0 }
    c.mf += (m0 - c.mf) * (1 - Math.exp(-dt * 9)); c.relf += (rel0 - c.relf) * (1 - Math.exp(-dt * 9)); const m = c.mf, rel = c.relf;
    // длина шага: короче на малой скорости, длиннее на бегу; каденс = скорость / длина шага
    const S = g.stride * L * lp(.45, 1, cl(rel, 0, 1)) * (rel > 1 ? lp(1, 1.3, cl(rel - 1, 0, 1)) : 1);
    // тяжёлая походка: тело замедляется в момент постановки стопы (вес оседает) и ускоряется в середине шага
    const ph = fr(c.F) % .5 * 2, surge = 1 - g.dwell * Math.cos(TAU * ph) * sm(base / (.3 * L));
    const v = Math.max(0, base * surge); c.v = base * c.face; c.x += c.face * v * dt;
    if (input.dz) c.z = cl(c.z + input.dz * dt * .5 * (g.speed / 1.2), 0, 1); // демо походок двигает глубину само; игра — своей логикой
    const beta = g.beta, nz = g.stance * L * (1 - m);
    // старт с места: обе стопы стоят; фаза ставится так, что первой отрывается задняя стопа (иначе первая опора
    // длится полный шаг и таз проваливается). Обе стопы остаются в опоре — визуально ничего не прыгает.
    const mv = base > .03 * L;
    if (mv && !c.moving && c.feet.every(f => f.st && f.ax != null)) { const tr = (c.feet[0].ax - c.feet[1].ax) * c.face < 0 ? 0 : 1; c.F = Math.floor(c.F) + beta - .01 - (tr ? .5 : 0) }
    c.moving = mv;
    // «досеменить» в стойку: если почти стоим, а стопа в воздухе или далеко от места под телом — фаза идёт дальше без хода тела
    let dF = v / S * dt;
    { // темп досеменивания нарастает плавно по мере остановки (без скачка скорости стопы)
      let need = false; const nz0 = g.stance * L;
      c.feet.forEach((f, i) => { const u = fr(c.F + (i ? .5 : 0)); if (u >= beta) need = true; else if (f.ax != null && Math.abs(f.ax - (c.x + c.face * (i ? -nz0 : nz0))) > .06 * L) need = true });
      const sr0 = need ? 1.1 * sm((.07 * L - base) / (.06 * L)) : 0; c.sr = (c.sr || 0) + (sr0 - (c.sr || 0)) * (1 - Math.exp(-dt * 7)); dF = Math.max(dF, c.sr * dt);
    }
    c.F += dF;
    const feet = [0, .5].map((o, i) => {
      const f = c.feet[i], u = fr(c.F + o), st = u < beta, neu = c.face * (i ? -nz : nz);
      let lift = 0;
      if (st) {
        if (!f.st || f.ax == null) { f.ax = f.ax == null ? c.x + neu : f.px; if (f.stInit) c.events.push({ type: 'step', foot: i, x: f.ax, z: c.z, power: g.heavy * m }), c.spv -= g.heavy * L * .7 * m; }
        f.stInit = 1; f.px = f.ax;
      } else {
        if (f.st) f.lx = f.ax ?? (c.x + neu);
        const q = (u - beta) / (1 - beta), q5 = q * q * q * (q * (q * 6 - 15) + 10);
        // точка постановки: где будет бедро к концу переноса + полшага вперёд (при остановке — место под телом)
        const tx = c.x + c.face * ((1 - q) * (1 - beta) * S * m + S * beta / 2 * m) + neu;
        f.px = lp(f.lx, tx, q5); lift = Math.pow(Math.sin(Math.PI * q), 2) * g.lift * L * Math.max(m, .35);
      }
      f.st = st;
      return { u, x: (f.px - c.x) * c.face, lift, st, wx: f.px };
    });
    // таз: перевёрнутый маятник над опорной ногой + присед персонажа + «оседание» от удара стопы (пружина).
    // Верхний предел — чтобы КАЖДАЯ нога доставала свою стопу (и опорная, и только что оторвавшаяся: иначе в начале
    // переноса таз подскакивает, а задняя нога «не достаёт» до носка). Минимумы — гладкие, без изломов траектории.
    const Lw = L * (1 - g.crouch), crL = (input.crouch || 0) * L, Lmax = L * .99, sk = 30 / L;
    const smin = a => { const mn = Math.min(...a); return mn - Math.log(a.reduce((q, v) => q + Math.exp(-sk * (v - mn)), 0)) / sk };
    const hs = feet.filter(f => f.st).map(f => Math.sqrt(Math.max(0, Lw * Lw - f.x * f.x))), hm = feet.map(f => f.lift + Math.sqrt(Math.max(0, Lmax * Lmax - f.x * f.x)));
    let h = hs.length ? smin(hs) : Lw; const hmax = smin(hm);
    h = lp(Lw, h, cl(cl(g.bob, 0, 2) * .5 + .5, 0, 1)); if (m < .05) h -= L * .004 * (1 + Math.sin(c.t * 1.6)) * (1 - m * 20);
    // цель для таза скачет, когда стопа меняет опору; таз догоняет её пружиной без перерегулирования (второй порядок)
    if (c.hf == null) { c.hf = h; c.hfv = 0 } const w = 20; c.hfv += (w * w * (h - c.hf) - 2 * w * c.hfv) * dt; c.hf += c.hfv * dt;
    c.spv += (-c.sp * 140 - c.spv * 16) * dt; c.sp += c.spv * dt;
    // предел досягаемости гладкий и с запасом: колено не выпрямляется до щелчка
    // присед (замах, удар) — поверх фильтра, без запаздывания: плечо оказывается ровно там, где рассчитано
    const hip = smin([c.hf + c.sp - crL, hmax - L * .02]);
    // ноги
    const legs = feet.map(f => { const r = ik2(f.x, hip - f.lift, def.L1, def.L2, g.digi ? -1 : 1); return { ...r, st: f.st, lift: f.lift, wx: f.wx, fx: f.x, u: f.u } });
    // корпус отстаёт и наклоняется; руки — маятник против ног: ближняя рука идёт вперёд, когда ближняя стопа уходит назад
    // (размах рук насыщается мягко, через tanh, — без излома)
    c.lagv += ((c.sp * .02 - c.lag) * 90 - c.lagv * 12) * dt; c.lag += c.lagv * dt;
    const s = Math.sin(TAU * c.F), lean = g.lean * (.3 + .7 * m) + c.lag + (g.twitch ? .03 * Math.sin(c.t * 23) * m : 0) + (input.lean || 0), half = Math.max(S * beta / 2, L * .05);
    const armBase = g.armFwd || 0, arms = [0, 1].map(i => { const fw = 1.2 * Math.tanh(-feet[i].x / half / 1.2), sw = -fw * g.arm * m; const ru = armBase + sw + .04 * Math.sin(c.t * 1.3 + i); return { ru, rf: ru - g.elbow * (.6 + .4 * Math.log(1 + Math.exp(4 * fw)) / 4) } });
    c.pose = { hip, legs, arms, lean, m, F: c.F, roll: .015 * s * m, S };
    return c.pose;
  }

  G.Walker = { GAITS, create, update, ik2 };
})(typeof window !== 'undefined' ? window : globalThis);
