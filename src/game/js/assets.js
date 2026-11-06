// assets.js — загрузка встроенных картинок (ASSETS собирается tools/build_game.py) и производные: затемнённые дальние детали.
const IM = { props: {}, shards: [], cracks: [], eye: {}, soul: {}, ch: {} };
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c };
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('img')); i.src = src }) }
// затемнение дальних деталей (без ctx.filter — он есть не во всех браузерах)
function darken(img, a = .3, col = '2,4,14') { const c = mkCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = `rgba(${col},${a})`; x.fillRect(0, 0, c.width, c.height); return c }
// белый силуэт для вспышки попадания
function whiten(img) { const c = mkCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); return c }
async function loadAssets(onProgress) {
  const jobs = []; let done = 0, total = 0;
  const add = (src, put) => { total++; jobs.push(loadImg(src).then(i => { put(i); done++; onProgress && onProgress(done / total) })) };
  for (const k of ['bg_far', 'bg_mid', 'floor', 'fg', 'gate_left', 'gate_right']) add(ASSETS[k].src, i => IM[k] = i);
  for (const k in ASSETS.props) add(ASSETS.props[k].src, i => IM.props[k] = i);
  ASSETS.shards.forEach((s, n) => add(s.src, i => IM.shards[n] = i));
  ASSETS.cracks.forEach((s, n) => add(s.src, i => IM.cracks[n] = i));
  add(ASSETS.dust.src, i => IM.dust = i);
  for (const k in ASSETS.eye) add(ASSETS.eye[k].src, i => IM.eye[k] = i);
  for (const k in ASSETS.soul) if (k !== '_k') add(ASSETS.soul[k].src, i => IM.soul[k] = i);
  for (const id in ASSETS.ch) { IM.ch[id] = {}; for (const p in ASSETS.ch[id]) if (p !== '_k') add(ASSETS.ch[id][p].src, i => IM.ch[id][p] = i) }
  await Promise.all(jobs);
  // пол: выгравированные на плитах цифры светятся тем же голубым, что и осколки, — гасим свечение (остаётся резьба),
  // чтобы светились только осколки с ответом
  try {
    const f = IM.floor, c = mkCanvas(f.width, f.height), x = c.getContext('2d'); x.drawImage(f, 0, 0); const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) { const r = p[i], g = p[i + 1], b = p[i + 2], t = cl((b - r - 30) / 55, 0, 1) * cl((b - 95) / 60, 0, 1); if (t > 0) { const gr = (r + g + b) / 3 * .5, k = t * .95; p[i] = lp(r, gr * .92, k); p[i + 1] = lp(g, gr * .97, k); p[i + 2] = lp(b, gr * 1.1, k) } }
    x.putImageData(d, 0, 0); IM.floor = c;
  } catch (e) { }
  for (const id in IM.ch) {
    const C = IM.ch[id];
    for (const p of Object.keys(C)) { if (/F$/.test(p) && p !== 'clothF') C[p + 'D'] = darken(C[p], .3); C[p + 'W'] = whiten(C[p]) }
  }
  IM.soul.glow = (() => { const c = mkCanvas(256, 256), x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(140,240,255,.55)'); gr.addColorStop(.4, 'rgba(90,200,240,.18)'); gr.addColorStop(1, 'rgba(60,160,220,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); return c })();
}
