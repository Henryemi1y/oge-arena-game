// core.js — общие функции, константы мира, ввод.
const TAU = Math.PI * 2, PI = Math.PI;
const cl = (v, a, b) => Math.max(a, Math.min(b, v)), lp = (a, b, t) => a + (b - a) * t, sm = x => { x = cl(x, 0, 1); return x * x * (3 - 2 * x) }, fr = x => ((x % 1) + 1) % 1;
const rnd = (a, b) => a + Math.random() * (b - a), irnd = (a, b) => Math.floor(rnd(a, b + 1)), pick = a => a[(Math.random() * a.length) | 0];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]] } return a };
const angOf = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]), dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const rot2 = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > PI) d -= TAU; if (d < -PI) d += TAU; return d };
const VW = 1280, VH = 720, DT = 1 / 60;

// Мир: x — пиксели арены (ортографически), z ∈ [0,1] — глубина полосы пола (0 — у стены, 1 — у зрителя).
// арена — чуть больше двух экранов: от ворот до героя враги доходят за секунды, а не за четверть минуты
const W = { ARENA: 2800, FLOOR_TOP: 430, FAR_Y: 476, NEAR_Y: 692, CS: .165, GL: 170, GR: 2800 - 170 };
W.XMIN = W.GL + 80; W.XMAX = W.GR - 80;
const zy = z => lp(W.FAR_Y, W.NEAR_Y, z), zs = z => lp(.84, 1, z), ZPX = W.NEAR_Y - W.FAR_Y;

// расстояние в плоскости пола (z переводится в пиксели экрана)
const fdist = (x1, z1, x2, z2) => Math.hypot(x2 - x1, (z2 - z1) * ZPX);

// ---------- ввод ----------
const Input = {
  k: {}, p: {}, mouseDown: 0, enabled: true,
  down(c) { return !!this.k[c] },
  hit(c) { const v = this.p[c]; this.p[c] = 0; return !!v },
  clearPresses() { this.p = {} },
  axis() { const k = this.k; return { x: (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0), z: (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0), run: !!(k.ShiftLeft || k.ShiftRight) } },
};
addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Tab'].includes(e.code)) e.preventDefault();
  Input.k[e.code] = 1; if (!e.repeat) Input.p[e.code] = 1;
});
addEventListener('keyup', e => { Input.k[e.code] = 0 });
addEventListener('blur', () => { Input.k = {} });
