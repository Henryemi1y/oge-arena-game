// QA игры в Playwright: ошибки консоли, снимки ключевых сцен, критики анимации и правил.
// node tools/qa_game.js [out_dir] [what...]   (what: shots, critic, strikes, soul, sheet, play)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = process.argv[2] || '/tmp/qa'; const WHAT = new Set(process.argv.slice(3).length ? process.argv.slice(3) : ['shots', 'critic', 'strikes', 'soul']);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n'))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()) });
  await p.goto('file://' + path.resolve(__dirname, '../src/game/index.html'));
  await p.waitForFunction(() => window.__ready, null, { timeout: 30000 });
  const R = {};
  const shot = async n => p.screenshot({ path: path.join(OUT, n + '.png') });
  const steps = (n, inp) => p.evaluate(([n, inp]) => { const G = __game.Game; G.test = true; for (let i = 0; i < n; i++) { if (inp) Object.assign(__game.Input.k, inp); G.step(1 / 60) } }, [n, inp || null]);
  if (WHAT.has('shots')) {
    await p.waitForTimeout(600); await shot('01_title');
    await p.evaluate(() => { __game.Game.start(); __game.Game.test = true });
    await steps(120); await shot('02_start');
    await steps(60, { KeyD: 1 }); await steps(1, { KeyD: 0 }); await steps(100, { KeyD: 1, ShiftLeft: 1 }); await shot('03_run');
    await p.evaluate(() => { __game.Input.k = {} }); await steps(40);
    await p.evaluate(() => { __game.Input.p.Mouse0 = 1 }); await steps(18); await shot('04_attack');
    await steps(300); await shot('05_wave');
    // босс
    await p.evaluate(() => { const G = __game.Game; __game.Enemies.reset(); G.queue = []; G.pi = 1; G.next() }); await steps(240); await shot('06_boss');
    await steps(200); await shot('07_boss2');
    await p.evaluate(() => { const B = __game.Boss.b; __game.Boss.breakLimb(B, 'armN') }); await steps(30); await shot('08_break');
    await steps(120); await shot('09_soul');
    await p.evaluate(() => { const S = __game.Soul; S.x = __game.World.monolith.x; S.z = .2 }); await steps(10); await shot('10_monolith');
    await p.evaluate(() => { const G = __game.Game; __game.Boss.reset(); __game.Soul.reset(); __game.Hero.H.soul = false; G.pi = 4; G.next() }); await steps(260); await shot('11_exec');
    await steps(200); await shot('12_exec2');
  }
  if (WHAT.has('critic')) { R.hero = await p.evaluate(() => __game.Critic.hero()); R.walkers = await p.evaluate(() => Object.keys(DRESS).map(id => __game.Critic.walker(id))) }
  if (WHAT.has('strikes')) R.strikes = await p.evaluate(() => ['guardian', 'executioner'].map(id => ({ id, list: __game.Critic.bossStrikes(id) })));
  if (WHAT.has('soul')) R.soul = await p.evaluate(() => __game.Critic.soulNoDamage());
  if (WHAT.has('play')) { // автоигра: герой ходит и рубит, считаем попадания и удары босса
    R.play = await p.evaluate(() => {
      const G = __game.Game, H = __game.Hero.H; G.start(); G.test = true; let hitsE = 0, frames = 0;
      for (let i = 0; i < 60 * 90; i++) {
        const en = __game.Enemies.list.find(e => e.st !== 'dead'), B = __game.Boss.b, tg = en || B; const k = __game.Input.k; for (const c in k) k[c] = 0;
        if (tg && !H.soul) { const dx = tg.x - H.x, want = (B && tg === B) ? 150 : 70; if (Math.abs(dx) > want) k[dx > 0 ? 'KeyD' : 'KeyA'] = 1; else if (Math.sign(dx) !== __game.Hero.FACE) k[dx > 0 ? 'KeyD' : 'KeyA'] = 1; else if (i % 14 === 0) __game.Input.p.Mouse0 = 1; if (Math.abs(tg.z - H.z) > .05) k[tg.z > H.z ? 'KeyS' : 'KeyW'] = 1 }
        G.step(1 / 60); frames++; if (G.scene !== 'play') break;
      }
      return { scene: G.scene, phase: G.pi, hp: H.hp, score: G.score, enemies: __game.Enemies.list.length, impacts: __game.Critic.impacts.slice(-12), time: G.time };
    });
  }
  if (WHAT.has('flow')) { // полный цикл: конечности → душа → монолит (верно/неверно) → оба босса → победа
    await p.evaluate(() => { const G = __game.Game; G.start(); G.test = true; __game.Enemies.reset(); G.queue = []; G.pi = 1; G.next() });
    await steps(330); await shot('f01_guardian');
    const solve = async (part, right, tag) => {
      await p.evaluate(([part]) => { const B = __game.Boss.b; __game.Boss.breakLimb(B, part) }, [part]);
      await steps(20); if (tag) await shot(tag + '_break'); await steps(90); if (tag) await shot(tag + '_shards');
      const info = await p.evaluate(([right]) => {
        const S = __game.Soul, ans = S.ansStr(S.prob.a), want = right ? [...ans] : [...ans].map((c, i) => i === 0 && c !== '−' ? String((+c + 1) % 10) : c);
        const out = { prob: S.prob, ans, want: want.join('') }, used = new Set();
        for (const d of want) { const sh = S.shards.find(s => s.d === d && s.landed && !used.has(s) && !s.carried && !s.placed) || S.shards.find(s => !used.has(s) && s.landed && !s.carried && !s.placed); if (!sh) { out.missing = d; break } used.add(sh); S.x = sh.x; S.z = sh.z; __game.Input.p.KeyE = 1; __game.Game.step(1 / 60); if (S.carried.length >= 3) { S.x = __game.World.monolith.x; S.z = .15; while (S.carried.length) { __game.Input.p.KeyE = 1; __game.Game.step(1 / 60) } } }
        out.carried = S.carried.map(s => s.d).join(''); S.x = __game.World.monolith.x; S.z = .15; for (let i = 0; i < 6 && S.carried.length; i++) { __game.Input.p.KeyE = 1; __game.Game.step(1 / 60) } if (S.full()) { __game.Input.p.KeyE = 1; __game.Game.step(1 / 60) } return out;
      }, [right]);
      if (tag) { await p.evaluate(() => { const S = __game.Soul; S.x = __game.World.monolith.x - 40; S.z = .2 }); await steps(4); await shot(tag + '_carry') }
      await p.evaluate(() => { const S = __game.Soul; S.x = __game.World.monolith.x; S.z = .15; for (let i = 0; i < 4 && S.carried.length; i++) { __game.Input.p.KeyE = 1; __game.Game.step(1 / 60) } if (S.ph === 'free' && S.full()) { __game.Input.p.KeyE = 1; __game.Game.step(1 / 60) } });
      await steps(30); if (tag) await shot(tag + '_result');
      const r = await p.evaluate(([part]) => { const S = __game.Soul, B = __game.Boss.b; return { res: S.res, msg: S.msg, limbAlive: B ? B.limbs[part].alive : null, limbHp: B ? [B.limbs[part].hp, B.limbs[part].max] : null } }, [part]);
      await p.evaluate(() => { for (let i = 0; i < 700 && __game.Soul.on; i++) { if (__game.Soul.ph === 'result' && __game.Soul.t > 2.3) __game.Input.p.KeyE = 1; __game.Game.step(1 / 60) } }); await steps(20); const after = await p.evaluate(([part]) => { const B = __game.Boss.b, S = __game.Soul; return { soulOn: S.on, limbAlive: B ? B.limbs[part].alive : 'boss gone', hp: B ? B.limbs[part].hp : null, gait: B && B.gait, heroSoul: __game.Hero.H.soul } }, [part]);
      return { ...info, ...r, after };
    };
    R.flow = [];
    R.flow.push(await solve('armN', false, 'f02_wrong'));
    R.flow.push(await solve('legN', true, 'f03_leg'));
    await steps(240); await shot('f04_hop');
    R.flow.push(await solve('armN', true));
    R.flow.push(await solve('legF', true)); await steps(200); await shot('f05_sit');
    R.flow.push(await solve('armF', true, 'f06_last')); await steps(200); await shot('f07_crumble');
    R.flowPhase = await p.evaluate(() => ({ pi: __game.Game.pi, boss: !!__game.Boss.b, scene: __game.Game.scene, stats: __game.Game.stats }));
    await p.evaluate(() => { const G = __game.Game; __game.Enemies.reset(); G.queue = []; G.nextT = 0; G.pi = 4; G.next() }); await steps(360); await shot('f08_exec');
    for (const part of ['armN', 'legN', 'legF', 'armF']) R.flow.push(await solve(part, true, part === 'legN' ? 'f09_exec_leg' : null));
    await steps(400); R.flowEnd = await p.evaluate(() => ({ pi: __game.Game.pi, scene: __game.Game.scene, stats: __game.Game.stats, score: __game.Game.score })); await shot('f10_end');
  }
  if (WHAT.has('bossframes')) { // кадры ударов боссов: середина замаха, конец замаха, удар, удержание
    for (const [id, keys] of [['guardian', ['slam', 'sweep', 'stomp']], ['executioner', ['chop', 'cleave']]]) for (const key of keys) {
      await p.evaluate(([id, key]) => { const G = __game.Game; G.start(); G.test = true; __game.Enemies.reset(); G.queue = []; G.phase = { type: 'boss' }; const H = __game.Hero.H, Bo = __game.Boss; Bo.reset(); const B = Bo.spawn(id); B.st = 'move'; B.alpha = 1; B.x = 1900; B.z = .55; H.x = 1500; H.z = .55;
        for (let i = 0; i < 40; i++) { Bo.update(1 / 60) } B.x = 1900; B.face = B.c.face = -1; const A = { ...BATK[key], key }; const reach = A.leg ? 0 : Bo.armReach(B, A) * Bo.s(B); H.x = A.leg ? B.x - 150 : B.x - reach * (A.D || .6); H.z = B.z; __game.Cam.snap((H.x + B.x) / 2);
        const T = Bo.targetFor(B, A), pl = A.leg ? { ok: 1 } : Bo.plan(B, A, T); window.__pl = pl; if (pl) Bo.startAtk(B, A, T, pl); __game.Hero.H.inv = 99 }, [id, key]);
      const pl = await p.evaluate(() => window.__pl); if (!pl) { console.log('no plan', id, key); continue }
      const A = await p.evaluate(([key]) => BATK[key], [key]);
      const marks = [['a', A.wind * .5], ['b', A.wind * .5], ['c', A.strike], ['d', A.hold * .5]];
      for (const [tag, dt] of marks) { await p.evaluate(([dt]) => { for (let i = 0; i < Math.round(dt * 60); i++) { __game.Boss.update(1 / 60); __game.FX.step(1 / 60) } }, [dt]); await shot(`b_${id}_${key}_${tag}`) }
    }
  }
  if (WHAT.has('enemyframes')) { // кадры атак врагов: замах, удар
    for (const type of ['ghoul', 'knight', 'doctor', 'goatman']) {
      await p.evaluate(([type]) => { const G = __game.Game; G.start(); G.test = true; G.queue = []; G.phase = { type: 'boss' }; G.bossT = 0; __game.Enemies.reset(); const H = __game.Hero.H; H.x = 1500; H.z = .55; H.inv = 99;
        const e = __game.Enemies.spawn(type, 1); e.x = type === 'doctor' ? 1880 : type === 'goatman' ? 1820 : 1500 + ETYPES[type].range * .8; e.z = .55; e.st = 'move'; e.alpha = 1; e.cd = 0; e.face = e.c.face = -1; __game.Cam.snap(1650) }, [type]);
      for (let k = 0; k < 4; k++) { await p.evaluate(() => { for (let i = 0; i < 12; i++) { __game.Enemies.update(1 / 60); __game.FX.step(1 / 60); __game.Hero.update(1 / 60, { x: 0, z: 0, atk: -1 }) } }); await shot(`e_${type}_${k}`) }
    }
  }
  if (WHAT.has('sheet')) { // покадровые листы героя и врагов: снимки холста по кадрам
    await p.evaluate(() => { __game.Game.start(); __game.Game.test = true; __game.Enemies.reset() });
    for (let i = 0; i < 8; i++) { await steps(6, { KeyD: 1 }); await shot('sheet_walk_' + i) }
  }
  R.errors = errs;
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(R, null, 1));
  console.log(JSON.stringify(R, (k, v) => typeof v === 'number' ? +v.toFixed(3) : v).slice(0, 6000));
  await b.close();
})();
