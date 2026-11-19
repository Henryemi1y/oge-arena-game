// audio.js — звук без файлов: синтез WebAudio. Музыка — генеративный цикл в ля миноре (режимы: титул, волна, босс, душа),
// эффекты — шаги, взмахи, попадания, камень, тряска, осколки, ответы, душа.
const Snd = (() => {
  let ac = null, master, musicG, sfxG, verbIn, hallIn, hallOut, noiseBuf, muted = false, mode = 'title', drone = null, vol = .85;
  const g = (dest, v) => { const n = ac.createGain(); n.gain.value = v; n.connect(dest); return n };
  function impulse(sec, decay) { const r = ac.sampleRate, n = r * sec, b = ac.createBuffer(2, n, r); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay) } return b }
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return; ac = new C();
    // лимитер на самом выходе: в бою удар ульты совпадает с попаданиями и смертями — без него звук перегружался
    const lim = ac.createDynamicsCompressor(); lim.threshold.value = -4; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = .001; lim.release.value = .09; lim.connect(ac.destination);
    master = g(lim, muted ? 0 : vol);
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(master);
    musicG = g(comp, .32); sfxG = g(comp, .9);
    const cv = ac.createConvolver(); cv.buffer = impulse(2.8, 2.4); verbIn = g(cv, 1); const cvl = ac.createBiquadFilter(); cvl.type = 'lowpass'; cvl.frequency.value = 6000; cv.connect(cvl); cvl.connect(g(comp, .32));
    const hv = ac.createConvolver(); hv.buffer = impulse(5, 2.6); hallIn = g(hv, 1); hallOut = null; const hvl = ac.createBiquadFilter(); hvl.type = 'lowpass'; hvl.frequency.value = 2600; hvl.Q.value = .5; const hvh = ac.createBiquadFilter(); hvh.type = 'highpass'; hvh.frequency.value = 90; hv.connect(hvl); hvl.connect(hvh); hallOut = g(comp, .5); hvh.connect(hallOut);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    startMusic();
  }
  const now = () => ac.currentTime;
  function env(node, t, a, peak, dec, sus = 0.0001) { const p = node.gain; p.cancelScheduledValues(t); p.setValueAtTime(.0001, t); p.exponentialRampToValueAtTime(Math.max(peak, .0002), t + a); p.exponentialRampToValueAtTime(Math.max(sus, .0001), t + a + dec) }
  function tone(f0, f1, type, dur, vol, opt = {}) {
    if (!ac) return; const { t = now(), a = .005, dest = sfxG, verb = 0, det = 0, pan = 0 } = opt, o = ac.createOscillator(), e = ac.createGain(); o.type = type; o.detune.value = det; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    env(e, t, a, vol, dur); o.connect(e); if (pan) { const pn = ac.createStereoPanner(); pn.pan.value = pan; e.connect(pn).connect(dest) } else e.connect(dest); if (verb) { const s = g(verbIn, verb); e.connect(s) } o.start(t); o.stop(t + a + dur + .05)
  }
  function noise(dur, ftype, f0, f1, q, vol, opt = {}) {
    if (!ac) return; const { t = now(), a = .004, dest = sfxG, verb = 0 } = opt, s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ac.createBiquadFilter(); f.type = ftype; f.Q.value = q; f.frequency.setValueAtTime(f0, t); if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
    const e = ac.createGain(); env(e, t, a, vol, dur); s.connect(f).connect(e).connect(dest); if (verb) e.connect(g(verbIn, verb)); s.start(t, Math.random()); s.stop(t + a + dur + .05)
  }
  // ---------- «оркестр» для заряда и ульты ----------
  // голос хора: четыре пилы со своим вибрато и разной расстройкой слева и справа, дыхание (шум) и три форманты гласной «а»;
  // держится, пока не отпустят
  function voice(f, opt = {}) {
    const { t = now(), a = .3, vol = .05, verb = .5, hall = 0, vowel = [730, 1090, 2440], f2 = .6, pan = 0 } = opt, e = ac.createGain(), sum = ac.createGain(), pn = ac.createStereoPanner(); pn.pan.value = pan;
    const fl = vowel.map((fq, i) => { const b = ac.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = fq; b.Q.value = [5, 6, 8][i]; b.connect(g(sum, [1, f2, .22][i])); return b });
    const lpf = ac.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 3600; fl.forEach(b => lpf.connect(b));
    const os = [], lfos = [];
    [-19, -7, 6, 18].forEach((d, i) => { const o = ac.createOscillator(), lf = ac.createOscillator(), ld = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; lf.frequency.value = 4.6 + i * .37 + Math.random() * .3; ld.gain.value = 6 + i; lf.connect(ld).connect(o.detune);
      const op = ac.createStereoPanner(); op.pan.value = (i % 2 ? .35 : -.35); o.connect(op).connect(lpf); o.start(t); lf.start(t); os.push(o); lfos.push(lf) });
    const br = ac.createBufferSource(); br.buffer = noiseBuf; br.loop = true; br.connect(g(lpf, .05)); br.start(t, Math.random()); os.push(br);
    sum.gain.value = 2.4; sum.connect(e); e.connect(pn); pn.connect(sfxG); e.gain.setValueAtTime(0, t); e.gain.setTargetAtTime(vol, t, a / 3);
    if (verb) pn.connect(g(verbIn, verb)); if (hall) pn.connect(g(hallIn, hall));
    // затухание от того уровня, который будет в момент at: так его можно назначить заранее
    return { e, stop(r = .3, at = now()) { e.gain.cancelScheduledValues(at); e.gain.setTargetAtTime(.0001, at, r / 5); os.forEach(o => o.stop(at + r + .05)); lfos.forEach(o => o.stop(at + r + .05)) } };
  }
  // колокол: только согласные обертоны (октавы, квинта) — без «чужих» нот в аккорде
  function oBell(f, vol, dur = 3, opt = {}) { const { t = now(), verb = .7, hall = 0, pan = 0 } = opt;[[.5, .3], [1, 1], [1.5, .22], [2, .5], [3, .18], [4.01, .12]].forEach(([r, a], i) => tone(f * r, f * r, 'sine', dur * (1 - i * .1), vol * a, { t, a: .003, verb, pan })); if (hall) tone(f, f, 'sine', dur, vol * .5, { t, dest: hallIn }) }
  // медь: аккорд пил, фильтр раскрывается сразу (удар в первые 10 мс) и медленно закрывается
  function oBrass(fs, vol, dur, opt = {}) {
    const { t = now(), verb = .5, hall = 0 } = opt, f = ac.createBiquadFilter(), e = ac.createGain(); f.type = 'lowpass'; f.Q.value = 1.5; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(1500, t + .25); f.frequency.exponentialRampToValueAtTime(420, t + dur);
    env(e, t, .006, vol, dur); f.connect(e).connect(sfxG); if (verb) e.connect(g(verbIn, verb)); if (hall) e.connect(g(hallIn, hall));
    fs.forEach((x, k) => [-7, 7].forEach((d, j) => { const o = ac.createOscillator(), op = ac.createStereoPanner(); op.pan.value = (j ? 1 : -1) * (.2 + .1 * (k % 3)); o.type = 'sawtooth'; o.frequency.value = x; o.detune.value = d; o.connect(op).connect(f); o.start(t); o.stop(t + dur + .1) }));
  }
  // литавра: высота почти не съезжает (как у настоящей), удар коротким шумом
  function timp(f, vol, opt = {}) { const { t = now(), verb = .4, hall = 0, dur = 1.1 } = opt; tone(f * 1.015, f, 'sine', dur, vol, { t, a: .002, verb }); tone(f * 1.5, f * 1.49, 'sine', .45, vol * .28, { t, a: .002 }); tone(f * 2, f * 1.99, 'sine', .3, vol * .18, { t, a: .002 }); noise(.07, 'bandpass', 900, 300, 1, vol * .55, { t, a: .001 }); if (hall) tone(f, f, 'sine', 1, vol * .4, { t, dest: hallIn }) }
  // тарелка
  function crash(vol, dur, opt = {}) { const { t = now(), hall = .25 } = opt; noise(dur, 'highpass', 4800, 3200, .6, vol, { t, a: .002, verb: .4 }); noise(dur * .5, 'bandpass', 8000, 6500, 1.5, vol * .45, { t }); if (hall) noise(dur * .8, 'bandpass', 3000, 2000, .7, vol * hall, { t, dest: hallIn }) }
  // «обратная» тарелка: нарастает и обрывается ровно в момент end
  function swell(t0, end, vol) { const s_ = ac.createBufferSource(), f = ac.createBiquadFilter(), e = ac.createGain(); s_.buffer = noiseBuf; s_.loop = true; f.type = 'highpass'; f.frequency.setValueAtTime(1800, t0); f.frequency.exponentialRampToValueAtTime(5200, end); e.gain.setValueAtTime(.0001, t0); e.gain.exponentialRampToValueAtTime(vol, end); s_.connect(f).connect(e).connect(sfxG); e.connect(g(verbIn, .3)); s_.start(t0, Math.random());
    return { stop(at = now()) { e.gain.cancelScheduledValues(at); e.gain.setTargetAtTime(.0001, at, .008); s_.stop(at + .1) } } }
  const A = 55, et = n => A * Math.pow(2, n / 12); // ля: всё в ля, как и музыка; et(n) — n полутонов от ля контроктавы
  // ---------- эффекты ----------
  const S = {
    step(p = .3, heavy = 0) { if (!ac) return; if (heavy) { tone(72, 30, 'sine', .55, .25 + .55 * p); noise(.45, 'lowpass', 260, 90, .7, .28 * p) } else { noise(.05, 'bandpass', 900, 600, 1.2, .045 + .05 * p); tone(130, 70, 'sine', .07, .05 + .05 * p) } },
    swing(k = 0) { noise(.2 + .03 * k, 'bandpass', 500 + 120 * k, 2600, 1.6, .22, { a: .03 }) },
    // во время удара ульты попадания и смерти приглушены — их перекрывает сам удар
    hit() { const k = now() < (S._duck || 0) ? .2 : 1; tone(150, 50, 'sine', .16, .45 * k); noise(.09, 'lowpass', 1600, 400, .8, .32 * k) },
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
    death() { const k = now() < (S._duck || 0) ? .2 : 1; noise(.45, 'lowpass', 600, 120, .8, .35 * k); tone(95, 38, 'sine', .45, .35 * k) },
    flask() { noise(.18, 'bandpass', 700, 1800, 1.4, .08, { a: .02 }) },
    glass() { if (!ac) return; const t = now(); for (let i = 0; i < 5; i++) noise(.03, 'bandpass', 4500 + Math.random() * 3000, 4000, 4, .14, { t: t + i * .025 }); tone(2600, 2500, 'triangle', .4, .07, { verb: .5 }); noise(.6, 'lowpass', 900, 300, .7, .1, { t: t + .05 }) },
    // парирование: звонкий удар стали; блок — глуше; подъём меча — короткий шорох
    parry() { tone(2400, 1700, 'triangle', .32, .2); tone(3600, 2900, 'sine', .22, .09); noise(.07, 'highpass', 4200, 3000, .8, .26); tone(180, 90, 'sine', .14, .3) },
    block() { tone(900, 520, 'triangle', .16, .16); noise(.08, 'bandpass', 1500, 900, 1.2, .24); tone(120, 60, 'sine', .14, .28) },
    tell() { noise(.08, 'bandpass', 3200, 2400, 2.2, .07, { a: .005 }); tone(1300, 1500, 'sine', .07, .035) },
    guard() { noise(.09, 'bandpass', 2200, 1400, 1.4, .08, { a: .01 }) },
    // заряженный удар: нарастающий гул (держится, пока зажата кнопка), звон уровней, мощный рассекающий выпуск
    // заряд: короткий вдох (шорох) и сразу хор на ля и ми, разведённый по сторонам; на уровнях вступают верхние голоса,
    // колокол и литавра (ля, потом ми); отпускание — удар меди в первые 10 мс и литавра
    chargeOn() { if (!ac || S._ch) return; const t = now(); noise(.3, 'bandpass', 700, 1600, 1.2, .12, { a: .08, verb: .3 });
      S._ch = { v: [voice(A * 4, { a: .12, vol: .075, pan: -.3 }), voice(A * 6, { a: .2, vol: .06, pan: .3 }), voice(A * 2, { a: .25, vol: .05, vowel: [600, 1000, 2400] })], sub: null };
      const o = ac.createOscillator(), e = ac.createGain(); o.type = 'sine'; o.frequency.value = A; e.gain.setValueAtTime(.0001, t); e.gain.exponentialRampToValueAtTime(.04, t + .5); o.connect(e).connect(sfxG); o.start(t); S._ch.sub = { o, e } },
    // отпускание или отмена: хор глохнет за 30–40 мс, чтобы удар выпуска звучал на чистом месте
    chargeOff() { if (!ac || !S._ch) return; const t = now(); S._ch.v.forEach(v => v.stop(.04, t)); const { o, e } = S._ch.sub; e.gain.cancelScheduledValues(t); e.gain.setTargetAtTime(.0001, t, .01); o.stop(t + .1); S._ch = null },
    chargeLvl(l) { if (!ac) return; if (S._ch) S._ch.v.push(voice(A * (l > 1 ? 12 : 8), { a: .15, vol: l > 1 ? .055 : .065, vowel: l > 1 ? [520, 1000, 2600] : [730, 1090, 2440], pan: l > 1 ? .45 : -.45 })); oBell(A * (l > 1 ? 24 : 16), .06, 2, { pan: l > 1 ? .3 : -.3 }); timp(A * (l > 1 ? 1.5 : 1), .16) },
    // выпуск: щелчок и литавра в первые миллисекунды, медь (ля мажор, темперированный), шорох рассечения
    chargeRelease(l) { if (!ac) return; noise(.015, 'lowpass', 5000, 3000, .7, .55, { a: .001 }); timp(A, .2 + .03 * l); timp(A * 1.5, .13, { t: now() + .01 });
      noise(.16, 'bandpass', 3400, 2200, 2.2, .32 + .06 * l, { a: .002 }); [2637, 3520].forEach((f, i) => tone(f, f * .99, 'sine', .5 + .2 * l, .035, { a: .002, verb: .5, pan: i ? .3 : -.3 }));
      oBrass([A * 2, A * 3, et(28), A * 4, ...(l ? [A * 6] : []), ...(l > 1 ? [A * 8] : [])], .24 + .025 * l, .7 + .25 * l, { hall: .25 * l }); tone(80, 55, 'sine', .3, .1, { a: .002 });
      noise(.24, 'bandpass', 3000, 700, 1.4, .26, { a: .002 }); if (l > 1) crash(.12, 1.4); else if (l) oBell(A * 16, .05, 1.4) },
    // «Разлом» готов: колокол и короткий вдох хора
    ultReady() { if (!ac) return; const t = now(); oBell(A * 12, .08, 2.6, { pan: -.25 }); oBell(A * 16, .06, 2.6, { t: t + .14, pan: .25 }); const v = voice(A * 8, { a: .3, vol: .045, verb: .8 }); v.stop(1, t + .5) },
    // подъём: хор крещендо в ля миноре, вступают верхние голоса, литавровое тремоло на ля ускоряется, «обратная» тарелка.
    // Обрыв («вдох» перед ударом) делает сама игра — ultCut() в момент, когда герой начинает падать
    ultRise() { if (!ac) return; const t = now(), T = 1.12; if (S.ultEnd) S.ultEnd(); musicG.gain.setTargetAtTime(.08, t, .2);
      const v = [[A * 2, .026, .4, 0], [A * 4, .034, .45, -.4], [et(27), .026, .5, .4], [A * 6, .028, .5, -.15]].map(([f, vol, a, pan]) => { const x = voice(f, { a, vol, verb: .5, hall: .35, pan }); x.e.gain.setTargetAtTime(vol * 2, t + a * 1.5, .3); return x });
      [[A * 8, .03, -.5], [et(39), .025, .5], [A * 12, .022, 0]].forEach(([f, vol, pan]) => v.push(voice(f, { t: t + .5, a: .5, vol, vowel: [520, 1000, 2600], hall: .45, pan })));
      const roll = []; for (let tt = t + .2; tt < t + T - .05;) { const k = (tt - t) / T; roll.push(tt); tt += lp(.15, .05, k) }
      const tm = roll.map((tt, i) => (timp(A, .02 + .07 * ((tt - t) / T) ** 2, { t: tt, dur: .32 }), tt)), sw = swell(t + .1, t + T, .1);
      S.ultEnd = (at = now()) => { v.forEach(x => x.stop(.03, at)); sw.stop(at); hallOut.gain.setTargetAtTime(.04, at, .015); S.ultEnd = null } },
    ultCut() { if (!ac) return; if (S.ultEnd) S.ultEnd(); noise(.17, 'bandpass', 2200, 450, 1.6, .09, { a: .05 }) },
    // удар: первые 10–30 мс — щелчок, две литавры и медь; хор вступает позже и тише, внизу держится медь (ля мажор)
    ultSlam() { if (!ac) return; const t = now(); S._duck = t + .35; if (S.ultEnd) S.ultEnd(t); hallOut.gain.cancelScheduledValues(t); hallOut.gain.setValueAtTime(.5, t);
      noise(.025, 'lowpass', 6000, 2500, .7, .6, { a: .001 }); timp(A, .42, { t, hall: .4 }); timp(A * 1.5, .3, { t: t + .012 }); tone(70, 40, 'sine', 1.2, .26, { t, a: .002 }); noise(1, 'lowpass', 700, 80, .7, .14, { t, a: .002 });
      oBrass([A * 2, A * 3, et(28), A * 4, et(40), A * 6, A * 8], .1, 2.6, { t, hall: .45 });
      noise(.14, 'bandpass', 1900, 1100, .9, .34, { t, a: .001 }); [.03, .07, .12].forEach((d, i) => noise(.05, 'bandpass', 2600 - i * 500, 1400, 1.5, .16, { t: t + d, a: .001 })); // хруст камня
      oBrass([A * 2, A * 3, et(28)], .07, 2.4, { t: t + .25, hall: .3, verb: .3 }); // низкая медь держит хвост
      crash(.2, 1.8, { t }); oBell(A * 4, .1, 4.5, { t, hall: .6 });
      const v = [[A * 4, -.4], [et(28), .4], [A * 6, -.15], [A * 8, .3], [et(40), -.3]].map(([f, pan], i) => voice(f, { t: t + .16, a: .3, vol: .065 - i * .007, hall: .6, verb: .4, pan, f2: .38, vowel: [660, 1090, 2440] })); v.forEach(x => x.stop(2.6, t + .9));
      musicG.gain.setTargetAtTime(.32, t + 2.6, 1.2) },
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
