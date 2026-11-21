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

// пока только пол и монолит: стены арены, реквизит и передний план отключены (вернуть — FLOOR_ONLY = false)
const FLOOR_ONLY = true;
const World = {
  props: [],
  t: 0,
  init() {
    const M = W.ARENA / 2;
    if (FLOOR_ONLY) { this.monolith = { kind: 'monolith', x: M, z: -.1, s: .9 }; this.props = [this.monolith]; return }
    if (ASSETS.props.monolith.base) {
      // арена v2: всё в камере пола, у каждого предмета своя тень на полу; s — масштаб к сохранённой картинке
      this.monolith = { kind: 'monolith', x: M, z: -.1, s: .9 };
      this.props = [
        { kind: 'column', x: 430, z: -.12, s: .84 }, { kind: 'chain', x: 760, z: -.1, s: .8 },
        { kind: 'brazier', x: M - 380, z: -.08, s: .66, fire: 1 }, this.monolith, { kind: 'brazier', x: M + 380, z: -.08, s: .66, fire: 1 },
        { kind: 'head', x: 2080, z: -.06, s: .57 }, { kind: 'column', x: W.ARENA - 420, z: -.13, s: .7, flip: 1 },
        { kind: 'rubble', x: 1000, z: 1.12, s: .62 }, { kind: 'rubble', x: 1980, z: 1.13, s: .52, flip: 1 },
      ];
    } else {
      this.monolith = { kind: 'monolith', x: M, z: -.1, s: 1.5 };
      this.props = [
        { kind: 'column', x: 500, z: -.12, s: .9 }, { kind: 'brazier', x: M - 520, z: -.1, s: .72, fire: 1 }, this.monolith,
        { kind: 'brazier', x: M + 520, z: -.1, s: .72, fire: 1 }, { kind: 'bust', x: W.ARENA - 430, z: -.12, s: .78 },
        { kind: 'column', x: W.ARENA - 760, z: -.13, s: .7 },
        { kind: 'rubble', x: 1130, z: 1.13, s: .75 }, { kind: 'rubble', x: 2330, z: 1.12, s: .62, flip: 1 }, { kind: 'bust', x: 300, z: 1.16, s: .55, flip: 1 },
      ];
    }
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
  // покадровое пламя в чашах на стене (едет вместе со средним планом); низ срезан по краю чаши
  wallFires(k, par, y, t) {
    const F = ASSETS.fire, I = IM.fire, w = IM.bg_mid.width * k; let o = ((-Cam.x * par) % w + w) % w; if (o > 0) o -= w;
    const fq = .5, bw = F.w * fq, bh = F.h * fq;
    for (let x = o; x < VW; x += w) for (const [fx, ry] of ASSETS.bg_mid.fires) {
      const X = x + fx * k, Y = y + ry * k; if (X < -60 || X > VW + 60) continue;
      const n = (Math.floor(t * F.fps + fx % F.n) % F.n + F.n) % F.n, cx = (n % F.cols) * F.w, cy = Math.floor(n / F.cols) * F.h, by = Y + (F.h - F.base) * fq + 3;
      ctx.save(); ctx.beginPath(); ctx.rect(X - bw, Y - bh * 1.2, bw * 2, bh * 1.2); ctx.clip(); ctx.imageSmoothingEnabled = false;
      ctx.drawImage(I, cx, cy, F.w, F.h, X - bw / 2, by - bh, bw, bh); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .2; ctx.drawImage(I, cx, cy, F.w, F.h, X - bw / 2, by - bh, bw, bh); ctx.restore();
    }
  },
  // фон без арены: тёмная пустота, пол уходит в туман; у краёв арены — темнота (враги выходят из неё)
  drawVoid(t) {
    const H0 = W.FLOOR_TOP + 40, g = ctx.createLinearGradient(0, 0, 0, H0); g.addColorStop(0, '#03050a'); g.addColorStop(.7, '#090e1a'); g.addColorStop(1, '#121b2e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, H0);
    // холодный свет сверху на середину арены (на монолит)
    const mx = sx(this.monolith.x), lg = ctx.createRadialGradient(mx, W.FLOOR_TOP - 40, 0, mx, W.FLOOR_TOP - 40, 620); lg.addColorStop(0, 'rgba(90,120,180,.16)'); lg.addColorStop(1, 'rgba(90,120,180,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, VW, W.FLOOR_TOP + 200);
    this.layer(IM.floor, .62, 1, W.FLOOR_TOP);
    // дальний край пола тонет в тумане
    const f = ctx.createLinearGradient(0, W.FLOOR_TOP - 2, 0, W.FLOOR_TOP + 110); f.addColorStop(0, 'rgba(14,21,36,1)'); f.addColorStop(.35, 'rgba(12,18,32,.6)'); f.addColorStop(1, 'rgba(10,15,28,0)');
    ctx.fillStyle = f; ctx.fillRect(0, W.FLOOR_TOP - 2, VW, 112);
    // края арены: темнота (градиент держит конечный цвет и за краем)
    for (const s of [-1, 1]) {
      const ex = sx(s < 0 ? W.GL - 120 : W.GR + 120), x0 = sx(s < 0 ? W.XMIN + 60 : W.XMAX - 60); if (s < 0 ? x0 < 0 : x0 > VW) continue;
      const e = ctx.createLinearGradient(x0, 0, ex, 0); e.addColorStop(0, 'rgba(3,5,10,0)'); e.addColorStop(1, 'rgba(3,5,10,.97)'); ctx.fillStyle = e;
      if (s < 0) ctx.fillRect(0, 0, x0, VH); else ctx.fillRect(x0, 0, VW - x0, VH);
    }
  },
  drawBack(t) {
    this.t = t;
    if (FLOOR_ONLY) return this.drawVoid(t);
    this.layer(IM.bg_far, .667, .2, -190);
    // у v2 основание стены (y = 650 из 1080) стоит ровно на дальнем крае пола
    const my = ASSETS.bg_mid.v2 ? W.FLOOR_TOP + 4 - 650 * .667 : W.FLOOR_TOP - 466;
    this.layer(IM.bg_mid, .667, .5, my);
    if (ASSETS.bg_mid.fires && IM.fire) this.wallFires(.667, .5, my, t);
    // ворота стоят в плоскости стены, но едут вместе с полом (они на краю арены)
    for (const s of [-1, 1]) { const img = s < 0 ? IM.gate_left : IM.gate_right, k = .52, w = img.width * k, h = img.height * k, x = sx(this.gateX(s)); if (x > -w && x < VW + w) ctx.drawImage(img, x - w / 2, W.FLOOR_TOP + 34 - h, w, h) }
    this.layer(IM.floor, .62, 1, W.FLOOR_TOP);
    // мягкая тень у основания стены
    const gr = ctx.createLinearGradient(0, W.FLOOR_TOP, 0, W.FLOOR_TOP + 60); gr.addColorStop(0, 'rgba(5,7,16,.55)'); gr.addColorStop(1, 'rgba(5,7,16,0)'); ctx.fillStyle = gr; ctx.fillRect(0, W.FLOOR_TOP, VW, 60);
  },
  drawFront() { if (!FLOOR_ONLY) this.layer(IM.fg, .667, 1.3, VH - 280 + 46, .95) },
  // искры жаровен — в шаге симуляции (их число не зависит от частоты кадров экрана)
  update(dt) { for (const p of this.props) if (p.fire && Math.random() < dt * 15) { const k = p.s * zs(p.z), h = IM.props[p.kind].height * k, A = ASSETS.props[p.kind]; FX.ember(p.x + rnd(-10, 10), p.z, A.base ? h * (A.base - .2) + 10 : h * .92 + 20) } },
  // свет жаровен на полу и стене
  drawLights(t) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const p of this.props) if (p.fire) { const x = sx(p.x), y = zy(p.z) - 120 * p.s; if (x < -300 || x > VW + 300) continue; const f = .9 + .07 * Math.sin(t * 3.1 + p.x) + .03 * Math.sin(t * 7.7 + p.x * .3); const r = 260 * f, gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(70,150,255,.20)'); gr.addColorStop(1, 'rgba(40,90,255,0)'); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, 2 * r, 2 * r) }
    ctx.restore();
  },
  propDrawables(list) {
    for (const p of this.props) list.push({ z: p.z, draw: () => this.drawProp(p), shadow: IM.props[p.kind + '_sh'] ? () => this.drawPropShadow(p) : null });
  },
  // тень предмета на полу — в общем проходе теней, под персонажами
  drawPropShadow(p) { const img = IM.props[p.kind + '_sh'], A = ASSETS.props[p.kind], k = p.s * zs(p.z), w = img.width * k, h = img.height * k, x = sx(p.x), y = zy(p.z);
    if (x < -w || x > VW + w) return; ctx.save(); ctx.translate(x, y); if (p.flip) ctx.scale(-1, 1); ctx.drawImage(img, -w / 2, -h * A.base, w, h); ctx.restore() },
  drawProp(p) {
    const img = IM.props[p.kind], A = ASSETS.props[p.kind], k = p.s * zs(p.z), w = img.width * k, h = img.height * k, x = sx(p.x), y = zy(p.z), bo = A.base || 1;
    if (x < -w || x > VW + w) return;
    ctx.save(); ctx.translate(x, y); if (p.flip) ctx.scale(-1, 1); ctx.drawImage(img, -w / 2, -h * bo, w, h); ctx.restore();
    if (p.fire) { // пламя жаровни: живое, с подрагиванием и искрами
      const fi = IM.props.flame, t = this.t, fk = k * (A.base ? .55 : .9), fw = fi.width * fk, fh = fi.height * fk, top = A.base ? y - h * (A.base - .21) : y - h * .92;
      const F = ASSETS.fire, I = IM.fire;
      if (F && I) { // покадровое пламя (48 кадров, цикл 2 с): три языка с разной фазой заполняют чашу; низ прячется за передним бортом
        const it = y - h * bo, ph = p.x * 7.3, base = it + .30 * h, q0 = 1.34 * k;
        ctx.save(); ctx.beginPath(); ctx.rect(x - w, it - h * 2, w * 2, h * 2 + .229 * h); ctx.ellipse(x, it + .229 * h, .37 * w, .085 * h, 0, 0, TAU); ctx.clip(); ctx.imageSmoothingEnabled = false;
        for (const [dx, sk, o] of [[-.16, .72, 17], [.17, .78, 31], [0, 1, 0]]) {
          const q = q0 * sk, n = (Math.floor(t * F.fps + ph + o) % F.n + F.n) % F.n, cx = (n % F.cols) * F.w, cy = Math.floor(n / F.cols) * F.h, bw = F.w * q, bh = F.h * q, by = base + (F.h - F.base) * q, X = x + dx * w;
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(I, cx, cy, F.w, F.h, X - bw / 2, by - bh, bw, bh);
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .2; ctx.drawImage(I, cx, cy, F.w, F.h, X - bw / 2, by - bh, bw, bh);
        }
        ctx.restore();
      } else {
        const sy = 1 + .1 * Math.sin(t * 11 + p.x) + .05 * Math.sin(t * 27), sxk = 1 + .05 * Math.sin(t * 7 + 1);
        ctx.save(); ctx.translate(x, top + fh * .2); ctx.scale(sxk, sy); ctx.globalAlpha = .95; ctx.drawImage(fi, -fw / 2, -fh, fw, fh); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .25 + .1 * Math.sin(t * 13); ctx.drawImage(fi, -fw / 2, -fh, fw, fh); ctx.restore();
      }
    }
    if (p === this.monolith && Soul.drawMonolith) Soul.drawMonolith(p, x, y, w, h, k);
  },
};
