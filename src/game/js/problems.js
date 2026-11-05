// problems.js — задачи в стиле ОГЭ (9 класс). Ответ — целое число (может быть отрицательным), набирается осколками-цифрами.
// Генераторы по темам дают бесконечно много вариантов; плюс фиксированный банк из прежней версии (массив Q).
const Problems = (() => {
  const M = '−'; // настоящий минус
  const num = n => (n < 0 ? M + Math.abs(n) : '' + n);
  const sgn = n => (n < 0 ? ' ' + M + ' ' + Math.abs(n) : ' + ' + n);
  const kx = (k, v = 'x') => (k === 1 ? v : k === -1 ? M + v : num(k) + v);
  const SUP = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶' };
  const nz = (a, b) => { let v; do v = irnd(a, b); while (v === 0); return v };
  const T = {
    linear() { const a = irnd(2, 9), x = irnd(-6, 12), b = nz(-20, 20); return { t: `${kx(a)}${sgn(b)} = ${num(a * x + b)}`, c: 'Найдите x', a: x, k: 'Линейное уравнение' } },
    linear2() { let a, c; do { a = irnd(2, 7); c = irnd(1, 6) } while (a === c); const x = irnd(-5, 10), b = nz(-6, 6), d = a * (x + b) - c * x; return { t: `${a}(x${sgn(b)}) = ${kx(c)}${d ? sgn(d) : ''}`, c: 'Найдите x', a: x, k: 'Линейное уравнение' } },
    linear3() { const x = irnd(-8, 12), a = irnd(2, 6), b = irnd(1, 9); return { t: `${a}(x${sgn(-b)}) = ${num(a * (x - b))}`, c: 'Найдите x', a: x, k: 'Линейное уравнение' } },
    fracLinear() { const a = irnd(2, 6), x = a * irnd(-4, 8), b = nz(-9, 9); return { t: `x/${a}${sgn(b)} = ${num(x / a + b)}`, c: 'Найдите x', a: x, k: 'Уравнение с дробью' } },
    proportion() { const x = irnd(2, 12), k = irnd(2, 5), b = irnd(2, 9); return { t: `x / ${b} = ${x * k} / ${b * k}`, c: 'Найдите x', a: x, k: 'Пропорция' } },
    quadBig() { let p, q; do { p = irnd(-7, 9); q = irnd(-7, 9) } while (p === q); const s = -(p + q), pr = p * q; const big = Math.max(p, q); return { t: `x²${s ? sgn(s).replace(/(\d+)$/, '$1x').replace(' 1x', ' x') : ''}${pr ? sgn(pr) : ''} = 0`, c: 'Больший корень', a: big, k: 'Квадратное уравнение' } },
    quadSmall() { let p, q; do { p = irnd(-8, 8); q = irnd(-8, 8) } while (p === q); const s = -(p + q), pr = p * q; return { t: `x²${s ? sgn(s).replace(/(\d+)$/, '$1x').replace(' 1x', ' x') : ''}${pr ? sgn(pr) : ''} = 0`, c: 'Меньший корень', a: Math.min(p, q), k: 'Квадратное уравнение' } },
    quadPure() { const n = irnd(2, 13), neg = Math.random() < .5; return { t: `x² = ${n * n}`, c: neg ? 'Отрицательный корень' : 'Положительный корень', a: neg ? -n : n, k: 'Квадратное уравнение' } },
    percent() { const p = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), base = 100 / gcd(p, 100), N = base * irnd(1, Math.max(1, Math.floor(400 / base))); return { t: `${p}% от ${N}`, c: 'Вычислите', a: N * p / 100, k: 'Проценты' } },
    discount() { const p = pick([10, 20, 25, 30, 40, 50]), N = (100 / gcd(p, 100)) * irnd(2, 20); return { t: `${N} ₽ − скидка ${p}%`, c: 'Новая цена, ₽', a: N - N * p / 100, k: 'Проценты' } },
    powers() { const a = irnd(2, 3), m = a === 2 ? irnd(3, 6) : irnd(2, 4), b = irnd(2, 5), n = b <= 3 ? irnd(2, 3) : 2; return { t: `${a}${SUP[m]} − ${b}${SUP[n]}`, c: 'Вычислите', a: a ** m - b ** n, k: 'Степени' } },
    negPow() { const b = irnd(2, 4), n = irnd(2, 3), c = irnd(-15, 20); return { t: `(${M}${b})${SUP[n]}${sgn(c)}`, c: 'Вычислите', a: (-b) ** n + c, k: 'Степени' } },
    powRule() { const a = pick([2, 3]), m = irnd(3, 6), n = irnd(2, 3), r = m + n - irnd(2, 3); return { t: `${a}${SUP[m]} · ${a}${SUP[n]} : ${a}${SUP[m + n - r]}`, c: 'Вычислите', a: a ** r, k: 'Степени' } },
    roots() { const a = irnd(4, 15), b = irnd(2, 9); return { t: `√${a * a} − √${b * b}`, c: 'Вычислите', a: a - b, k: 'Корни' } },
    roots2() { const a = irnd(2, 6), b = irnd(2, 6); return { t: `√(${a * a} · ${b * b})`, c: 'Вычислите', a: a * b, k: 'Корни' } },
    roots3() { const s = irnd(2, 11), b = irnd(2, 9); return { t: `(√${s})² + √${b * b}`, c: 'Вычислите', a: s + b, k: 'Корни' } },
    fractions() { const d1 = pick([2, 3, 4, 5, 6]), n1 = irnd(1, d1 - 1), d2 = pick([2, 3, 4]), n2 = irnd(1, d2 - 1), L = lcm(d1, d2) * irnd(1, 3); return { t: `(${n1}/${d1} + ${n2}/${d2}) · ${L}`, c: 'Вычислите', a: n1 * L / d1 + n2 * L / d2, k: 'Дроби' } },
    fracOf() { const d = pick([3, 4, 5, 6, 7, 8]), n = irnd(1, d - 1), N = d * irnd(2, 12); return { t: `${n}/${d} от ${N}`, c: 'Вычислите', a: n * N / d, k: 'Дроби' } },
    absEq() { const b = irnd(1, 9), r = irnd(2, 12), neg = Math.random() < .5; return { t: `|x${sgn(-b)}| = ${r}`, c: neg ? 'Меньший корень' : 'Больший корень', a: neg ? b - r : b + r, k: 'Модуль' } },
    absVal() { const a = irnd(2, 15), b = irnd(1, 9), c = irnd(b + 1, 20); return { t: `|${M}${a}| + |${b} − ${c}|`, c: 'Вычислите', a: a + c - b, k: 'Модуль' } },
    order() { const a = irnd(2, 9), b = irnd(2, 12), c = irnd(-9, 9); return { t: `${a * b} : ${a}${sgn(c)} · 2`, c: 'Вычислите', a: b + 2 * c, k: 'Порядок действий' } },
    negMul() { const a = irnd(2, 7), b = irnd(1, 6), c = irnd(b + 1, 12); return { t: `${M}${a} · (${b} − ${c})`, c: 'Вычислите', a: -a * (b - c), k: 'Порядок действий' } },
    system() { const x = irnd(-3, 12), y = irnd(-3, 9); return { t: `x + y = ${num(x + y)};  x − y = ${num(x - y)}`, c: 'Найдите x', a: x, k: 'Система уравнений' } },
    progression() { const a1 = irnd(-5, 9), d = nz(-4, 6), n = irnd(4, 9); return { t: `a₁ = ${num(a1)},  d = ${num(d)}`, c: `Найдите a${'₀₁₂₃₄₅₆₇₈₉'[n]}`, a: a1 + (n - 1) * d, k: 'Прогрессия' } },
  };
  function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a) }
  function lcm(a, b) { return a / gcd(a, b) * b }
  // фиксированный банк (из прежней версии + новые)
  const FIX = [['3x + 5 = 20', 'Найдите x', 5], ['12 − 2x = 4', 'Найдите x', 4], ['5(x − 2) = 3x + 4', 'Найдите x', 7], ['x² − 5x + 6 = 0', 'Больший корень', 3], ['x/4 + 1 = 4', 'Найдите x', 12],
    ['2³ + 3²', 'Вычислите', 17], ['√144', 'Вычислите', 12], ['15% от 80', 'Вычислите', 12], ['4/(x − 1) = 2', 'Найдите x', 3], ['0,6 · 50', 'Вычислите', 30], ['(−3)² − 2 · 4', 'Вычислите', 1],
    ['7x − 9 = 3x + 11', 'Найдите x', 5], ['2(x + 3) = 18', 'Найдите x', 6], ['180 : 15 + 6', 'Вычислите', 18], ['x² − 49 = 0', 'Положительный корень', 7], ['3(x + 1) − 2x = 9', 'Найдите x', 6],
    ['40% от 35', 'Вычислите', 14], ['x² + 2x − 15 = 0', 'Меньший корень', -5], ['|x + 4| = 6', 'Меньший корень', -10], ['(2⁵ − 2³) : 3', 'Вычислите', 8], ['0,25 · 64 − 1,5 · 6', 'Вычислите', 7],
    ['6 − 3(x − 2) = 0', 'Найдите x', 4], ['x² = 6x', 'Ненулевой корень', 6], ['(√13 − 3)(√13 + 3)', 'Вычислите', 4], ['1,2 · 15 − 2,5 · 4', 'Вычислите', 8], ['2x + 7 = −x − 8', 'Найдите x', -5]]
    .map(([t, c, a]) => ({ t, c, a, k: 'Банк' }));
  const POOL = [
    ['linear', 'linear2', 'linear3', 'fracLinear', 'percent', 'powers', 'roots', 'order', 'fracOf', 'absVal', 'negMul', 'roots3', 'discount', 'FIX'],
    ['linear2', 'quadBig', 'quadSmall', 'quadPure', 'system', 'absEq', 'fractions', 'negPow', 'roots2', 'progression', 'proportion', 'powRule', 'FIX'],
  ];
  const used = new Set();
  function next(level = 0) {
    for (let tries = 0; tries < 60; tries++) {
      const k = pick(POOL[cl(level, 0, 1)]); const p = k === 'FIX' ? pick(FIX) : T[k]();
      if (!Number.isInteger(p.a) || Math.abs(p.a) > 999 || used.has(p.t)) continue; used.add(p.t); return p;
    }
    return pick(FIX);
  }
  return { next, T, FIX, reset() { used.clear() } };
})();
