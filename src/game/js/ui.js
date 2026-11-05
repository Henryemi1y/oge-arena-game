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
    const H = Hero.H, G = Game;
    // здоровье
    this.panel(16, 14, 300, 50); this.text('Здоровье', 28, 33, 15, '#aeb9cf'); this.text(`${Math.ceil(H.hp)}`, 304, 33, 15, '#f1d7d2', FONT_UI, 'right');
    this.bar(28, 40, 276, 12, H.hp / H.maxhp, '#e0574a', '#8e2420');
    // очки и решённые задачи
    this.panel(VW - 236, 14, 220, 50); this.text(`Очки: ${G.score}`, VW - 224, 34, 16, '#e6d9b8'); this.text(`Решено: ${G.stats.solved} из ${G.stats.tasks}`, VW - 224, 55, 14, '#9fd8f0');
    this.text(Snd.muted ? 'M — звук выкл' : 'M — звук', VW - 28, 34, 12, '#7f8aa0', FONT_UI, 'right', 500);
    // волна или босс
    const B = Boss.b;
    if (B && B.st !== 'dying') {
      const w = 520, x = VW / 2 - w / 2; this.panel(x, 12, w, 70); this.text(DRESS[B.id].name, VW / 2, 34, 20, '#e9e2d0', FONT_TITLE, 'center', 700);
      LIMBS.forEach((l, i) => { const lm = B.limbs[l], bx = x + 14 + i * 125, k = lm.alive ? lm.hp / lm.max : 0; this.text(LIMB_NAME[l], bx, 54, 12, lm.alive ? '#b9c3d6' : '#5f6779', FONT_UI, 'left', 500);
        this.bar(bx, 60, 112, 9, k, lm.regrow > 0 ? '#ffb27a' : '#9fb3cf', lm.regrow > 0 ? '#a0522d' : '#56657d'); if (!lm.alive) { ctx.strokeStyle = '#7ad6ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + 2, 64); ctx.lineTo(bx + 110, 64); ctx.stroke() } });
    } else if (G.phase && G.phase.type === 'wave') { const n = Enemies.alive() + G.queue.length; this.panel(VW / 2 - 120, 12, 240, 40); this.text(`${G.phase.name} · врагов: ${n}`, VW / 2, 39, 18, '#e6e0cf', FONT_TITLE, 'center', 700) }
    // форма души: табличка с уравнением
    if (Soul.on && Soul.prob) this.soulTablet();
    // подсказка управления в начале
    if (this.helpT < 14 && !Soul.on) { const a = Math.min(1, (14 - this.helpT) / 2); ctx.globalAlpha = a; this.panel(16, VH - 66, 640, 50, .6);
      this.text('A/D — шаг · Shift — бег · W/S — вглубь/ближе · Space — рывок', 28, VH - 45, 14, '#c9d3e6', FONT_UI, 'left', 500); this.text('ЛКМ — серия из трёх ударов · J/K/L — удары · Enter — пауза', 28, VH - 25, 14, '#c9d3e6', FONT_UI, 'left', 500); ctx.globalAlpha = 1 }
    // баннеры
    for (const b of this.banners) { const k = b.t / b.life, a = Math.min(1, b.t * 4) * Math.min(1, (b.life - b.t) * 2.5), y = VH * .36 - 10 * k; ctx.globalAlpha = a; this.text(b.text, VW / 2, y, 52, b.col, FONT_TITLE, 'center', 700); if (b.sub) this.text(b.sub, VW / 2, y + 36, 20, '#b8c4da', FONT_UI, 'center', 500); ctx.globalAlpha = 1 }
  },
  soulTablet() {
    const S = Soul, w = 430, h = 92, x = VW / 2 - w / 2, y = Boss.b ? 90 : 60;
    ctx.save(); rr(x, y, w, h, 10); ctx.fillStyle = this.pat(); ctx.fill(); ctx.fillStyle = 'rgba(8,12,24,.8)'; ctx.fill(); ctx.strokeStyle = 'rgba(120,200,255,.55)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    this.text(S.prob.c, x + 16, y + 22, 14, '#8fcbe6', FONT_UI, 'left', 600);
    ctx.save(); ctx.shadowColor = '#3fa9ff'; ctx.shadowBlur = 12; this.text(S.prob.t, VW / 2, y + 52, 26, '#dcf6ff', FONT_EQ, 'center', 700); ctx.restore();
    // ячейки ответа
    const n = S.slots, cw = 30, x0 = VW / 2 - n * cw / 2, cy = y + 74;
    for (let i = 0; i < n; i++) { ctx.strokeStyle = 'rgba(140,220,255,.55)'; ctx.lineWidth = 1.5; ctx.strokeRect(x0 + i * cw + 3, cy - 12, cw - 6, 24); const s = S.placed[i]; if (s) Soul.drawShardAt(s, x0 + i * cw + cw / 2, cy, .36) }
    // время души
    const k = S.T / S.TMAX; this.bar(x + w - 120, y + 12, 104, 8, k, k > .3 ? '#7fe3ff' : '#ff9a7a', k > .3 ? '#2c8fbf' : '#b0402a'); this.text(`${Math.ceil(S.T)} с`, x + w - 16, y + 36, 13, '#a9d9ee', FONT_UI, 'right', 600);
    // в руках
    if (S.carried.length) { this.text('В руках:', x + 16, y + 80, 13, '#9fb8cc', FONT_UI, 'left', 500); S.carried.forEach((s, i) => Soul.drawShardAt(s, x + 82 + i * 26, y + 75, .3)) }
    // подсказка внизу
    const at = S.atMonolith(), near = S.nearShard();
    const tip = S.ph !== 'free' ? '' : at && S.carried.length ? 'E — положить осколок на монолит · Q — вернуть последний' : near && S.carried.length < 3 ? 'E — подобрать осколок' : S.carried.length >= 3 ? 'Руки заняты — неси осколки к монолиту (Q — бросить)' : 'Собери цифры ответа и неси к монолиту в центре арены';
    if (tip) { this.panel(VW / 2 - 300, VH - 56, 600, 36, .7); this.text(tip, VW / 2, VH - 32, 16, S.hint > 0 ? '#ffd27a' : '#cfe9f6', FONT_UI, 'center', 600) }
    if (S.msg && S.ph === 'result') { this.text(S.msg.text, VW / 2, VH * .42, 48, S.msg.ok ? '#8dffb3' : '#ff8a7a', FONT_TITLE, 'center', 700); if (!S.msg.ok) this.text(`Верный ответ: ${S.msg.ans}`, VW / 2, VH * .42 + 38, 22, '#e8eef8', FONT_UI, 'center', 600) }
    // стрелка к монолиту, если он за краем экрана
    const mx = sx(World.monolith.x); if (mx < 0 || mx > VW) { const right = mx > VW, ax = right ? VW - 30 : 30, ay = zy(.1) - 160; ctx.fillStyle = 'rgba(140,220,255,.85)'; ctx.beginPath(); ctx.moveTo(ax + (right ? 14 : -14), ay); ctx.lineTo(ax - (right ? 8 : -8), ay - 12); ctx.lineTo(ax - (right ? 8 : -8), ay + 12); ctx.fill(); this.text('монолит', ax + (right ? -16 : 16), ay + 30, 13, '#9fd8f0', FONT_UI, right ? 'right' : 'left', 600) }
  },
  overlay(a = .62) { ctx.fillStyle = `rgba(5,6,12,${a})`; ctx.fillRect(0, 0, VW, VH) },
  title(t, loadK) {
    this.overlay(.55); const y = 230;
    ctx.save(); ctx.shadowColor = '#3f8cff'; ctx.shadowBlur = 24; this.text('Арена осколков', VW / 2, y, 86, '#e8eefc', FONT_TITLE, 'center', 700); ctx.restore();
    this.text('Разбей каменных стражей. Собери ответ из осколков.', VW / 2, y + 48, 22, '#b6c3db', FONT_UI, 'center', 500);
    const lines = [['A / D, ← / →', 'шаг влево и вправо'], ['Shift', 'бег'], ['W / S, ↑ / ↓', 'вглубь и ближе'], ['Space', 'рывок'], ['ЛКМ', 'серия из трёх ударов'], ['J / K / L', 'удар сверху, вбок, снизу'], ['E · Q', 'душой: подобрать / вернуть осколок'], ['Enter · M', 'пауза · звук']];
    this.panel(VW / 2 - 250, y + 76, 500, lines.length * 25 + 22, .6);
    lines.forEach(([k, v], i) => { this.text(k, VW / 2 - 20, y + 104 + i * 25, 16, '#ffd98a', FONT_UI, 'right', 700); this.text(v, VW / 2 + 0, y + 104 + i * 25, 16, '#d5ddec', FONT_UI, 'left', 500) });
    const blink = .55 + .45 * Math.sin(t * 3.2);
    if (loadK < 1) this.text(`Загрузка… ${Math.round(loadK * 100)}%`, VW / 2, VH - 60, 22, '#9fb0c8', FONT_UI, 'center', 600);
    else { ctx.globalAlpha = blink; this.text('Enter — начать', VW / 2, VH - 56, 28, '#f3e7c4', FONT_TITLE, 'center', 700); ctx.globalAlpha = 1 }
  },
  pause() { this.overlay(.6); this.text('Пауза', VW / 2, VH / 2 - 20, 64, '#e8eefc', FONT_TITLE, 'center', 700); this.text('Enter — продолжить · M — звук', VW / 2, VH / 2 + 30, 22, '#b6c3db', FONT_UI, 'center', 500) },
  end(win, t) {
    this.overlay(.66); const G = Game, s = G.stats, tm = Math.floor(G.time);
    ctx.save(); ctx.shadowColor = win ? '#4fd6ff' : '#ff4a3a'; ctx.shadowBlur = 26; this.text(win ? 'Победа' : 'Поражение', VW / 2, 250, 84, win ? '#dff7ff' : '#ffd2cc', FONT_TITLE, 'center', 700); ctx.restore();
    this.text(win ? 'Каменные стражи повержены. Арена молчит.' : 'Арена забрала героя. Попробуй снова.', VW / 2, 296, 22, '#b6c3db', FONT_UI, 'center', 500);
    this.panel(VW / 2 - 210, 330, 420, 116, .6);
    [['Решено задач', `${s.solved} из ${s.tasks}`], ['Разбито конечностей', `${s.broken}`], ['Время', `${Math.floor(tm / 60)}:${String(tm % 60).padStart(2, '0')}`], ['Очки', `${G.score}`]].forEach(([k, v], i) => { this.text(k, VW / 2 - 190, 360 + i * 25, 18, '#aeb9cf', FONT_UI, 'left', 500); this.text(v, VW / 2 + 190, 360 + i * 25, 18, '#f0e6c8', FONT_UI, 'right', 700) });
    ctx.globalAlpha = .55 + .45 * Math.sin(t * 3.2); this.text('Enter — сыграть снова', VW / 2, VH - 70, 28, '#f3e7c4', FONT_TITLE, 'center', 700); ctx.globalAlpha = 1;
  },
};
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath() }
