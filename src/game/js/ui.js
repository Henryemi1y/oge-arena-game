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
    { const Hh = Hero.H, par = Hh.parT > 0; if (!Hh.soul && (par || Hh.blkT > 0)) { const a = Math.min(1, (par ? Hh.parT : Hh.blkT) * 2.5), y = zy(Hh.z) - Hero.height() - 30 - (1 - a) * 18; ctx.globalAlpha = a; this.text(par ? 'Отбито!' : 'Блок', sx(Hh.x), y, par ? 26 : 20, par ? '#ffe09a' : '#d8c8b0', FONT_TITLE, 'center', 700); ctx.globalAlpha = 1 } }
    const H = Hero.H, G = Game;
    // здоровье
    this.panel(16, 14, 300, 56); this.text('Здоровье', 28, 36, 18, '#aeb9cf'); this.text(`${Math.ceil(H.hp)}`, 304, 36, 18, '#f1d7d2', FONT_UI, 'right');
    this.bar(28, 45, 276, 14, H.hp / H.maxhp, '#e0574a', '#8e2420'); if (G.healFx > 0) { ctx.globalAlpha = G.healFx; this.text(`+${G.healAmt}`, 320, 54, 18, '#9dffb8', FONT_UI, 'left', 700); ctx.globalAlpha = 1 }
    // очки и решённые задачи
    this.panel(VW - 246, 14, 230, G.stats.tasks ? 58 : 36); this.text(`Очки: ${G.score}`, VW - 234, 38, 19, '#e6d9b8'); if (G.stats.tasks) this.text(`Решено: ${G.stats.solved} из ${G.stats.tasks}`, VW - 234, 62, 17, '#9fd8f0');
    this.text(Snd.muted ? 'M — звук выкл' : 'M — звук', VW - 28, 36, 13, '#7f8aa0', FONT_UI, 'right', 500);
    // волна или босс
    const B = Boss.b;
    if (B && B.st !== 'dying') {
      const w = 540, x = VW / 2 - w / 2; this.panel(x, 12, w, 74); this.text(DRESS[B.id].name, VW / 2, 35, 21, '#e9e2d0', FONT_TITLE, 'center', 700);
      LIMBS.forEach((l, i) => { const lm = B.limbs[l], bx = x + 14 + i * 130, k = lm.alive ? lm.hp / lm.max : 0; this.text(LIMB_NAME[l], bx, 56, 15, lm.alive ? '#b9c3d6' : '#5f6779', FONT_UI, 'left', 500);
        this.bar(bx, 63, 116, 10, k, lm.regrow > 0 ? '#ffb27a' : '#9fb3cf', lm.regrow > 0 ? '#a0522d' : '#56657d'); if (!lm.alive) { ctx.strokeStyle = '#7ad6ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + 2, 68); ctx.lineTo(bx + 114, 68); ctx.stroke() } });
    } else if (G.phase && G.phase.type === 'wave' && !Soul.on) { const n = Enemies.alive() + G.queue.length; if (n) { this.panel(VW / 2 - 130, 12, 260, 40); this.text(`${G.phase.name} · врагов: ${n}`, VW / 2, 39, 19, '#e6e0cf', FONT_TITLE, 'center', 700) } }
    // форма души: табличка с уравнением
    if (Soul.on && Soul.prob) this.soulTablet();
    // подсказка управления в начале
    if (this.helpT < 16 && !Soul.on) { const a = Math.min(1, (16 - this.helpT) / 2); ctx.globalAlpha = a; this.panel(16, VH - 70, 680, 54, .62);
      this.text('A/D — шаг · Shift — бег · W/S — вглубь/ближе · Space — рывок', 28, VH - 47, 16, '#c9d3e6', FONT_UI, 'left', 500); this.text('ЛКМ — серия ударов · J/K/L — удары · F/ПКМ — парировать · Enter — пауза', 28, VH - 25, 16, '#c9d3e6', FONT_UI, 'left', 500); ctx.globalAlpha = 1 }
    // баннеры
    for (const b of this.banners) { const k = b.t / b.life, a = Math.min(1, b.t * 4) * Math.min(1, (b.life - b.t) * 2.5), so = Soul.on && this.tabB, y = (so ? this.tabB + 44 : VH * .34) - 10 * k, bxc = so ? this.tabX : VW / 2; ctx.globalAlpha = a; this.text(b.text, bxc, y, so ? 34 : 52, b.col, FONT_TITLE, 'center', 700); if (b.sub) this.text(b.sub, bxc, y + (so ? 28 : 36), so ? 17 : 21, '#c2cde2', FONT_UI, 'center', 500); ctx.globalAlpha = 1 }
  },
  soulTablet() {
    // табличка уходит в сторону от босса, чтобы не закрывать ему голову
    const S = Soul, w = 470, h = 124, B = Boss.b, bx = B && !B.gone ? sx(B.x) : null, want = bx == null || bx < -200 || bx > VW + 200 ? VW / 2 : bx > VW / 2 ? 290 : VW - 290;
    this.tabX = this.tabX == null ? want : lp(this.tabX, want, .08); const cx = this.tabX, x = cx - w / 2, y = Boss.b ? 94 : 60; this.tabB = y + h;
    ctx.save(); rr(x, y, w, h, 10); ctx.fillStyle = this.pat(); ctx.fill(); ctx.fillStyle = 'rgba(8,12,24,.84)'; ctx.fill(); ctx.strokeStyle = 'rgba(120,200,255,.55)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    this.text(S.prob.c, x + 16, y + 24, 16, '#8fcbe6', FONT_UI, 'left', 600);
    // уравнение: дроби — столбиком, как в бланке ОГЭ
    ctx.save(); ctx.shadowColor = '#3fa9ff'; ctx.shadowBlur = 10; mathText(S.prob.t, cx, y + 60, 26, '#dcf6ff', 'center', w - 40); ctx.restore();
    // ячейки ответа
    const n = S.slots, cw = 34, x0 = cx - n * cw / 2, cy = y + 104, full = S.full();
    for (let i = 0; i < n; i++) { ctx.strokeStyle = S.confirm > 0 && i < S.placed.length ? 'rgba(255,217,138,.95)' : full ? 'rgba(160,255,200,.8)' : 'rgba(140,220,255,.55)'; ctx.lineWidth = 1.5; ctx.strokeRect(x0 + i * cw + 3, cy - 14, cw - 6, 28); const s = S.placed[i]; if (s) Soul.drawShardAt(s, x0 + i * cw + cw / 2, cy, .42) }
    // время души
    const k = S.T / S.TMAX; this.bar(x + w - 124, y + 14, 108, 8, k, k > .3 ? '#7fe3ff' : '#ff9a7a', k > .3 ? '#2c8fbf' : '#b0402a'); this.text(`${Math.ceil(S.T)} с`, x + w - 16, y + 39, 15, S.T < 10 ? '#ffb59a' : '#a9d9ee', FONT_UI, 'right', 600);
    // в руках: первая цифра ляжет следующей
    if (S.carried.length) { this.text('В руках:', x + 16, y + 110, 15, '#9fb8cc', FONT_UI, 'left', 500); S.carried.forEach((s, i) => { if (!i) { ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = 2; ctx.strokeRect(x + 84 + i * 30, y + 92, 26, 26) } Soul.drawShardAt(s, x + 97 + i * 30, y + 105, .34) }) }
    // подсказка внизу — по состоянию
    const at = S.atMonolith(), near = S.nearShard(), nx = S.carried[0] ? `«${S.carried[0].d}»` : '';
    const ans = S.placed.map(s => s.d).join('');
    const tip = S.ph !== 'free' ? '' : at && S.confirm > 0 ? `E — да, проверить «${ans}» · Q — забрать последнюю цифру`
      : at && full ? 'Ячейки заполнены: E — проверить · Q — забрать последнюю цифру'
      : at && S.carried.length ? `E — положить ${nx} в следующую ячейку · R — поменять порядок · Q — забрать последнюю`
      : at && S.placed.length ? 'E — проверить ответ · Q — забрать последнюю · или принеси ещё цифры'
      : near && S.carried.length < 3 ? `E — подобрать «${near.d}»` : S.carried.length >= 3 ? 'Руки заняты — неси цифры к монолиту (Q — бросить последнюю)'
      : 'Собери цифры ответа и неси к монолиту в центре арены';
    if (tip) { const tw = Math.min(VW - 40, 720); this.panel(VW / 2 - tw / 2, VH - 58, tw, 40, .74); this.text(tip, VW / 2, VH - 31, 18, S.hint > 0 ? '#ffd27a' : '#cfe9f6', FONT_UI, 'center', 600) }
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
    this.text('Разбей каменных стражей. Собери ответ из осколков.', VW / 2, y + 46, 22, '#b6c3db', FONT_UI, 'center', 500);
    this.controls(y + 70);
    // сложность
    const D = [['Обычная', 'полный урон · 95 с на ответ'], ['Лёгкая', 'урон вдвое меньше · 130 с']], by = VH - 128;
    D.forEach(([n, d], i) => { const sel = Game.diff === i, x = VW / 2 - 250 + i * 260; this.panel(x, by, 240, 54, sel ? .85 : .45); if (sel) { ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = 2; rr(x, by, 240, 54, 6); ctx.stroke() } this.text(n, x + 120, by + 24, 20, sel ? '#ffe7b0' : '#9aa6bb', FONT_TITLE, 'center', 700); this.text(d, x + 120, by + 44, 13, sel ? '#cfd8e8' : '#7d889c', FONT_UI, 'center', 500) });
    if (loadK < 1) this.text(`Загрузка… ${Math.round(loadK * 100)}%`, VW / 2, VH - 30, 22, '#9fb0c8', FONT_UI, 'center', 600);
    else { ctx.globalAlpha = .55 + .45 * Math.sin(t * 3.2); this.text('← / → — сложность · Enter — начать', VW / 2, VH - 32, 24, '#f3e7c4', FONT_TITLE, 'center', 700); ctx.globalAlpha = 1 }
  },
  controls(y) {
    const lines = [['A / D, ← / →', 'шаг влево и вправо'], ['Shift', 'бег'], ['W / S, ↑ / ↓', 'вглубь и ближе'], ['Space', 'рывок (уворот)'], ['ЛКМ', 'серия из трёх ударов'], ['J / K / L', 'удар сверху, вбок, снизу'], ['F · ПКМ', 'парировать (точно в момент удара)'], ['E · Q · R', 'душой: подобрать / вернуть / порядок'], ['Enter · M · − / +', 'пауза · звук · громкость']];
    this.panel(VW / 2 - 270, y, 540, lines.length * 25 + 20, .6);
    lines.forEach(([k, v], i) => { this.text(k, VW / 2 - 16, y + 28 + i * 25, 17, '#ffd98a', FONT_UI, 'right', 700); this.text(v, VW / 2 + 4, y + 28 + i * 25, 17, '#d5ddec', FONT_UI, 'left', 500) });
  },
  pause() { this.overlay(.62); this.text('Пауза', VW / 2, 170, 64, '#e8eefc', FONT_TITLE, 'center', 700); this.controls(200); this.text('Enter — продолжить', VW / 2, VH - 60, 24, '#f3e7c4', FONT_TITLE, 'center', 700); this.text(`Громкость: ${Math.round(Snd.vol * 100)}%`, VW / 2, VH - 30, 16, '#9aa6bb', FONT_UI, 'center', 500) },
  end(win, t) {
    this.overlay(.68); const G = Game, s = G.stats, tm = Math.floor(G.time);
    ctx.save(); ctx.shadowColor = win ? '#4fd6ff' : '#ff4a3a'; ctx.shadowBlur = 26; this.text(win ? 'Победа' : 'Поражение', VW / 2, 150, 84, win ? '#dff7ff' : '#ffd2cc', FONT_TITLE, 'center', 700); ctx.restore();
    this.text(win ? 'Страж и палач повержены. Арена молчит.' : 'Арена забрала героя. Этап можно пройти заново.', VW / 2, 194, 22, '#b6c3db', FONT_UI, 'center', 500);
    this.panel(VW / 2 - 440, 222, 400, 128, .6);
    [['Решено задач', `${s.solved} из ${s.tasks}`], ['Разбито конечностей', `${s.broken}`], ['Отбито ударов', `${s.parries || 0}`], ['Время', `${Math.floor(tm / 60)}:${String(tm % 60).padStart(2, '0')}`], ['Очки', `${G.score}`]].forEach(([k, v], i) => { this.text(k, VW / 2 - 420, 254 + i * 26, 18, '#aeb9cf', FONT_UI, 'left', 500); this.text(v, VW / 2 - 60, 254 + i * 26, 18, '#f0e6c8', FONT_UI, 'right', 700) });
    // темы: что получилось, что повторить
    const tp = Object.entries(s.topics || {}); this.panel(VW / 2 + 20, 222, 420, Math.max(128, 44 + tp.length * 24), .6); this.text('Темы', VW / 2 + 40, 250, 18, '#d8e2f2', FONT_TITLE, 'left', 700);
    if (!tp.length) this.text('Задач пока не было', VW / 2 + 40, 278, 16, '#8a97ad', FONT_UI, 'left', 500);
    tp.forEach(([k, v], i) => { const good = v.ok === v.n; this.text(k, VW / 2 + 40, 278 + i * 24, 16, '#c3cde0', FONT_UI, 'left', 500); this.text(`${v.ok} из ${v.n}`, VW / 2 + 420, 278 + i * 24, 16, good ? '#9dffb8' : '#ffb39a', FONT_UI, 'right', 700) });
    const weak = tp.filter(([k, v]) => v.ok < v.n).map(([k]) => k); if (weak.length) this.text('Повторить: ' + weak.slice(0, 3).join(', '), VW / 2, VH - 112, 18, '#ffcfae', FONT_UI, 'center', 600);
    ctx.globalAlpha = .55 + .45 * Math.sin(t * 3.2);
    if (win) this.text('Enter — сыграть снова', VW / 2, VH - 62, 28, '#f3e7c4', FONT_TITLE, 'center', 700);
    else { this.text('Enter — заново с этого этапа', VW / 2, VH - 70, 28, '#f3e7c4', FONT_TITLE, 'center', 700); ctx.globalAlpha = 1; this.text('N — новая игра', VW / 2, VH - 38, 18, '#aeb9cf', FONT_UI, 'center', 600) }
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
