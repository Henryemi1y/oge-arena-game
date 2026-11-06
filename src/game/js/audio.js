// audio.js — звук без файлов: синтез WebAudio. Музыка — генеративный цикл в ля миноре (режимы: титул, волна, босс, душа),
// эффекты — шаги, взмахи, попадания, камень, тряска, осколки, ответы, душа.
const Snd = (() => {
  let ac = null, master, musicG, sfxG, verbIn, noiseBuf, muted = false, mode = 'title', drone = null, vol = .85;
  const g = (dest, v) => { const n = ac.createGain(); n.gain.value = v; n.connect(dest); return n };
  function impulse(sec, decay) { const r = ac.sampleRate, n = r * sec, b = ac.createBuffer(2, n, r); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay) } return b }
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return; ac = new C();
    master = g(ac.destination, muted ? 0 : vol);
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(master);
    musicG = g(comp, .32); sfxG = g(comp, .9);
    const cv = ac.createConvolver(); cv.buffer = impulse(2.8, 2.4); verbIn = g(cv, 1); cv.connect(g(comp, .32));
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
