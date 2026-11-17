// audio.js — звук без файлов: синтез WebAudio. Музыка — генеративный цикл в ля миноре (режимы: титул, волна, босс, душа),
// эффекты — шаги, взмахи, попадания, камень, тряска, осколки, ответы, душа.
const Snd = (() => {
  let ac = null, master, musicG, sfxG, verbIn, hallIn, noiseBuf, muted = false, mode = 'title', drone = null, vol = .85;
  const g = (dest, v) => { const n = ac.createGain(); n.gain.value = v; n.connect(dest); return n };
  function impulse(sec, decay) { const r = ac.sampleRate, n = r * sec, b = ac.createBuffer(2, n, r); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay) } return b }
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return; ac = new C();
    master = g(ac.destination, muted ? 0 : vol);
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(master);
    musicG = g(comp, .32); sfxG = g(comp, .9);
    const cv = ac.createConvolver(); cv.buffer = impulse(2.8, 2.4); verbIn = g(cv, 1); cv.connect(g(comp, .32));
    const hv = ac.createConvolver(); hv.buffer = impulse(5.5, 2.8); hallIn = g(hv, 1); hv.connect(g(comp, .42));
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    startMusic();
  }
  const now = () => ac.currentTime;
  function env(node, t, a, peak, dec, sus = 0.0001) { const p = node.gain; p.cancelScheduledValues(t); p.setValueAtTime(.0001, t); p.exponentialRampToValueAtTime(Math.max(peak, .0002), t + a); p.exponentialRampToValueAtTime(Math.max(sus, .0001), t + a + dec) }
  function tone(f0, f1, type, dur, vol, opt = {}) {
    if (!ac) return; const { t = now(), a = .005, dest = sfxG, verb = 0, det = 0 } = opt, o = ac.createOscillator(), e = ac.createGain(); o.type = type; o.detune.value = det; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    env(e, t, a, vol, dur); o.connect(e); e.connect(dest); if (verb) { const s = g(verbIn, verb); e.connect(s) } o.start(t); o.stop(t + a + dur + .05)
  }
  function noise(dur, ftype, f0, f1, q, vol, opt = {}) {
    if (!ac) return; const { t = now(), a = .004, dest = sfxG, verb = 0 } = opt, s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ac.createBiquadFilter(); f.type = ftype; f.Q.value = q; f.frequency.setValueAtTime(f0, t); if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
    const e = ac.createGain(); env(e, t, a, vol, dur); s.connect(f).connect(e).connect(dest); if (verb) e.connect(g(verbIn, verb)); s.start(t, Math.random()); s.stop(t + a + dur + .05)
  }
  // ---------- «оркестр» для заряда и ульты ----------
  // голос хора: три пилы с лёгкой расстройкой и вибрато через два формантных фильтра (гласная «а»); держится, пока не отпустят
  function voice(f, opt = {}) {
    const { t = now(), a = .4, vol = .05, dest = sfxG, verb = .5, hall = 0, vowel = [760, 1150] } = opt, out = ac.createGain(), e = ac.createGain();
    const lfo = ac.createOscillator(), ld = ac.createGain(); lfo.frequency.value = 5.1 + Math.random() * .6; ld.gain.value = 7; lfo.connect(ld);
    const f1 = ac.createBiquadFilter(), f2 = ac.createBiquadFilter(), lp_ = ac.createBiquadFilter(); f1.type = f2.type = 'bandpass'; f1.frequency.value = vowel[0]; f1.Q.value = 4; f2.frequency.value = vowel[1]; f2.Q.value = 5; lp_.type = 'lowpass'; lp_.frequency.value = 3200;
    const g2 = g(out, .55); f1.connect(out); f2.connect(g2); const os = [-9, 0, 8].map(d => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; ld.connect(o.detune); o.connect(lp_); o.start(t); return o });
    lp_.connect(f1); lp_.connect(f2); out.gain.value = 2.2; out.connect(e); e.gain.setValueAtTime(.0001, t); e.gain.exponentialRampToValueAtTime(vol, t + a); e.connect(dest);
    if (verb) e.connect(g(verbIn, verb)); if (hall) e.connect(g(hallIn, hall)); lfo.start(t);
    // затухание от того уровня, который будет в момент at (а не от текущего): так можно назначить его заранее
    return { e, stop(r = .3, at = now()) { e.gain.cancelScheduledValues(at); e.gain.setTargetAtTime(.0001, at, r / 5); os.forEach(o => o.stop(at + r + .05)); lfo.stop(at + r + .05) } };
  }
  // колокол: неровные обертоны с долгим затуханием
  function oBell(f, vol, dur = 3, opt = {}) { const { t = now(), verb = .7, hall = 0 } = opt;[[.5, .35], [1, 1], [1.19, .35], [1.5, .3], [2, .45], [2.74, .25], [4.07, .12]].forEach(([r, a], i) => tone(f * r, f * r, 'sine', dur * (1 - i * .09), vol * a, { t, a: .004, verb })); if (hall) tone(f, f, 'sine', dur, vol * .6, { t, dest: hallIn }) }
  // медь: аккорд пил, фильтр раскрывается ударом и медленно закрывается
  function oBrass(fs, vol, dur, opt = {}) {
    const { t = now(), verb = .5, hall = 0 } = opt, f = ac.createBiquadFilter(), e = ac.createGain(); f.type = 'lowpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(250, t); f.frequency.exponentialRampToValueAtTime(2800, t + .07); f.frequency.exponentialRampToValueAtTime(500, t + dur);
    env(e, t, .03, vol, dur); f.connect(e).connect(sfxG); if (verb) e.connect(g(verbIn, verb)); if (hall) e.connect(g(hallIn, hall));
    for (const x of fs) for (const d of [-6, 6]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = x; o.detune.value = d; o.connect(f); o.start(t); o.stop(t + dur + .1) }
  }
  // литавра
  function timp(f, vol, opt = {}) { const { t = now(), verb = .4, hall = 0 } = opt; tone(f * 1.25, f, 'sine', 1.2, vol, { t, a: .003, verb }); tone(f * 2.02, f * 1.95, 'sine', .5, vol * .3, { t, a: .003 }); noise(.18, 'lowpass', 500, 160, .8, vol * .5, { t }); if (hall) tone(f, f, 'sine', 1, vol * .5, { t, dest: hallIn }) }
  // тарелка (обычная и «обратная» — нарастающая к удару)
  function crash(vol, dur, opt = {}) { const { t = now(), rev = 0, hall = .6 } = opt; if (rev) { noise(dur, 'highpass', 2500, 6000, .7, vol, { t, a: dur * .97 }) } else { noise(dur, 'highpass', 5000, 3500, .6, vol, { t, a: .004, verb: .6 }); noise(dur * .7, 'bandpass', 8500, 7000, 1.5, vol * .5, { t }); noise(dur, 'highpass', 4000, 3000, .6, vol * hall, { t, dest: hallIn }) } }
  const A = 55; // ля: всё в ля, как и музыка
  // ---------- эффекты ----------
  const S = {
    step(p = .3, heavy = 0) { if (!ac) return; if (heavy) { tone(72, 30, 'sine', .55, .25 + .55 * p); noise(.45, 'lowpass', 260, 90, .7, .28 * p) } else { noise(.05, 'bandpass', 900, 600, 1.2, .045 + .05 * p); tone(130, 70, 'sine', .07, .05 + .05 * p) } },
    swing(k = 0) { noise(.2 + .03 * k, 'bandpass', 500 + 120 * k, 2600, 1.6, .22, { a: .03 }) },
    hit() { tone(150, 50, 'sine', .16, .45); noise(.09, 'lowpass', 1600, 400, .8, .32) },
    stoneHit() { tone(1900, 900, 'triangle', .07, .16); noise(.09, 'highpass', 2800, 2000, .7, .22); tone(95, 48, 'sine', .22, .38) },
    clang() { tone(2350, 2300, 'triangle', .35, .12); tone(3170, 3100, 'triangle', .25, .08); noise(.06, 'highpass', 4000, 3000, .7, .12) },
    breakStone() { if (!ac) return; const t = now(); noise(.9, 'lowpass', 900, 120, .6, .6); tone(60, 28, 'sine', .8, .6); for (let i = 0; i < 14; i++) noise(.04 + Math.random() * .05, 'bandpass', 1500 + Math.random() * 3000, 1200, 2, .12 + Math.random() * .1, { t: t + Math.random() * .6 }) },
    quake(p = 1) { noise(1.1, 'lowpass', 140, 60, .8, .45 * p); tone(45, 30, 'sine', 1, .35 * p) },
    pickup() { if (!ac) return; const t = now(); tone(880, 880, 'sine', .25, .2, { verb: .5 }); tone(1320, 1320, 'sine', .35, .16, { t: t + .07, verb: .6 }) },
    place() { if (!ac) return; const t = now(); tone(523, 523, 'triangle', .5, .2, { verb: .7 }); tone(784, 784, 'sine', .6, .12, { t: t + .04, verb: .7 }) },
    correct() { if (!ac) return; const t = now();[440, 554, 659, 880, 1109].forEach((f, i) => tone(f, f, 'triangle', .9, .17, { t: t + i * .09, verb: .8 })) },
    wrong() { if (!ac) return; tone(233, 110, 'sawtooth', .7, .12); tone(220, 104, 'sawtooth', .7, .12, { det: 12 }); noise(.5, 'lowpass', 400, 120, .7, .2) },
    soulOut() { noise(.9, 'bandpass', 300, 3000, 1.2, .22, { a: .2, verb: .8 }); tone(440, 990, 'sine', .9, .1, { a: .2, verb: 1 }) },
    soulIn() { noise(.7, 'bandpass', 3000, 300, 1.2, .2, { a: .1, verb: .6 }); tone(990, 440, 'sine', .7, .09, { verb: .8 }) },
    hurt() { noise(.16, 'bandpass', 420, 260, 1.3, .35); tone(210, 95, 'square', .14, .1) },
    death() { noise(.45, 'lowpass', 600, 120, .8, .35); tone(95, 38, 'sine', .45, .35) },
    flask() { noise(.18, 'bandpass', 700, 1800, 1.4, .08, { a: .02 }) },
    glass() { if (!ac) return; const t = now(); for (let i = 0; i < 5; i++) noise(.03, 'bandpass', 4500 + Math.random() * 3000, 4000, 4, .14, { t: t + i * .025 }); tone(2600, 2500, 'triangle', .4, .07, { verb: .5 }); noise(.6, 'lowpass', 900, 300, .7, .1, { t: t + .05 }) },
    // парирование: звонкий удар стали; блок — глуше; подъём меча — короткий шорох
    parry() { tone(2400, 1700, 'triangle', .32, .2); tone(3600, 2900, 'sine', .22, .09); noise(.07, 'highpass', 4200, 3000, .8, .26); tone(180, 90, 'sine', .14, .3) },
    block() { tone(900, 520, 'triangle', .16, .16); noise(.08, 'bandpass', 1500, 900, 1.2, .24); tone(120, 60, 'sine', .14, .28) },
    tell() { noise(.08, 'bandpass', 3200, 2400, 2.2, .07, { a: .005 }); tone(1300, 1500, 'sine', .07, .035) },
    guard() { noise(.09, 'bandpass', 2200, 1400, 1.4, .08, { a: .01 }) },
    // заряженный удар: нарастающий гул (держится, пока зажата кнопка), звон уровней, мощный рассекающий выпуск
    // заряд: держится хор (ля и ми), снизу гул; на уровнях вступают верхние голоса и звучит колокол; отпускание — удар меди с литаврой
    chargeOn() { if (!ac || S._ch) return; const t = now(); S._ch = { v: [voice(A * 4, { a: .45, vol: .032 }), voice(A * 6, { a: .6, vol: .024 })], sub: null };
      const o = ac.createOscillator(), e = ac.createGain(); o.type = 'sine'; o.frequency.value = A; e.gain.setValueAtTime(.0001, t); e.gain.exponentialRampToValueAtTime(.16, t + .8); o.connect(e).connect(sfxG); o.start(t); S._ch.sub = { o, e } },
    chargeOff() { if (!ac || !S._ch) return; const t = now(); S._ch.v.forEach(v => v.stop(.25, t)); const { o, e } = S._ch.sub; e.gain.cancelScheduledValues(t); e.gain.setTargetAtTime(.0001, t, .05); o.stop(t + .3); S._ch = null },
    chargeLvl(l) { if (!ac) return; if (S._ch) S._ch.v.push(voice(A * (l > 1 ? 12 : 8), { a: .25, vol: l > 1 ? .02 : .026, vowel: l > 1 ? [500, 1000] : [760, 1150] })); oBell(A * (l > 1 ? 16 : 12), .07, 2.2); timp(A * (l > 1 ? 1.5 : 1), .25 + .1 * l) },
    chargeRelease(l) { if (!ac) return; oBrass([A * 2, A * 3, A * 4, ...(l ? [A * 6] : []), ...(l > 1 ? [A * 8] : [])], .04 + .008 * l, .7 + .25 * l, { hall: .3 * l }); timp(A, .38 + .08 * l); tone(95, 38, 'sine', .8, .42);
      noise(.32, 'bandpass', 3200, 500, 1.4, .3, { a: .01 }); if (l > 1) crash(.16, 1.8); else if (l) oBell(A * 16, .05, 1.6) },
    // «Разлом» готов: колокол и короткий вдох хора
    ultReady() { if (!ac) return; const t = now(); oBell(A * 12, .08, 3); oBell(A * 16, .06, 3, { t: t + .14 }); const v = voice(A * 8, { a: .5, vol: .02, verb: .8 }); v.stop(1.2, t + .6) },
    // подъём: хор крещендо (ля минор), вступают верхние голоса, литавровое тремоло ускоряется, «обратная» тарелка — всё к удару
    ultRise() { if (!ac) return; const t = now(), T = 1.28; if (S.ultEnd) S.ultEnd(); musicG.gain.setTargetAtTime(.1, t, .2);
      const v = [[A * 4, .03, .9], [A * 4.76, .022, 1.0], [A * 6, .026, 1.0], [A * 2, .03, .7]].map(([f, vol, a]) => voice(f, { a, vol, verb: .6, hall: .4 }));
      [[A * 8, .018], [A * 9.52, .014], [A * 12, .012]].forEach(([f, vol]) => v.push(voice(f, { t: t + .55, a: .7, vol, vowel: [520, 1000], hall: .5 })));
      for (let tt = t + .25; tt < t + T - .02;) { const k = (tt - t) / T; timp(A, .05 + .22 * k * k, { t: tt }); tt += lp(.16, .045, k) }
      crash(.18, T, { t, rev: 1 }); tone(A * .5, A, 'sine', T, .2, { t, a: T * .9 });
      S.ultEnd = (at = now()) => { v.forEach(x => x.stop(2.4, at)); S.ultEnd = null } },
    // удар: литавры и бас, аккорд меди в ля мажоре, большая тарелка, колокол; хор переходит в мажор и долго гаснет в зале
    ultSlam() { if (!ac) return; const t = now(); if (S.ultEnd) S.ultEnd(t + .05);
      tone(80, 26, 'sine', 2.4, .62, { t }); timp(A, .5, { t, hall: .6 }); timp(A * .75, .38, { t: t + .02 }); noise(1.8, 'lowpass', 900, 60, .7, .36, { t });
      oBrass([A, A * 2, A * 3, A * 4, A * 5, A * 6, A * 8], .028, 2.6, { t, hall: .5 });
      crash(.24, 4, { t }); oBell(A * 2, .14, 5, { t, hall: 1 }); oBell(A * 3, .1, 4.5, { t: t + .03 });
      const v = [A * 4, A * 5, A * 6, A * 8, A * 10].map((f, i) => voice(f, { t: t + .04, a: .12, vol: .03 - i * .003, hall: .7, verb: .5 })); v.forEach(x => x.stop(3.4, t + .5));
      [A * 32, A * 48].forEach(f => tone(f, f, 'sine', 3.5, .03, { t: t + .1, a: .3, dest: hallIn }));
      musicG.gain.setTargetAtTime(.32, t + 2.4, 1.2) },
    dash() { noise(.25, 'bandpass', 1300, 380, 1.1, .2, { a: .02 }) },
    roar() { if (!ac) return; tone(68, 52, 'sawtooth', 1.6, .2, { a: .3 }); tone(71, 50, 'sawtooth', 1.6, .2, { a: .3, det: 20 }); noise(1.6, 'lowpass', 300, 1100, 2, .25, { a: .4 }); S.quake(.8) },
    gate() { tone(90, 66, 'sawtooth', .9, .06, { a: .1 }); noise(.9, 'lowpass', 220, 90, .7, .22) },
    whoosh() { noise(.35, 'bandpass', 300, 1500, 1, .14, { a: .08 }) },
    tick() { tone(1500, 1500, 'square', .03, .04) },
    // замах босса: низкий нарастающий гул — сигнал «сейчас ударит»
    windup(heavy = 1) { noise(.7, 'lowpass', 90, 420, 3, .16 * heavy, { a: .5 }); tone(55, 92, 'sawtooth', .75, .06 * heavy, { a: .5 }) },
    // топор палача: металлический свист и звон
    axe() { if (!ac) return; noise(.32, 'bandpass', 900, 3800, 2.5, .22, { a: .05 }); tone(1180, 1100, 'triangle', .5, .05, { t: now() + .05, verb: .4 }) },
    // конечность собирается обратно: камни тянутся друг к другу
    regrow() { if (!ac) return; const t = now(); for (let i = 0; i < 10; i++) noise(.05, 'bandpass', 600 + i * 220, 900 + i * 200, 3, .1, { t: t + i * .06 }); tone(60, 120, 'sine', .8, .3, { a: .3 }) },
    heroDeath() { noise(1.1, 'lowpass', 1400, 200, .7, .3, { a: .02, verb: .8 }); tone(330, 110, 'triangle', 1.2, .14, { verb: 1 }); tone(165, 55, 'sine', 1.3, .3) },
    seal() { if (!ac) return; const t = now();[220, 277, 330].forEach((f, i) => tone(f, f, 'sine', 1.4, .1, { t: t + i * .12, a: .1, verb: 1 })) },
  };
  // ---------- музыка ----------
  const BPM = 84, E8 = 60 / BPM / 2; let nextT = 0, stepI = 0, timer = null;
  const mf = n => 440 * Math.pow(2, (n - 69) / 12);
  // аккорды (MIDI): Am, F, Dm, E
  const CH = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]], ROOT = [45, 41, 38, 40];
  function startMusic() {
    // бурдон: две расстроенные пилы через фильтр с медленной модуляцией
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; f.Q.value = 3; const dg = g(musicG, .0001);
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .07; lg.gain.value = 120; lfo.connect(lg).connect(f.frequency); lfo.start();
    [55, 55.4, 82.4].forEach((fq, i) => { const o = ac.createOscillator(); o.type = i == 2 ? 'triangle' : 'sawtooth'; o.frequency.value = fq; o.connect(f); o.start() });
    f.connect(dg); drone = dg; drone.gain.setTargetAtTime(.11, now(), 2);
    nextT = now() + .1; timer = setInterval(sched, 25);
  }
  function pad(notes, t, dur, vol, type = 'triangle') { for (const n of notes) { tone(mf(n), mf(n), type, dur, vol, { t, a: .8, dest: musicG, verb: .9 }); tone(mf(n), mf(n), 'sine', dur, vol * .7, { t, a: 1, dest: musicG, det: 7 }) } }
  function bell(n, t, vol) { tone(mf(n), mf(n), 'sine', 1.4, vol, { t, dest: musicG, verb: 1 }); tone(mf(n) * 2.01, mf(n) * 2.01, 'sine', .5, vol * .3, { t, dest: musicG, verb: .6 }) }
  function drum(t, f0, vol, len = .35) { tone(f0, f0 * .38, 'sine', len, vol, { t, dest: musicG }); noise(.07, 'lowpass', 900, 200, .6, vol * .35, { t, dest: musicG }) }
  function brass(n, t, dur, vol) { if (!ac) return; const o = ac.createOscillator(), o2 = ac.createOscillator(), fl = ac.createBiquadFilter(), e = ac.createGain(); o.type = o2.type = 'sawtooth'; o.frequency.value = mf(n); o2.frequency.value = mf(n) * 1.004; fl.type = 'lowpass'; fl.frequency.setValueAtTime(200, t); fl.frequency.linearRampToValueAtTime(900, t + .15); fl.frequency.exponentialRampToValueAtTime(250, t + dur); env(e, t, .06, vol, dur); o.connect(fl); o2.connect(fl); fl.connect(e).connect(musicG); e.connect(g(verbIn, .4)); o.start(t); o2.start(t); o.stop(t + dur + .1); o2.stop(t + dur + .1) }
  function sched() {
    if (!ac) return; while (nextT < now() + .2) { play(stepI, nextT); nextT += E8; stepI++ }
  }
  function play(i, t) {
    const bar = Math.floor(i / 8) % 4, s = i % 8, ch = CH[bar];
    if (mode === 'silent') return;
    if (s === 0) pad(ch.map(n => n - 12), t, E8 * 8.5, mode === 'soul' ? .05 : .035, mode === 'soul' ? 'sine' : 'triangle');
    if (mode === 'title') { if (s === 0 || (s === 5 && Math.random() < .5)) bell(ch[(Math.random() * 3) | 0] + 12, t, .05); return }
    if (mode === 'soul') { if (s % 3 === 0 && Math.random() < .7) bell(ch[(s / 3) % 3 | 0] + 24, t, .045); if (s === 4) tone(mf(ROOT[bar] + 24), mf(ROOT[bar] + 24), 'sine', 1.6, .03, { t, a: .5, dest: musicG, verb: 1, det: -8 }); return }
    if (mode === 'victory') { if (s % 2 === 0) bell([57, 61, 64, 69][(s / 2) | 0] + 12, t, .06); return }
    if (mode === 'defeat') { if (s === 0) bell(ch[0], t, .05); return }
    // бой: арпеджио + барабаны; у босса — плотнее и с медью
    const boss = mode === 'boss';
    if (Math.random() < (boss ? .55 : .7)) { const n = ch[[0, 1, 2, 1, 0, 2, 1, 2][s]] + 12; tone(mf(n), mf(n), 'triangle', .28, .04, { t, dest: musicG, verb: .4 }) }
    if (s === 0 || s === 4) drum(t, boss ? 70 : 85, boss ? .42 : .3);
    if (s === 6 || (s === 7 && Math.random() < .5)) drum(t, 130, boss ? .2 : .12, .2);
    if (boss) { if (s === 2 || s === 3) drum(t, 105, .16, .18); if (s === 0) brass(ROOT[bar] + 12, t, E8 * 3, .07); if (s === 4 && bar === 3) brass(ROOT[bar] + 19, t, E8 * 2, .06) }
    tone(mf(ROOT[bar]), mf(ROOT[bar]), 'sine', E8 * .9, boss ? .1 : .07, { t, dest: musicG });
  }
  function setMode(m) { mode = m; if (drone && ac) drone.gain.setTargetAtTime(m === 'soul' ? .05 : m === 'boss' ? .14 : .1, now(), 1) }
  function toggleMute() { muted = !muted; if (master) master.gain.setTargetAtTime(muted ? 0 : vol, now(), .05); return muted }
  function setVol(v) { vol = cl(v, 0, 1); if (master && !muted) master.gain.setTargetAtTime(vol, now(), .05); return vol }
  return { init, setMode, toggleMute, setVol, get vol() { return vol }, get muted() { return muted }, get mode() { return mode }, ...S };
})();
