// =====================================================
//  Ranas al Ataque — reglas del juego y la "mente" de la computadora
// =====================================================
const VACIO = 0, VERDE = 1, MORADO = 2, ROCA = 3;

// Vecinos a 1 paso (copiar) y a 2 pasos (saltar), calculados una sola vez por tamaño
const cacheVecinos = {};
function vecinos(W, H) {
  const k = W + 'x' + H;
  if (cacheVecinos[k]) return cacheVecinos[k];
  const v1 = [], v2 = [];
  for (let i = 0; i < W * H; i++) {
    const x = i % W, y = (i / W) | 0, a = [], b = [];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      (Math.max(Math.abs(dx), Math.abs(dy)) === 1 ? a : b).push(ny * W + nx);
    }
    v1.push(a); v2.push(b);
  }
  return (cacheVecinos[k] = { v1, v2 });
}

// Mapa: 'P' = rana verde, 'C' = sapo morado, '#' = roca, '.' = hoja libre
function crearTablero(mapa) {
  const H = mapa.length, W = mapa[0].length;
  const c = new Int8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = mapa[y][x];
    c[y * W + x] = ch === 'P' ? VERDE : ch === 'C' ? MORADO : ch === '#' ? ROCA : VACIO;
  }
  const { v1, v2 } = vecinos(W, H);
  return { t: { W, H, v1, v2 }, c };
}

function distancia(t, a, b) {
  return Math.max(Math.abs((a % t.W) - (b % t.W)), Math.abs(((a / t.W) | 0) - ((b / t.W) | 0)));
}

function contar(c) {
  let e = 0, v = 0, m = 0;
  for (let i = 0; i < c.length; i++) {
    if (c[i] === VACIO) e++; else if (c[i] === VERDE) v++; else if (c[i] === MORADO) m++;
  }
  return [e, v, m];
}

// Todas las jugadas posibles. Las copias a la misma hoja son iguales, así que se cuentan una vez.
function movimientos(t, c, jug) {
  const res = [];
  for (let i = 0; i < c.length; i++) {
    if (c[i] !== VACIO) continue;
    for (const j of t.v1[i]) if (c[j] === jug) { res.push({ de: j, a: i, salto: false }); break; }
  }
  for (let i = 0; i < c.length; i++) {
    if (c[i] !== jug) continue;
    for (const j of t.v2[i]) if (c[j] === VACIO) res.push({ de: i, a: j, salto: true });
  }
  return res;
}

function aplicar(t, c, m, jug) {
  const n = c.slice(), op = 3 - jug, cap = [];
  if (m.salto) n[m.de] = VACIO;
  n[m.a] = jug;
  for (const j of t.v1[m.a]) if (n[j] === op) { n[j] = jug; cap.push(j); }
  return { c: n, cap };
}

// Cuántas fichas gana una jugada de inmediato
function ganancia(t, c, m, jug) {
  const op = 3 - jug;
  let g = m.salto ? 0 : 1;
  for (const j of t.v1[m.a]) if (c[j] === op) g++;
  return g;
}

function valor(c, jug) {
  const [e, v, m] = contar(c);
  const mios = jug === VERDE ? v : m, suyos = jug === VERDE ? m : v;
  if (suyos === 0) return 1000 + mios;
  if (mios === 0) return -1000 - suyos;
  return mios - suyos;
}

// Piensa varias jugadas hacia adelante (negamax con poda alfa-beta)
function negamax(t, c, jug, prof, alfa, beta) {
  const [e, v, m] = contar(c);
  if (v === 0 || m === 0 || e === 0) {
    const d = jug === VERDE ? v - m : m - v;
    return d > 0 ? 500 + d : d < 0 ? -500 + d : 0;
  }
  if (prof === 0) return valor(c, jug);
  const movs = movimientos(t, c, jug);
  if (!movs.length) {
    // Sin jugadas: las hojas libres son del rival y se acaba la partida
    const mios = jug === VERDE ? v : m, suyos = (jug === VERDE ? m : v) + e;
    const d = mios - suyos;
    return d > 0 ? 500 + d : d < 0 ? -500 + d : 0;
  }
  movs.sort((a, b) => ganancia(t, c, b, jug) - ganancia(t, c, a, jug));
  let mejor = -Infinity;
  for (const mv of movs) {
    const val = -negamax(t, aplicar(t, c, mv, jug).c, 3 - jug, prof - 1, -beta, -alfa);
    if (val > mejor) mejor = val;
    if (mejor > alfa) alfa = mejor;
    if (alfa >= beta) break;
  }
  return mejor;
}

function alAzar(a) { return a[Math.floor(Math.random() * a.length)]; }

function codicioso(t, c, jug, movs) {
  let mejor = -1, lista = [];
  for (const m of movs) {
    const g = ganancia(t, c, m, jug);
    if (g > mejor) { mejor = g; lista = [m]; } else if (g === mejor) lista.push(m);
  }
  return alAzar(lista);
}

// nivelIA: 0 = juega casi al azar, 1 = un poco despistado, 2 = busca comer,
//          3 = piensa 2 jugadas, 4 = piensa 3 jugadas
function elegirJugada(t, c, jug, nivelIA) {
  const movs = movimientos(t, c, jug);
  if (!movs.length) return null;
  if (nivelIA === 0) {
    if (Math.random() < 0.6) {
      const copias = movs.filter(m => !m.salto);
      return alAzar(copias.length && Math.random() < 0.7 ? copias : movs);
    }
    return codicioso(t, c, jug, movs);
  }
  if (nivelIA === 1) return Math.random() < 0.3 ? alAzar(movs) : codicioso(t, c, jug, movs);
  if (nivelIA === 2) return codicioso(t, c, jug, movs);

  let prof = nivelIA >= 4 ? 3 : 2;
  if (prof === 3 && movs.length > 70) prof = 2;
  movs.sort((a, b) => ganancia(t, c, b, jug) - ganancia(t, c, a, jug));
  let mejor = -Infinity, lista = [];
  for (const m of movs) {
    const val = -negamax(t, aplicar(t, c, m, jug).c, 3 - jug, prof - 1, -Infinity, -(mejor - 1));
    if (val > mejor) { mejor = val; lista = [m]; } else if (val === mejor) lista.push(m);
  }
  // Entre jugadas igual de buenas, prefiere copiar antes que saltar
  const copias = lista.filter(m => !m.salto);
  return alAzar(copias.length ? copias : lista);
}

if (typeof module !== 'undefined') {
  module.exports = { VACIO, VERDE, MORADO, ROCA, crearTablero, distancia, contar, movimientos, aplicar, elegirJugada };
}
