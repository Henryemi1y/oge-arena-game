// world.js — арена 2,5D: слои параллакса, ворота, реквизит, камера.
const Cam = {
  x: 0, shake: 0, ox: 0, oy: 0, lead: 0,
  update(dt, tx, face) {
    this.lead = lp(this.lead, (face || 0) * 110, 1 - Math.exp(-dt * 1.4));
    const want = cl(tx - VW / 2 + this.lead, 0, W.ARENA - VW); this.x = lp(this.x, want, 1 - Math.exp(-dt * 4.5));
    this.shake *= Math.exp(-dt * 6.5); this.ox = (Math.random() - .5) * this.shake; this.oy = (Math.random() - .5) * this.shake * 1.25;
  },
  snap(tx) { this.x = cl(tx - VW / 2, 0, W.ARENA - VW) },
  kick(a) { this.shake = Math.max(this.shake, a) },
};
const sx = x => x - Cam.x;

const World = {
  props: [],
  t: 0,
  init() {
    const M = W.ARENA / 2;
    this.monolith = { kind: 'monolith', x: M, z: -.1, s: 1.25 };
    this.props = [
      { kind: 'column', x: 560, z: -.12, s: .9 }, { kind: 'brazier', x: 1020, z: -.07, s: .72, fire: 1 }, this.monolith,
      { kind: 'brazier', x: W.ARENA - 1020, z: -.07, s: .72, fire: 1 }, { kind: 'bust', x: W.ARENA - 600, z: -.12, s: .78 },
      { kind: 'column', x: 2240, z: -.13, s: .7 },
      { kind: 'rubble', x: 1380, z: 1.13, s: .75 }, { kind: 'rubble', x: 2780, z: 1.12, s: .62, flip: 1 }, { kind: 'bust', x: 300, z: 1.16, s: .55, flip: 1 },
    ];
  },
  // ворота — по краям арены, у стены
  gateX: side => side < 0 ? W.GL : W.GR,
  // слои заранее масштабируются под размер экрана (рисовать без масштабирования в разы дешевле)
  cache: {}, cacheK: 0,
  scaled(img, k) {
    const dk = Math.min(Game.k || 1, 2); if (this.cacheK !== dk) { this.cache = {}; this.cacheK = dk }
    const key = img.src ? img.src.length + ':' + img.width + ':' + k : (img.__id || (img.__id = Math.random())) + ':' + k;
    let c = this.cache[key]; if (!c) { c = mkCanvas(img.width * k * dk, img.height * k * dk); const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, c.width, c.height); c.lw = img.width * k; c.lh = img.height * k; this.cache[key] = c } return c;
  },
  layer(img, k, par, y, alpha = 1) {
    const c = this.scaled(img, k), w = c.lw, h = c.lh; let o = ((-Cam.x * par) % w + w) % w; if (o > 0) o -= w;
    if (alpha < 1) ctx.globalAlpha = alpha;
    for (let x = o; x < VW; x += w) ctx.drawImage(c, Math.floor(x), y, Math.ceil(w) + 1, h);
    ctx.globalAlpha = 1;
  },
  drawBack(t) {
    this.t = t;
    this.layer(IM.bg_far, .667, .2, -190);
    this.layer(IM.bg_mid, .667, .6, W.FLOOR_TOP - 466);
    // ворота стоят в плоскости стены, но едут вместе с полом (они на краю арены)
    for (const s of [-1, 1]) { const img = s < 0 ? IM.gate_left : IM.gate_right, k = .52, w = img.width * k, h = img.height * k, x = sx(this.gateX(s)); if (x > -w && x < VW + w) ctx.drawImage(img, x - w / 2, W.FLOOR_TOP + 34 - h, w, h) }
    this.layer(IM.floor, .62, 1, W.FLOOR_TOP);
    // мягкая тень у основания стены
    const gr = ctx.createLinearGradient(0, W.FLOOR_TOP, 0, W.FLOOR_TOP + 60); gr.addColorStop(0, 'rgba(5,7,16,.55)'); gr.addColorStop(1, 'rgba(5,7,16,0)'); ctx.fillStyle = gr; ctx.fillRect(0, W.FLOOR_TOP, VW, 60);
  },
  drawFront() { this.layer(IM.fg, .667, 1.25, VH - 280 + 46, .95) },
  // свет жаровен на полу и стене
  drawLights(t) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const p of this.props) if (p.fire) { const x = sx(p.x), y = zy(p.z) - 120 * p.s; if (x < -300 || x > VW + 300) continue; const f = .85 + .15 * Math.sin(t * 9 + p.x) + .06 * Math.sin(t * 23); const r = 260 * f, gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(70,150,255,.20)'); gr.addColorStop(1, 'rgba(40,90,255,0)'); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, 2 * r, 2 * r) }
    ctx.restore();
  },
  propDrawables(list) {
    for (const p of this.props) list.push({ z: p.z, draw: () => this.drawProp(p) });
  },
  drawProp(p) {
    const img = IM.props[p.kind], k = p.s * zs(p.z), w = img.width * k, h = img.height * k, x = sx(p.x), y = zy(p.z);
    if (x < -w || x > VW + w) return;
    ctx.save(); ctx.translate(x, y); if (p.flip) ctx.scale(-1, 1); ctx.drawImage(img, -w / 2, -h, w, h); ctx.restore();
    if (p.fire) { // пламя жаровни: живое, с подрагиванием и искрами
      const fi = IM.props.flame, t = this.t, fk = k * .9, fw = fi.width * fk, fh = fi.height * fk, top = y - h * .92;
      const sy = 1 + .1 * Math.sin(t * 11 + p.x) + .05 * Math.sin(t * 27), sxk = 1 + .05 * Math.sin(t * 7 + 1);
      ctx.save(); ctx.translate(x, top + fh * .2); ctx.scale(sxk, sy); ctx.globalAlpha = .95; ctx.drawImage(fi, -fw / 2, -fh, fw, fh); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .25 + .1 * Math.sin(t * 13); ctx.drawImage(fi, -fw / 2, -fh, fw, fh); ctx.restore();
      if (Math.random() < .25) FX.ember(p.x + rnd(-10, 10), p.z, (y - top) + fh * .4);
    }
    if (p === this.monolith && Soul.drawMonolith) Soul.drawMonolith(p, x, y, w, h, k);
  },
};
