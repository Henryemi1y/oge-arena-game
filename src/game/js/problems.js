// problems.js — задачи в стиле ОГЭ (9 класс). Ответ — целое число (может быть отрицательным), набирается осколками-цифрами.
// У каждой задачи: t — условие, c — что найти, a — ответ, k — тема, s — краткий разбор (показывается после ошибки).
// Запись: дробь — «a/b» без пробелов (табличка рисует её столбиком), минус — «−», умножение — «·», деление — «:».
const Problems = (() => {
  const M = '−';
  const num = n => (n < 0 ? M + Math.abs(n) : '' + n);
  const par = n => (n < 0 ? `(${num(n)})` : '' + n);
  const sgn = n => (n < 0 ? ' ' + M + ' ' + Math.abs(n) : ' + ' + n);
  const kx = (k, v = 'x') => (k === 1 ? v : k === -1 ? M + v : num(k) + v);
  const SUP = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷' };
  const SUB = n => [...String(n)].map(c => '₀₁₂₃₄₅₆₇₈₉'[+c]).join('');
  const nz = (a, b) => { let v; do v = irnd(a, b); while (v === 0); return v };
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a), lcm = (a, b) => a / gcd(a, b) * b;
  const coprime = d => { let n; do n = irnd(1, d - 1); while (gcd(n, d) !== 1); return n };
  const dec = (n, d = 10) => (n / d).toFixed(String(d).length - 1).replace('.', ',');
  const T = {
    linear() { const a = irnd(2, 9), x = irnd(-6, 12), b = nz(-20, 20), c = a * x + b; return { t: `${kx(a)}${sgn(b)} = ${num(c)}`, c: 'Найдите x', a: x, k: 'Линейные уравнения', s: `${a}x = ${num(c)} ${b > 0 ? M : '+'} ${Math.abs(b)} = ${num(c - b)}  →  x = ${num(c - b)} : ${a} = ${num(x)}` } },
    linear2() { let a, c; do { a = irnd(2, 7); c = irnd(1, 6) } while (a === c); const x = irnd(-5, 10), b = nz(-6, 6), d = a * (x + b) - c * x; if (!d) return T.linear2(); return { t: `${a}(x${sgn(b)}) = ${kx(c)}${sgn(d)}`, c: 'Найдите x', a: x, k: 'Линейные уравнения', s: `${a}x${sgn(a * b)} = ${kx(c)}${sgn(d)}  →  ${kx(a - c)} = ${num(d - a * b)}` + (a - c === 1 ? '' : `  →  x = ${num(x)}`) } },
    linear3() { const x = irnd(-8, 12), a = irnd(2, 6), b = irnd(1, 9); if (x === b) return T.linear3(); return { t: `${a}(x${sgn(-b)}) = ${num(a * (x - b))}`, c: 'Найдите x', a: x, k: 'Линейные уравнения', s: `x ${M} ${b} = ${num(a * (x - b))} : ${a} = ${num(x - b)}  →  x = ${num(x)}` } },
    fracLinear() { const a = irnd(2, 6), q = nz(-4, 8), x = a * q, b = nz(-9, 9); return { t: `x/${a}${sgn(b)} = ${num(q + b)}`, c: 'Найдите x', a: x, k: 'Уравнения с дробями', s: `x/${a} = ${num(q + b)} ${b > 0 ? M : '+'} ${Math.abs(b)} = ${num(q)}  →  x = ${a} · ${par(q)} = ${num(x)}` } },
    proportion() { const x = irnd(2, 12), k = irnd(2, 5), b = irnd(2, 9); if (gcd(x, b) !== 1) return T.proportion(); return { t: `x/${b} = ${x * k}/${b * k}`, c: 'Найдите x', a: x, k: 'Пропорции', s: `x = ${b} · ${x * k} : ${b * k} = ${x}` } },
    quadBig() { return quad(true) }, quadSmall() { return quad(false) },
    quadPure() { const n = irnd(2, 13), neg = Math.random() < .5; return { t: `x² = ${n * n}`, c: neg ? 'Отрицательный корень' : 'Положительный корень', a: neg ? -n : n, k: 'Квадратные уравнения', s: `x = ±√${n * n} = ±${n}` } },
    percent() { const p = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), base = 100 / gcd(p, 100), N = base * irnd(1, Math.max(1, Math.floor(400 / base))); return { t: `${p}% от ${N}`, c: 'Вычислите', a: N * p / 100, k: 'Проценты', s: `${N} · ${p} : 100 = ${N * p / 100}` } },
    discount() { const p = pick([10, 20, 25, 30, 40, 50]), N = (100 / gcd(p, 100)) * irnd(2, 20), d = N * p / 100; return { t: `${N} ₽, скидка ${p}%`, c: 'Цена со скидкой, ₽', a: N - d, k: 'Проценты', s: `скидка: ${N} · ${p} : 100 = ${d};  ${N} ${M} ${d} = ${N - d}` } },
    powers() { const a = irnd(2, 3), m = a === 2 ? irnd(3, 6) : irnd(2, 4), b = irnd(2, 5), n = b <= 3 ? irnd(2, 3) : 2; if (a === b) return T.powers(); return { t: `${a}${SUP[m]} ${M} ${b}${SUP[n]}`, c: 'Вычислите', a: a ** m - b ** n, k: 'Степени', s: `${a ** m} ${M} ${b ** n} = ${num(a ** m - b ** n)}` } },
    negPow() { const b = irnd(2, 4), n = irnd(2, 3), c = nz(-15, 20), v = (-b) ** n; return { t: `(${M}${b})${SUP[n]}${sgn(c)}`, c: 'Вычислите', a: v + c, k: 'Степени', s: `(${M}${b})${SUP[n]} = ${num(v)};  ${num(v)}${sgn(c)} = ${num(v + c)}` } },
    powRule() { const a = pick([2, 3]), m = irnd(3, a === 2 ? 6 : 4), n = irnd(2, 3), q = irnd(2, 3), r = m + n - q; if (q === n || q === m) return T.powRule(); return { t: `${a}${SUP[m]} · ${a}${SUP[n]} : ${a}${SUP[q]}`, c: 'Вычислите', a: a ** r, k: 'Степени', s: `${a}${SUP[m]}⁺${SUP[n]}⁻${SUP[q]} = ${a}${SUP[r] || '^' + r} = ${a ** r}` } },
    roots() { const a = irnd(4, 15), b = irnd(2, 9); if (a === b) return T.roots(); return { t: `√${a * a} ${M} √${b * b}`, c: 'Вычислите', a: a - b, k: 'Корни', s: `${a} ${M} ${b} = ${num(a - b)}` } },
    roots2() { const a = irnd(2, 6), b = irnd(2, 6); return { t: `√(${a * a} · ${b * b})`, c: 'Вычислите', a: a * b, k: 'Корни', s: `√${a * a} · √${b * b} = ${a} · ${b} = ${a * b}` } },
    roots3() { const s = pick([2, 3, 5, 6, 7, 10, 11, 13]), b = irnd(2, 9); return { t: `(√${s})² + √${b * b}`, c: 'Вычислите', a: s + b, k: 'Корни', s: `(√${s})² = ${s},  √${b * b} = ${b};  ${s} + ${b} = ${s + b}` } },
    fractions() { let d1, d2; do { d1 = pick([2, 3, 4, 5, 6]); d2 = pick([2, 3, 4, 5]) } while (d1 === d2); const n1 = coprime(d1), n2 = coprime(d2), L = lcm(d1, d2) * irnd(1, 3), A = n1 * L / d1, B = n2 * L / d2; return { t: `(${n1}/${d1} + ${n2}/${d2}) · ${L}`, c: 'Вычислите', a: A + B, k: 'Дроби', s: `${n1}/${d1} · ${L} + ${n2}/${d2} · ${L} = ${A} + ${B} = ${A + B}` } },
    fracOf() { const d = pick([3, 4, 5, 6, 7, 8]), n = coprime(d), N = d * irnd(2, 12); return { t: `${n}/${d} от ${N}`, c: 'Вычислите', a: n * N / d, k: 'Дроби', s: `${N} : ${d} · ${n} = ${N / d} · ${n} = ${n * N / d}` } },
    decimals() { const a = irnd(2, 9), N = 10 * irnd(2, 9), b = irnd(11, 25), K = pick([2, 4, 5, 6, 8]), p = a * N / 10, q = b * K / 10; if (!Number.isInteger(q) || b % 10 === 0) return T.decimals(); return { t: `${dec(a)} · ${N} + ${dec(b)} · ${K}`, c: 'Вычислите', a: p + q, k: 'Десятичные дроби', s: `${dec(a)} · ${N} = ${p},  ${dec(b)} · ${K} = ${q};  ${p} + ${q} = ${p + q}` } },
    absEq() { const b = irnd(1, 9), r = irnd(2, 12), neg = Math.random() < .5; return { t: `|x ${M} ${b}| = ${r}`, c: neg ? 'Меньший корень' : 'Больший корень', a: neg ? b - r : b + r, k: 'Модуль', s: `x ${M} ${b} = ${r} или x ${M} ${b} = ${M}${r}  →  x = ${b + r} или x = ${num(b - r)}` } },
    absVal() { const a = irnd(2, 15), b = irnd(1, 9), c = irnd(b + 1, 20); return { t: `|${M}${a}| + |${b} ${M} ${c}|`, c: 'Вычислите', a: a + c - b, k: 'Модуль', s: `${a} + ${c - b} = ${a + c - b}` } },
    order() { const a = irnd(2, 9), b = irnd(2, 12), c = nz(-9, 9); return { t: `${a * b} : ${a}${sgn(c)} · 2`, c: 'Вычислите', a: b + 2 * c, k: 'Порядок действий', s: `сначала : и ·:  ${a * b} : ${a} = ${b},  ${Math.abs(c)} · 2 = ${Math.abs(2 * c)};  ${b}${sgn(2 * c)} = ${num(b + 2 * c)}` } },
    negMul() { const a = irnd(2, 7), b = irnd(1, 6), c = irnd(b + 1, 12); return { t: `${M}${a} · (${b} ${M} ${c})`, c: 'Вычислите', a: -a * (b - c), k: 'Порядок действий', s: `${b} ${M} ${c} = ${num(b - c)};  ${M}${a} · (${num(b - c)}) = ${num(-a * (b - c))}` } },
    system() { const x = irnd(-3, 12), y = nz(-3, 9); return { t: `x + y = ${num(x + y)};  x ${M} y = ${num(x - y)}`, c: 'Найдите x', a: x, k: 'Системы уравнений', s: `сложим: 2x = ${num(2 * x)}  →  x = ${num(x)}` } },
    progression() { const a1 = irnd(-5, 9), d = nz(-4, 6), n = irnd(4, 9), an = a1 + (n - 1) * d; return { t: `a${SUB(1)} = ${num(a1)},  d = ${num(d)}`, c: `Найдите a${SUB(n)}`, a: an, k: 'Прогрессии', s: `a${SUB(n)} = a${SUB(1)} + ${n - 1}d = ${num(a1)} + ${n - 1} · ${par(d)} = ${num(an)}` } },
  };
  function quad(big) {
    let p, q; do { p = irnd(-8, 9); q = irnd(-8, 9) } while (p === q || p === -q || !p || !q);
    const s = -(p + q), pr = p * q, sx = s === 1 ? ' + x' : s === -1 ? ` ${M} x` : sgn(s) + 'x';
    return { t: `x²${sx}${sgn(pr)} = 0`, c: big ? 'Больший корень' : 'Меньший корень', a: big ? Math.max(p, q) : Math.min(p, q), k: 'Квадратные уравнения', s: `по теореме Виета: x₁ + x₂ = ${num(p + q)},  x₁ · x₂ = ${num(pr)}  →  корни ${num(Math.min(p, q))} и ${num(Math.max(p, q))}` };
  }
  // фиксированный банк (прежний массив Q + новые), с разбором
  const FIX = [['3x + 5 = 20', 'Найдите x', 5, '3x = 15  →  x = 5'], ['12 − 2x = 4', 'Найдите x', 4, '2x = 12 − 4 = 8  →  x = 4'], ['5(x − 2) = 3x + 4', 'Найдите x', 7, '5x − 10 = 3x + 4  →  2x = 14  →  x = 7'],
    ['x² − 5x + 6 = 0', 'Больший корень', 3, 'по теореме Виета: корни 2 и 3'], ['x/4 + 1 = 4', 'Найдите x', 12, 'x/4 = 3  →  x = 12'], ['2³ + 3²', 'Вычислите', 17, '8 + 9 = 17'], ['√144 − √25', 'Вычислите', 7, '12 − 5 = 7'],
    ['15% от 80', 'Вычислите', 12, '80 · 15 : 100 = 12'], ['4/(x − 1) = 2', 'Найдите x', 3, 'x − 1 = 4 : 2 = 2  →  x = 3'], ['0,6 · 50', 'Вычислите', 30, '0,6 · 50 = 30'], ['(−3)² − 2 · 4', 'Вычислите', 1, '9 − 8 = 1'],
    ['7x − 9 = 3x + 11', 'Найдите x', 5, '4x = 20  →  x = 5'], ['2(x + 3) = 18', 'Найдите x', 6, 'x + 3 = 9  →  x = 6'], ['180 : 15 + 6', 'Вычислите', 18, '12 + 6 = 18'], ['x² − 49 = 0', 'Положительный корень', 7, 'x² = 49  →  x = ±7'],
    ['3(x + 1) − 2x = 9', 'Найдите x', 6, '3x + 3 − 2x = 9  →  x = 6'], ['40% от 35', 'Вычислите', 14, '35 · 40 : 100 = 14'], ['x² + 2x − 15 = 0', 'Меньший корень', -5, 'по теореме Виета: корни −5 и 3'],
    ['|x + 4| = 6', 'Меньший корень', -10, 'x + 4 = 6 или x + 4 = −6  →  x = 2 или x = −10'], ['(2⁵ − 2³) : 3', 'Вычислите', 8, '(32 − 8) : 3 = 24 : 3 = 8'], ['0,25 · 64 − 1,5 · 6', 'Вычислите', 7, '16 − 9 = 7'],
    ['6 − 3(x − 2) = 0', 'Найдите x', 4, '6 − 3x + 6 = 0  →  3x = 12  →  x = 4'], ['x² = 6x', 'Ненулевой корень', 6, 'x(x − 6) = 0  →  x = 0 или x = 6'], ['(√13 − 3)(√13 + 3)', 'Вычислите', 4, '(√13)² − 3² = 13 − 9 = 4'],
    ['1,2 · 15 − 2,5 · 4', 'Вычислите', 8, '18 − 10 = 8'], ['2x + 7 = −x − 8', 'Найдите x', -5, '3x = −15  →  x = −5']]
    .map(([t, c, a, s]) => ({ t, c, a, s, k: 'Разное' }));
  const POOL = [
    ['linear', 'linear3', 'fracLinear', 'percent', 'powers', 'roots', 'order', 'fracOf', 'absVal', 'negMul', 'roots3', 'discount', 'decimals', 'FIX'],
    ['linear2', 'quadBig', 'quadSmall', 'quadPure', 'system', 'absEq', 'fractions', 'negPow', 'roots2', 'progression', 'proportion', 'powRule', 'decimals', 'FIX'],
  ];
  const used = new Set(), topicsUsed = [];
  function next(level = 0) {
    for (let tries = 0; tries < 80; tries++) {
      // темы чередуются: одна и та же не идёт два раза подряд
      const k = pick(POOL[cl(level, 0, 1)]); if (topicsUsed.slice(-2).includes(k) && tries < 40) continue;
      const p = k === 'FIX' ? pick(FIX) : T[k]();
      if (!Number.isInteger(p.a) || Math.abs(p.a) > 999 || used.has(p.t)) continue; used.add(p.t); topicsUsed.push(k); return p;
    }
    return pick(FIX);
  }
  return { next, T, FIX, reset() { used.clear(); topicsUsed.length = 0 } };
})();
