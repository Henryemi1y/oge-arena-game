// ui.js — интерфейс по-русски: здоровье, волна/босс и конечности, узкая каменная табличка с уравнением в форме души,
// подсказки, баннеры; титульный экран, пауза, победа и поражение.
const FONT_TITLE = '"Alegreya SC", Georgia, serif', FONT_UI = '"Alegreya Sans SC", "Alegreya Sans", system-ui, sans-serif', FONT_EQ = '"PT Serif", Georgia, serif';
const UI = {
  banners: [], helpT: 0, stonePat: null,
  banner(text, sub = '', col = '#e6eefc', life = 2.4) { this.banners = [{ text, sub, col, t: 0, life }] },
  step(dt) { for (const b of this.banners) b.t += dt; this.banners = this.banners.filter(b => b.t < b.life); this.helpT += dt },
  pat() { if (!this.stonePat) { const c = mkCanvas(IM.floor.width * .35, IM.floor.height * .35); c.getContext('2d').drawImage(IM.floor, 0, 0, c.width, c.height); this.stonePat = ctx.createPattern(c, 'repeat') } return this.stonePat },
  panel(x, y, w, h, a = .78) { ctx.save(); ctx.fillStyle = `rgba(9,11,20,${a})`; ctx.strokeStyle = 'rgba(150,175,220,.28)'; ctx.lineWidth = 1; rr(x, y, w, h, 6); ctx.fill(); ctx.stroke(); ctx.restore() },
  bar(x, y, w, h, k, c1, c2, back = 'rgba(255,255,255,.08)') { ctx.fillStyle = back; ctx.fillRect(x, y, w, h); const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(x, y, w * cl(k, 0, 1), h); ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1) },
  text(s, x, y, size, col = '#dfe7f5', font = FONT_UI, align = 'left', weight = 600) { ctx.font = `${weight} ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillText(s, x + 1, y + 2); ctx.fillStyle = col; ctx.fillText(s, x, y) },
  hud() {
    // над героем: «Отбито!» после парирования, «Блок» — если поздно
    { const Hh = Hero.H, par = Hh.parT > 0; if (!Hh.soul && (par || Hh.blkT > 0)) { const a = Math.min(1, (par ? Hh.parT : Hh.blkT) * 2.5), y = zy(Hh.z) - Hero.height() * .78 - (1 - a) * 16; ctx.globalAlpha = a; this.text(par ? 'Отбито!' : 'Рано — блок', sx(Hh.x) + Hero.FACE * 92, y, par ? 26 : 20, par ? '#ffe09a' : '#d8c8b0', FONT_TITLE, 'center', 700); ctx.globalAlpha = 1 } }
    const H = Hero.H, G = Game;
    // здоровье
    this.panel(16, 14, 300, 56); this.text('Здоровье', 28, 36, 18, '#aeb9cf'); this.text(`${Math.ceil(H.hp)}`, 304, 36, 18, '#f1d7d2', FONT_UI, 'right');
    this.bar(28, 45, 276, 14, H.hp / H.maxhp, '#e0574a', '#8e2420');
    { const u = (H.ult || 0) / 100, full = u >= 1, pl = .5 + .5 * Math.sin(G.t * 6); H.ultPop = Math.max(0, (H.ultPop || 0) - 1 / 60);
      this.panel(16, 74, 300, 30, .8); this.text(full ? 'Разлом · R' : 'Разлом', 28, 95, 15, full ? '#efe6ff' : '#a99fc6', FONT_UI, 'left', full ? 700 : 500);
      const bx = 150, bw = 154; ctx.fillStyle = 'rgba(20,16,36,.9)'; ctx.fillRect(bx, 84, bw, 10); const gr = ctx.createLinearGradient(bx, 0, bx + bw, 0); gr.addColorStop(0, '#6d4cc9'); gr.addColorStop(1, full ? '#f0e4ff' : '#b49cff'); ctx.fillStyle = gr; ctx.fillRect(bx, 84, bw * u, 10);
      if (full) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .35 + .35 * pl; ctx.drawImage(FX.glow('190,160,255'), bx - 20, 70, bw + 40, 38); ctx.restore() } } if (G.healFx > 0) { ctx.globalAlpha = G.healFx; this.text(`+${G.healAmt}`, 320, 54, 18, '#9dffb8', FONT_UI, 'left', 700); ctx.globalAlpha = 1 }
    // серия попаданий
    if (G.chainT > 0 && G.chainN >= 3 && !Soul.on) { const a = Math.min(1, G.chainT * 2), sc = 1 + .25 * (G.chainPop || 0); ctx.globalAlpha = a; this.text(`Серия ×${G.chainN}`, 28, 134, Math.round(22 * sc), G.chainN >= 10 ? '#ffd98a' : '#cfe6ff', FONT_TITLE, 'left', 700); ctx.globalAlpha = 1 }
    // очки и решённые задачи
    this.panel(VW - 246, 14, 230, G.stats.tasks ? 58 : 36); this.text(`Очки: ${G.score}`, VW - 234, 38, 19, '#e6d9b8'); if (G.stats.tasks) this.text(`Решено: ${G.stats.solved} из ${G.stats.tasks}`, VW - 234, 62, 17, '#9fd8f0');
    this.text(Snd.muted ? 'M — звук выкл' : 'M — звук', VW - 28, 36, 13, '#7f8aa0', FONT_UI, 'right', 500);
    // волна или босс
    const B = Boss.b;
    if (B && B.st !== 'dying') {
      const w = 540, x = VW / 2 - w / 2; this.panel(x, 12, w, 74); this.text(DRESS[B.id].name, VW / 2, 35, 21, '#e9e2d0', FONT_TITLE, 'center', 700);
      LIMBS.forEach((l, i) => { const lm = B.limbs[l], bx = x + 14 + i * 130, k = lm.alive ? lm.hp / lm.max : 0; const hl = lm.alive ? Math.min(1, (lm.showT || 0) * 1.5) : 0; if (hl > 0) { ctx.globalAlpha = hl * .5; ctx.fillStyle = '#7fc4ff'; ctx.fillRect(bx - 6, 41, 128, 38); ctx.globalAlpha = 1 } this.text(LIMB_NAME[l], bx, 56, 15, hl > .2 ? '#ffffff' : lm.alive ? '#b9c3d6' : '#5f6779', FONT_UI, 'left', hl > .2 ? 700 : 500);
        this.bar(bx, 63, 116, 10, k, lm.regrow > 0 ? '#ffb27a' : '#9fb3cf', lm.regrow > 0 ? '#a0522d' : '#56657d'); if (!lm.alive) { ctx.strokeStyle = '#7ad6ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + 2, 68); ctx.lineTo(bx + 114, 68); ctx.stroke() } });
    } else if (G.phase && G.phase.type === 'wave' && !Soul.on && !((G.ultDim || 0) > .04)) { const n = Enemies.alive() + G.queue.length; if (n) { this.panel(VW / 2 - 130, 12, 260, 40); this.text(`${G.phase.name} · врагов: ${n}`, VW / 2, 39, 19, '#e6e0cf', FONT_TITLE, 'center', 700) } }
    // форма души: табличка с уравнением
    if (Soul.on && Soul.prob) this.soulTablet();
    // подсказка управления в начале
    const live = Game.scene === 'play';
    if (live && !Soul.on) this.tutorial(G.t);
    // баннеры
    // в форме души экран занят табличкой и монолитом — баннер идёт одной строкой над подсказкой внизу
    if (live) for (const b of this.banners) { const k = b.t / b.life, a = Math.min(1, b.t * 4) * Math.min(1, (b.life - b.t) * 2.5); ctx.globalAlpha = a;
      if (Soul.on && Soul.ph === 'result') { } else if (Soul.on) this.text(b.text, this.tabX || VW / 2, (this.tabB || 218) + 66, 26, b.col, FONT_TITLE, 'center', 700); // под табличкой: внизу надпись ложилась на душу и подсказку
      else { const y = VH * .34 - 10 * k; this.text(b.text, VW / 2, y, 52, b.col, FONT_TITLE, 'center', 700); if (b.sub) this.text(b.sub, VW / 2, y + 36, 21, '#c2cde2', FONT_UI, 'center', 500) } ctx.globalAlpha = 1 }
  },
  soulTablet() {
    // табличка уходит в сторону от босса, чтобы не закрывать ему голову
    const S = Soul, mp = S.mp, mono = !!mp && mp[0] > 30 && mp[0] + mp[2] < VW - 30;     const w = 470, h = 124, B = Boss.b, bx = B && !B.gone ? sx(B.x) : null, want = bx == null || bx < -200 || bx > VW + 200 ? VW / 2 : bx > VW / 2 ? 290 : VW - 290;
    this.tabX = this.tabX == null ? want : lp(this.tabX, want, .08); const cx = this.tabX, x = cx - w / 2, y = Boss.b ? 94 : 60; this.tabB = y + h;
    let full = S.full();
    ctx.save(); rr(x, y, w, h, 10); ctx.fillStyle = this.pat(); ctx.fill(); ctx.fillStyle = 'rgba(8,12,24,.84)'; ctx.fill(); ctx.strokeStyle = 'rgba(120,200,255,.55)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    this.text(S.prob.c, x + 16, y + 24, 16, '#8fcbe6', FONT_UI, 'left', 600);
    // уравнение: дроби — столбиком, как в бланке ОГЭ
    ctx.save(); ctx.shadowColor = '#3fa9ff'; ctx.shadowBlur = 10; mathText(S.prob.t, cx, y + (mono ? 66 : 60), mono ? 30 : 26, '#dcf6ff', 'center', w - 40); ctx.restore();
    // ячейки ответа
    const n = mono ? 0 : S.slots, cw = 34, x0 = cx - n * cw / 2, cy = y + 104;
    if (mono) this.text('ответ собирается на монолите', cx, y + 110, 13, '#7f93a8', FONT_UI, 'center', 500);
    for (let i = 0; i < n; i++) { ctx.strokeStyle = S.confirm > 0 && i < S.placed.length ? 'rgba(255,217,138,.95)' : full ? 'rgba(160,255,200,.8)' : 'rgba(140,220,255,.55)'; ctx.lineWidth = 1.5; ctx.strokeRect(x0 + i * cw + 3, cy - 14, cw - 6, 28); const s = S.placed[i]; if (s) Soul.drawShardAt(s, x0 + i * cw + cw / 2, cy, .42) }
    // время души
    const k = S.T / S.TMAX; this.bar(x + w - 124, y + 14, 108, 8, k, k > .3 ? '#7fe3ff' : '#ff9a7a', k > .3 ? '#2c8fbf' : '#b0402a'); this.text(`${Math.ceil(S.T)} с`, x + w - 16, y + 39, 15, S.T < 10 ? '#ffb59a' : '#a9d9ee', FONT_UI, 'right', 600);
    // в руках: первая цифра ляжет следующей
    if (S.carried.length) { const hy = mono ? h + 6 : 92; if (mono) { this.panel(x, y + h + 2, 196, 34, .8) } this.text('В руках:', x + 16, y + hy + 18, 15, '#9fb8cc', FONT_UI, 'left', 500); S.carried.forEach((s, i) => { if (!i) { ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = 2; ctx.strokeRect(x + 84 + i * 30, y + hy, 26, 26) } Soul.drawShardAt(s, x + 97 + i * 30, y + hy + 13, .34) }) }
    // подсказка внизу — по состоянию
    const at = S.atMonolith(), near = S.nearShard(), nx = S.carried[0] ? `«${S.carried[0].d}»` : '';
    const ans = S.placed.map(s => s.d).join('');
    const tips = S.ph !== 'free' ? [] : at && S.confirm > 0 ? [['E', `проверить ${ans}`], ['Q', 'забрать']]
      : at && full ? [['E', 'проверить'], ['Q', 'забрать']]
      : at && S.carried.length ? [['E', `положить ${S.carried[0].d}`], ['R', 'порядок'], ['Q', 'забрать']]
      : at && S.placed.length ? [['E', 'проверить'], ['Q', 'забрать']]
      : near && S.carried.length < 3 ? [['E', `взять ${near.d}`]] : S.carried.length >= 3 ? [['Q', 'бросить']] : [];
    if (tips.length) this.keyTips(tips, VW / 2, VH - 44, S.hint > 0);
    if (S.msg && S.ph === 'result') {
      const m = S.msg, cy2 = VH * .40; this.panel(VW / 2 - 330, cy2 - 58, 660, m.ok ? 92 : 150, .82);
      this.text(m.text, VW / 2, cy2, 44, m.ok ? '#8dffb3' : '#ff8a7a', FONT_TITLE, 'center', 700);
      if (m.ok) { const parts = []; if (m.heal > 0) parts.push(`+${m.heal} здоровья`); if (m.fast) parts.push('быстрый ответ!'); if (parts.length) this.text(parts.join(' · '), VW / 2, cy2 + 26, 19, '#c9f7d8', FONT_UI, 'center', 600) }
      else { this.text(`Верный ответ: ${m.ans}`, VW / 2, cy2 + 30, 22, '#e8eef8', FONT_UI, 'center', 700); if (m.sol) mathText(m.sol, VW / 2, cy2 + 62, 18, '#b9d8ea', 'center', 620); if (S.t > 2.2) this.text('E — дальше', VW / 2, cy2 + 84, 14, '#8a97ad', FONT_UI, 'center', 500) }
    }
    // стрелки к монолиту и к осколкам за краем экрана
    const edge = (wx, z, label, col) => { const X = sx(wx); if (X >= 0 && X <= VW) return; const right = X > VW, ax = right ? VW - 26 : 26, ay = cl(zy(z) - 60, 140, VH - 90); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(ax + (right ? 14 : -14), ay); ctx.lineTo(ax - (right ? 8 : -8), ay - 12); ctx.lineTo(ax - (right ? 8 : -8), ay + 12); ctx.fill(); this.text(label, ax + (right ? -18 : 18), ay + 6, 15, col, FONT_UI, right ? 'right' : 'left', 700) };
    if (S.ph === 'free') { for (const s of S.shards) if (s.landed && !s.carried && !s.placed) edge(s.x, s.z, s.d, 'rgba(150,220,255,.8)'); edge(World.monolith.x, .1, 'монолит', 'rgba(255,225,150,.9)') }
  },
  overlay(a = .62) { ctx.fillStyle = `rgba(5,6,12,${a})`; ctx.fillRect(0, 0, VW, VH) },
  title(t, loadK) {
    this.overlay(.55); const y = 200;
    ctx.save(); ctx.shadowColor = '#3f8cff'; ctx.shadowBlur = 24; this.text('Арена осколков', VW / 2, y, 86, '#e8eefc', FONT_TITLE, 'center', 700); ctx.restore();
    if (loadK < 1) this.text(`Загрузка… ${Math.round(loadK * 100)}%`, VW / 2, VH - 120, 22, '#9fb0c8', FONT_UI, 'center', 600);
    else { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 10; ctx.globalAlpha = .75 + .25 * Math.sin(t * 2.6); this.text('Нажмите, чтобы начать', VW / 2, VH - 120, 28, '#f6ecd0', FONT_TITLE, 'center', 700); ctx.restore() }
  },
  // клавиша-плашка
  keycap(x, y, label, hot = 0) { ctx.font = `700 17px ${FONT_UI}`; const w = Math.max(30, ctx.measureText(label).width + 18), h = 30, X = x - w / 2, Y = y - h / 2;
    ctx.fillStyle = 'rgba(8,10,18,.55)'; rr(X, Y + 3, w, h, 6); ctx.fill(); const g = ctx.createLinearGradient(0, Y, 0, Y + h); g.addColorStop(0, hot ? '#fff1c8' : '#e9edf5'); g.addColorStop(1, hot ? '#d9b46a' : '#aeb7c8'); ctx.fillStyle = g; rr(X, Y - (hot ? 0 : 1), w, h, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(20,24,36,.8)'; ctx.lineWidth = 1.5; rr(X, Y - (hot ? 0 : 1), w, h, 6); ctx.stroke(); this.text(label, x, y + 6 - (hot ? 0 : 1), 17, '#1a1e2a', FONT_UI, 'center', 700); return w },
  // мышь: левая или правая кнопка подсвечена; hold — кольцо заполнения (зажать)
  mouse(x, y, btn, t, hold = -1) { const w = 34, h = 48, X = x - w / 2, Y = y - h / 2, on = .5 + .5 * Math.sin(t * 7);
    ctx.fillStyle = 'rgba(8,10,18,.55)'; rr(X, Y + 3, w, h, 15); ctx.fill(); ctx.fillStyle = '#dfe4ee'; rr(X, Y, w, h, 15); ctx.fill(); ctx.strokeStyle = 'rgba(20,24,36,.85)'; ctx.lineWidth = 1.5; rr(X, Y, w, h, 15); ctx.stroke();
    ctx.save(); rr(X, Y, w, h, 15); ctx.clip(); ctx.fillStyle = `rgba(255,${190 + 40 * on | 0},90,${.55 + .4 * on})`; ctx.fillRect(btn ? x : X, Y, w / 2, h * .42); ctx.restore();
    ctx.beginPath(); ctx.moveTo(x, Y); ctx.lineTo(x, Y + h * .42); ctx.moveTo(X, Y + h * .42); ctx.lineTo(X + w, Y + h * .42); ctx.stroke();
    if (hold >= 0) { ctx.strokeStyle = 'rgba(255,214,120,.95)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 34, -PI / 2, -PI / 2 + TAU * hold); ctx.stroke() } },
  // ряд подсказок «клавиша — действие»
  keyTips(tips, cx, y, hot) { ctx.font = `600 18px ${FONT_UI}`; const ws = tips.map(([k, v]) => Math.max(30, ctx.measureText(k).width + 18) + 10 + ctx.measureText(v).width), gap = 34, tot = ws.reduce((a, b) => a + b, 0) + gap * (tips.length - 1);
    let x = cx - tot / 2; this.panel(x - 16, y - 24, tot + 32, 48, .62); tips.forEach(([k, v], i) => { const kw = this.keycap(x + Math.max(30, (ctx.font = `700 17px ${FONT_UI}`, ctx.measureText(k).width + 18)) / 2, y, k, hot); this.text(v, x + kw + 10, y + 6, 18, hot ? '#ffe2a0' : '#e3e9f4', FONT_UI, 'left', 600); x += ws[i] + gap }) },
  // вводное обучение: одно действие за раз, иконка мыши или клавиши; гаснет, когда игрок это сделал
  TUT: [['move', 'идти'], ['hit', 'удар'], ['charge', 'зажать — сильный удар'], ['dash', 'рывок'], ['parry', 'отбить удар']],
  tutorial(t) { const T = Game.tut; if (!T) return; const st = this.TUT.find(([k]) => !T[k]);
    if (T.fade > 0) T.fade = Math.max(0, T.fade - 1 / 60);
    if (!st && !(Hero.H.ult >= 100 && !T.ult)) return; const [k, v] = st && !(Hero.H.ult >= 100 && !T.ult) ? st : ['ult', 'Разлом'], a = 1 - (T.fade || 0), x = VW / 2, y = VH - 92;
    ctx.globalAlpha = a; this.panel(x - 170, y - 40, 340, 80, .6);
    if (k === 'move') { this.keycap(x - 96, y, 'A'); this.keycap(x - 58, y, 'D') }
    else if (k === 'hit') this.mouse(x - 80, y, 0, t);
    else if (k === 'charge') { const hp = Hero.st.hold ? Math.min(1, (Hero.H.chg || 0) / 1.15) : (t * .7) % 1; this.mouse(x - 80, y, 0, t, hp) }
    else if (k === 'dash') this.keycap(x - 80, y, 'Пробел')
    else if (k === 'parry') { this.keycap(x - 104, y, 'F'); this.mouse(x - 60, y, 1, t) }
    else if (k === 'ult') this.keycap(x - 80, y, 'R', 1);
    this.text(v, x - 30, y + 7, 22, '#f0e6c8', FONT_TITLE, 'left', 700); ctx.globalAlpha = 1 },
  controls(y) {
    const lines = [['A / D, ← / →', 'шаг влево и вправо'], ['Shift', 'бег'], ['W / S, ↑ / ↓', 'вглубь и ближе'], ['Space', 'рывок (уворот)'], ['ЛКМ', 'серия из трёх ударов'], ['ЛКМ (зажать)', 'заряженный удар: чем дольше, тем сильнее'], ['R', 'Разлом — когда шкала полна'], ['J / K / L', 'удар сверху, вбок, снизу'], ['F · ПКМ', 'парировать: нажми чуть раньше удара'], ['E · Q · R', 'душой: подобрать / вернуть / порядок'], ['Enter · M · − / +', 'пауза · звук · громкость']];
    this.panel(VW / 2 - 270, y, 540, lines.length * 25 + 20, .88);
    lines.forEach(([k, v], i) => { this.text(k, VW / 2 - 16, y + 28 + i * 25, 17, '#ffd98a', FONT_UI, 'right', 700); this.text(v, VW / 2 + 4, y + 28 + i * 25, 17, '#d5ddec', FONT_UI, 'left', 500) });
  },
  pause() { this.overlay(.62); this.text('Пауза', VW / 2, 170, 64, '#e8eefc', FONT_TITLE, 'center', 700); this.controls(200); this.text('Enter или щелчок — продолжить', VW / 2, VH - 60, 24, '#f3e7c4', FONT_TITLE, 'center', 700); this.text(`Громкость: ${Math.round(Snd.vol * 100)}%`, VW / 2, VH - 30, 16, '#9aa6bb', FONT_UI, 'center', 500) },
  end(win, t) {
    this.overlay(.68); const G = Game, s = G.stats, tm = Math.floor(G.time);
    ctx.save(); ctx.shadowColor = win ? '#4fd6ff' : '#ff4a3a'; ctx.shadowBlur = 26; this.text(win ? 'Победа' : 'Поражение', VW / 2, 150, 84, win ? '#dff7ff' : '#ffd2cc', FONT_TITLE, 'center', 700); ctx.restore();
    this.panel(VW / 2 - 440, 222, 400, 154, .6);
    [['Решено задач', `${s.solved} из ${s.tasks}`], ['Разбито конечностей', `${s.broken}`], ['Отбито ударов', `${s.parries || 0}`], ['Лучшая серия', `×${s.best || 0}`], ['Время', `${Math.floor(tm / 60)}:${String(tm % 60).padStart(2, '0')}`], ['Очки', `${G.score}`]].forEach(([k, v], i) => { this.text(k, VW / 2 - 420, 254 + i * 26, 18, '#aeb9cf', FONT_UI, 'left', 500); this.text(v, VW / 2 - 60, 254 + i * 26, 18, '#f0e6c8', FONT_UI, 'right', 700) });
    // темы: что получилось, что повторить
    const tp = Object.entries(s.topics || {}); this.panel(VW / 2 + 20, 222, 420, Math.max(128, 44 + tp.length * 24), .6); this.text('Темы', VW / 2 + 40, 250, 18, '#d8e2f2', FONT_TITLE, 'left', 700);
    if (!tp.length) this.text('Задач пока не было', VW / 2 + 40, 278, 16, '#8a97ad', FONT_UI, 'left', 500);
    tp.forEach(([k, v], i) => { const good = v.ok === v.n; this.text(k, VW / 2 + 40, 278 + i * 24, 16, '#c3cde0', FONT_UI, 'left', 500); this.text(`${v.ok} из ${v.n}`, VW / 2 + 420, 278 + i * 24, 16, good ? '#9dffb8' : '#ffb39a', FONT_UI, 'right', 700) });
    const weak = tp.filter(([k, v]) => v.ok < v.n).map(([k]) => k); if (weak.length) this.text('Повторить: ' + weak.slice(0, 3).join(', '), VW / 2, VH - 112, 18, '#ffcfae', FONT_UI, 'center', 600);
    ctx.globalAlpha = .55 + .45 * Math.sin(t * 3.2);
    if (win) this.text('Enter — сыграть снова', VW / 2, VH - 62, 28, '#f3e7c4', FONT_TITLE, 'center', 700);
    else { this.text(Game.check && Game.check.limbs ? 'Enter — продолжить бой: разбитые конечности не вернутся' : 'Enter — заново с этого этапа', VW / 2, VH - 70, Game.check && Game.check.limbs ? 24 : 28, '#f3e7c4', FONT_TITLE, 'center', 700); ctx.globalAlpha = 1; this.text('N — новая игра', VW / 2, VH - 38, 18, '#aeb9cf', FONT_UI, 'center', 600) }
    ctx.globalAlpha = 1;
  },
};
// текст с дробями «столбиком»: «3/4», «x/5», «4/(x − 1)» → числитель над знаменателем
function mathText(str, x, y, size, col, align = 'left', maxW = 9999) {
  for (let sz = size; sz >= 10; sz -= 2) {
    const parts = [], re = /(\d+|x)\/(\d+|\([^()]*\))/g; let last = 0, m;
    while ((m = re.exec(str))) { if (m.index > last) parts.push({ t: str.slice(last, m.index) }); parts.push({ n: m[1], d: m[2].replace(/^\((.*)\)$/, '$1') }); last = re.lastIndex }
    if (last < str.length) parts.push({ t: str.slice(last) });
    const fs = sz * .72; ctx.font = `700 ${sz}px ${FONT_EQ}`; let w = 0;
    for (const p of parts) { if (p.t != null) { ctx.font = `700 ${sz}px ${FONT_EQ}`; p.w = ctx.measureText(p.t).width } else { ctx.font = `700 ${fs}px ${FONT_EQ}`; p.w = Math.max(ctx.measureText(p.n).width, ctx.measureText(p.d).width) + 6 } w += p.w }
    if (w > maxW && sz > 10) continue;
    let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = col; ctx.strokeStyle = col;
    for (const p of parts) {
      if (p.t != null) { ctx.font = `700 ${sz}px ${FONT_EQ}`; ctx.fillText(p.t, cx, y) }
      else { ctx.font = `700 ${fs}px ${FONT_EQ}`; ctx.textAlign = 'center'; const mx = cx + p.w / 2, my = y - sz * .3; ctx.fillText(p.n, mx, my - 3); ctx.fillText(p.d, mx, my + fs * .95); ctx.lineWidth = Math.max(1.5, sz / 14); ctx.beginPath(); ctx.moveTo(cx + 2, my); ctx.lineTo(cx + p.w - 2, my); ctx.stroke(); ctx.textAlign = 'left' }
      cx += p.w;
    }
    return w;
  }
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath() }
