// main.js — сцены (титул → волны → босс → душа/монолит → победа/поражение), фиксированный шаг 1/60, отрисовка по глубине.
const cvs = document.getElementById('game'); let ctx = cvs.getContext('2d');
const PHASES = [
  { type: 'wave', name: 'Волна 1', spawn: { ghoul: 4 } },
  { type: 'wave', name: 'Волна 2', spawn: { ghoul: 4, knight: 1, doctor: 1 } },
  { type: 'boss', id: 'guardian', level: 0 },
  { type: 'wave', name: 'Волна 3', spawn: { goatman: 1, knight: 2, doctor: 1, ghoul: 2 } },
  { type: 'wave', name: 'Волна 4', spawn: { goatman: 2, doctor: 2, ghoul: 3, knight: 2 } },
  { type: 'boss', id: 'executioner', level: 1 },
];
const Game = {
  scene: 'load', t: 0, time: 0, score: 0, level: 0, stats: { solved: 0, tasks: 0, broken: 0, hits: 0, topics: {} }, pi: -1, phase: null, queue: [], spawnT: 0, hs: 0, nextT: 0, loadK: 0, deadT: 0, test: false, side: 1,
  diff: 0, dmgK: 1, healFx: 0, healAmt: 0, check: null, sealing: false,
  hitStop(d) { this.hs = Math.max(this.hs, d) },
  heal(n) { const H = Hero.H, h0 = H.hp; H.hp = Math.min(H.maxhp, H.hp + n); this.healAmt = Math.round(H.hp - h0); if (this.healAmt > 0) this.healFx = 1.6 },
  setDiff(d) { this.diff = d; this.dmgK = d ? .5 : 1; Soul.TMAX = d ? 130 : 95 },
  reset0() { Snd.init(); FX.reset(); Enemies.reset(); Boss.reset(); Soul.reset(); this.setDiff(this.diff) },
  start() {
    this.reset0(); Problems.reset();
    Object.assign(this, { scene: 'play', time: 0, score: 0, level: 0, stats: { solved: 0, tasks: 0, broken: 0, hits: 0, topics: {} }, pi: -1, phase: null, queue: [], spawnT: 1.5, hs: 0, nextT: 0, deadT: 0, sealing: false, sealBroken: false });
    Hero.reset(W.ARENA / 2 - 260, .62); Eye.reset(Hero.H.x - 60, .62); Cam.snap(Hero.H.x); UI.helpT = 0; this.next();
  },
  // после поражения — заново с начала этапа: счёт и статистика — как были на входе в этап
  retry() {
    const c = this.check; if (!c) return this.start();
    this.reset0(); Object.assign(this, { scene: 'play', time: c.time, score: c.score, level: c.level, stats: JSON.parse(JSON.stringify(c.stats)), pi: c.pi - 1, phase: null, queue: [], spawnT: 1.5, hs: 0, nextT: 0, deadT: 0, sealing: false, sealBroken: false });
    Hero.reset(W.ARENA / 2 - 260, .62); Eye.reset(Hero.H.x - 60, .62); Cam.snap(Hero.H.x); this.next(true);
  },
  next(retry) {
    this.pi++; if (this.pi >= PHASES.length) { this.scene = 'win'; Snd.setMode('victory'); Snd.correct(); return }
    const P = this.phase = PHASES[this.pi]; if (!retry && this.pi) this.heal(40);
    this.check = { pi: this.pi, score: this.score, level: P.level ?? this.level, stats: JSON.parse(JSON.stringify(this.stats)), time: this.time };
    if (P.type === 'wave') { this.queue = shuffle(Object.entries(P.spawn).flatMap(([k, n]) => Array(n).fill(k))); this.spawnT = 1.6; UI.banner(P.name, this.pi < 2 ? 'F или ПКМ чуть раньше удара — отбить и оглушить врага' : 'Враги выходят из ворот', undefined, this.pi < 2 ? 3.2 : undefined); Snd.setMode('wave') }
    else { this.level = P.level; this.queue = []; this.bossT = 1.2; UI.banner(DRESS[P.id].name, this.level ? 'Отбитый удар раскалывает руку босса · волну по земле не отбить' : 'Разбей конечности — собери ответ из осколков', '#f0e2c0', 3.2); Snd.setMode('boss') }
  },
  bossDown(id) { this.score += 500; UI.banner(DRESS[id].name + ' повержен', '', '#bfefff', 2.6); this.nextT = 3 },
  // волна отбита: печать монолита — задача без боя, верный ответ возвращает силы
  waveDone() { if (this.sealBroken) { this.sealBroken = false; this.nextT = 1.2; return } this.sealing = true; Snd.seal(); Soul.seal(); if (!this.soulSeen) { this.soulSeen = 1; UI.banner('Печать монолита', 'Душа выходит из тела: собери цифры ответа (E) и сложи их на монолите', '#bfefff', 4.6) } },
  // неверный ответ на печати: печать трескается, из ворот выходят ещё два врага
  sealDone(ok) { this.sealing = false; if (ok) { this.nextT = 1.2; return } this.sealBroken = true; this.queue.push('ghoul', pick(['knight', 'doctor'])); this.spawnT = 1.4; UI.banner('Печать треснула', 'Из ворот выходят ещё враги', '#ffb59a', 2.6) },
  // тело героя, пока душа вне тела: подходит к боссу и рубит (для вида — урона нет); без босса — стоит в стойке
  bodyAI() {
    const B = Boss.b, H = Hero.H; if (!B) return { x: 0, z: 0, atk: -1 };
    const side = Math.sign(H.x - B.x) || 1, tx = B.x + side * 170, dx = tx - H.x, fb = -side;
    let x = Math.abs(dx) > 30 ? Math.sign(dx) : 0, z = Math.abs(B.z - H.z) > .05 ? Math.sign(B.z - H.z) * .7 : 0;
    if (!x && Hero.FACE !== fb && Hero.st.atk < 0) x = fb;
    const combo = !x && Hero.st.atk < 0 && Math.random() < .04;
    return { x, z, run: Math.abs(dx) > 260, dash: false, combo, atk: -1 };
  },
  step(dt) {
    if (this.scene === 'load') return;
    this.t += dt; if (this.scene !== 'pause') { UI.step(dt); this.healFx = Math.max(0, this.healFx - dt) } // в паузе надписи не убегают
    if (Input.hit('Minus') || Input.hit('NumpadSubtract')) Snd.setVol(Snd.vol - .1); if (Input.hit('Equal') || Input.hit('NumpadAdd')) Snd.setVol(Snd.vol + .1);
    if (this.scene === 'title') {
      if (Input.hit('ArrowLeft') || Input.hit('KeyA')) this.setDiff(0); if (Input.hit('ArrowRight') || Input.hit('KeyD')) this.setDiff(1);
      if (Input.hit('Enter') || Input.hit('Mouse0')) { if (this.loadK >= 1) this.start() } Hero.update(dt, { x: 0, z: 0, atk: -1 }); Eye.update(dt); World.update(dt); FX.step(dt); Cam.x = (Math.sin(this.t * .05) * .5 + .5) * (W.ARENA - VW); return }
    if (this.scene === 'win' || this.scene === 'lose') { FX.step(dt); if (this.scene === 'lose' && Input.hit('KeyN')) this.start(); else if (Input.hit('Enter')) this.scene === 'lose' ? this.retry() : this.start(); return }
    if (this.scene === 'pause') { if (Input.hit('Enter') || Input.hit('Escape')) { this.scene = 'play'; Input.clearPresses() } if (Input.hit('KeyM')) Snd.toggleMute(); return }
    if (Input.hit('Enter') || Input.hit('Escape')) { this.scene = 'pause'; return }
    if (Input.hit('KeyM')) Snd.toggleMute();
    let wdt = dt; if (this.hs > 0) { this.hs -= dt; wdt = dt * .12 }
    this.time += dt;
    // герой: игрок или (в форме души) автопилот тела
    const H = Hero.H; let inp;
    if (H.soul) inp = this.bodyAI();
    else { const a = Input.axis(); inp = { x: a.x, z: a.z, run: a.run, dash: Input.hit('Space'), parry: Input.hit('KeyF') || Input.hit('Mouse2'), combo: Input.hit('Mouse0'), atk: Input.hit('KeyJ') ? 0 : Input.hit('KeyK') ? 1 : Input.hit('KeyL') ? 2 : -1 } }
    if (H.dead) inp = { x: 0, z: 0, atk: -1 };
    if (!this.deadT) Hero.update(wdt, inp);
    const b = H.blade; if (b && !H.dead) { Enemies.bladeHits(b); const r = Boss.bladeHits(b); if (r && r.part) Boss.hitLimb(r.part, b, r.p, !H.soul) }
    // душа живёт в реальном времени: стоп-кадры ударов тела её не тормозят
    Enemies.update(wdt); Boss.update(wdt); Soul.update(dt); Eye.update(wdt); World.update(wdt); FX.step(wdt);
    // фазы
    const P = this.phase;
    if (P && P.type === 'wave') {
      this.spawnT -= dt; if (this.queue.length && Enemies.alive() < 4 && this.spawnT <= 0) { this.side = -this.side; Enemies.spawn(this.queue.shift(), Math.abs(H.x - W.GL) > 700 && Math.abs(H.x - W.GR) > 700 ? this.side : (H.x < W.ARENA / 2 ? 1 : -1)); this.spawnT = 1.5 }
      if (!this.queue.length && !Enemies.list.length && !this.nextT && !this.sealing && !Soul.on) { this.sealT = (this.sealT || 0) + dt; if (this.sealT > 1.2) { this.sealT = 0; this.waveDone() } }
    }
    if (P && P.type === 'boss' && this.bossT > 0) { this.bossT -= dt; if (this.bossT <= 0) Boss.spawn(P.id) }
    if (this.nextT > 0) { this.nextT -= dt; if (this.nextT <= 0) { this.nextT = 0; this.next() } }
    // камера
    if (Soul.on && Soul.ph !== 'off') Cam.update(dt, Soul.x, Soul.face * .4); else Cam.update(dt, H.x, Hero.FACE);
    // смерть героя: тело рассыпается пеплом
    if (H.dead && !this.deadT) { this.deadT = 2.4; const hh = Hero.height() * 1.15, w = hh * 1.3, x0 = sx(H.x) - w / 2, y0 = zy(H.z) - hh; const cv = renderToCanvas(() => Hero.draw(), x0, y0, w, hh * 1.05); FX.shatter(cv, x0, y0, { grid: [6, 10], speed: 80, up: .5, life: 1.6, ash: 1 }); H.hidden = true; Snd.heroDeath(); Snd.setMode('defeat') }
    if (this.deadT > 0) { this.deadT -= dt; if (this.deadT <= 0) this.scene = 'lose' }
  },
  render() {
    const t = this.t;
    ctx.save(); ctx.translate(Cam.ox, Cam.oy);
    World.drawBack(t); Soul.drawFloorDim(); FX.drawGround(); World.drawLights(t);
    const list = []; World.propDrawables(list); Enemies.drawables(list); Boss.drawables(list); Soul.drawables(list);
    if (this.scene !== 'load') { list.push({ z: Hero.H.z, draw: () => Hero.draw(), shadow: () => Hero.shadow() }); Eye.drawables(list) }
    for (const d of list) if (d.shadow) d.shadow();
    list.sort((a, b) => a.z - b.z); for (const d of list) d.draw();
    FX.drawAir(); Soul.drawTop(); World.drawFront();
    ctx.restore();
    // форма души: мир синеет и темнеет по краям
    if (Soul.on) { const a = Soul.ph === 'out' ? sm(Soul.t / .8) : Soul.ph === 'return' ? 1 - sm(Soul.t / .9) : 1; ctx.fillStyle = `rgba(20,60,110,${.16 * a})`; ctx.fillRect(0, 0, VW, VH) }
    if (!this.vig) { this.vig = mkCanvas(VW / 2, VH / 2); const x = this.vig.getContext('2d'), vg = x.createRadialGradient(VW / 4, VH / 4, VH * .225, VW / 4, VH / 4, VH * .475); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,8,.55)'); x.fillStyle = vg; x.fillRect(0, 0, VW / 2, VH / 2) }
    ctx.drawImage(this.vig, 0, 0, VW, VH);
    if (this.scene === 'title' || this.scene === 'load') UI.title(t, this.loadK);
    else { UI.hud(); if (this.scene === 'pause') UI.pause(); if (this.scene === 'win' || this.scene === 'lose') UI.end(this.scene === 'win', t) }
  },
};
// ---------- холст: 16:9, чёткость на экранах с высокой плотностью ----------
function fit() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2), ww = innerWidth, wh = innerHeight, k = Math.min(ww / VW, wh / VH), cw = Math.floor(VW * k), ch = Math.floor(VH * k);
  cvs.style.width = cw + 'px'; cvs.style.height = ch + 'px'; cvs.width = Math.floor(cw * dpr); cvs.height = Math.floor(ch * dpr); Game.k = cvs.width / VW;
}
addEventListener('resize', fit); fit();
cvs.addEventListener('mousedown', e => { if (e.button === 0) { Input.p.Mouse0 = 1; Snd.init() } if (e.button === 2) { Input.p.Mouse2 = 1; Snd.init() } e.preventDefault() });
cvs.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('keydown', () => Snd.init(), { once: false });
// окно потеряло фокус — пауза (иначе бой идёт без игрока)
const autoPause = () => { if (Game.scene === 'play' && !Game.test) Game.scene = 'pause' };
addEventListener('blur', autoPause); document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause() });
let acc = 0, last = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  try { frameBody(ts) } catch (e) { if (!frame.err) { frame.err = 1; console.warn(e) } }
}
function frameBody(ts) {
  const dt = last ? Math.min(.1, (ts - last) / 1000) : DT; last = ts;
  if (!Game.test) { acc += dt; let n = 0; while (acc >= DT && n < 5) { Game.step(DT); acc -= DT; n++ } if (n === 5) acc = 0 }
  ctx = cvs.getContext('2d'); ctx.setTransform(Game.k, 0, 0, Game.k, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low'; // все картинки заранее уменьшены почти до экранного размера — билинейной выборки хватает
  ctx.fillStyle = '#05060c'; ctx.fillRect(0, 0, VW, VH);
  if (Game.scene !== 'load' || Game.loadK >= 1) Game.render(); else { ctx.fillStyle = '#9fb0c8'; ctx.font = `600 22px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText(`Загрузка… ${Math.round(Game.loadK * 100)}%`, VW / 2, VH / 2) }
}
(async () => {
  requestAnimationFrame(frame);
  try { await Promise.race([document.fonts.load(`700 40px ${FONT_TITLE}`), new Promise(r => setTimeout(r, 1500))]) } catch (e) { }
  await Promise.all([loadAssets(k => Game.loadK = k * .95), Hero.init()]);
  World.init(); Hero.reset(W.ARENA / 2 - 200, .6); Eye.reset(Hero.H.x - 60, .6); Game.loadK = 1; Game.scene = 'title';
  window.__ready = true;
})();
// для проверок (Playwright): прямой доступ к состояниям
window.__game = { Game, Hero, Boss, Enemies, Soul, FX, Cam, Input, World, Eye, Problems, Walker, rigDef, rigGeom, rigToWorld, Critic: typeof Critic !== 'undefined' ? Critic : null };
