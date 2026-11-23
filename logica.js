// =====================================================
//  Damas — reglas del juego y la "mente" de la máquina
//  Reglas: las fichas avanzan y comen en diagonal hacia adelante; comer es obligatorio
//  y se puede comer varias seguidas. Al llegar al otro lado se coronan (dama 👑),
//  que se mueve y come a cualquier distancia en diagonal (dama voladora).
// =====================================================
const BLANCAS = 1, ROJAS = 2;
const VACIO = 0, FB = 1, FR = 2, DB = 3, DR = 4, MUERTA = 9;   // F = ficha, D = dama

const ladoDe = v => (v === FB || v === DB) ? BLANCAS : (v === FR || v === DR) ? ROJAS : 0;
const esDama = v => v === DB || v === DR;
const DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const direcciones = v => esDama(v) ? DIAG : ladoDe(v) === BLANCAS ? DIAG.slice(0, 2) : DIAG.slice(2);
const filaCorona = v => ladoDe(v) === BLANCAS ? 0 : 7;

function tableroInicial() {
  const b = new Array(64).fill(VACIO);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if ((r + c) % 2 !== 1) continue;
    if (r < 3) b[r * 8 + c] = FR; else if (r > 4) b[r * 8 + c] = FB;
  }
  return b;
}

// Busca todas las cadenas de capturas desde la casilla i
const dentro = (r, c) => r >= 0 && r <= 7 && c >= 0 && c <= 7;

function saltos(b, i, v, camino, capturas, out) {
  const r = (i / 8) | 0, c = i % 8, op = 3 - ladoDe(v), dama = esDama(v);
  let siguio = false;
  for (const [dr, dc] of direcciones(v)) {
    // La dama puede ir desde lejos: avanza por casillas vacías hasta encontrar una pieza
    let k = 1;
    if (dama) while (dentro(r + k * dr, c + k * dc) && b[(r + k * dr) * 8 + c + k * dc] === VACIO) k++;
    const rm = r + k * dr, cm = c + k * dc;
    if (!dentro(rm, cm)) continue;
    const m = rm * 8 + cm;
    if (ladoDe(b[m]) !== op) continue;
    // Casillas donde puede caer después de comer (la ficha normal solo en la siguiente)
    for (let j = 1; dentro(rm + j * dr, cm + j * dc); j++) {
      const r2 = rm + j * dr, d = r2 * 8 + cm + j * dc;
      if (b[d] !== VACIO) break;
      siguio = true;
      const b2 = b.slice();
      b2[i] = VACIO; b2[m] = MUERTA; b2[d] = v;   // la comida queda marcada hasta terminar
      const cam = [...camino, d], cs = [...capturas, m];
      if (!dama && r2 === filaCorona(v)) out.push({ camino: cam, capturas: cs });  // al coronar se detiene
      else saltos(b2, d, v, cam, cs, out);
      if (!dama) break;
    }
  }
  if (!siguio && capturas.length) out.push({ camino, capturas });
}

function movimientos(b, jug) {
  const caps = [];
  for (let i = 0; i < 64; i++) if (ladoDe(b[i]) === jug) saltos(b, i, b[i], [i], [], caps);
  if (caps.length) return caps;   // comer es obligatorio
  const res = [];
  for (let i = 0; i < 64; i++) {
    if (ladoDe(b[i]) !== jug) continue;
    const r = (i / 8) | 0, c = i % 8;
    for (const [dr, dc] of direcciones(b[i])) {
      // La ficha avanza una casilla; la dama todas las que estén libres
      for (let k = 1; dentro(r + k * dr, c + k * dc); k++) {
        const d = (r + k * dr) * 8 + c + k * dc;
        if (b[d] !== VACIO) break;
        res.push({ camino: [i, d], capturas: [] });
        if (!esDama(b[i])) break;
      }
    }
  }
  return res;
}

function aplicar(b, m) {
  const n = b.slice(), de = m.camino[0], a = m.camino[m.camino.length - 1];
  let v = n[de];
  n[de] = VACIO;
  for (const x of m.capturas) n[x] = VACIO;
  if (!esDama(v) && ((a / 8) | 0) === filaCorona(v)) v += 2;
  n[a] = v;
  return n;
}

function contar(b, jug) { let n = 0; for (const v of b) if (ladoDe(v) === jug) n++; return n; }
function mismaJugada(a, b) { return a.camino.length === b.camino.length && a.camino.every((x, k) => x === b.camino[k]); }

// ===== Inteligencia de la máquina =====
function evaluar(b, jug) {
  let s = 0;
  for (let i = 0; i < 64; i++) {
    const v = b[i]; if (!v) continue;
    const r = (i / 8) | 0, c = i % 8;
    let val;
    if (esDama(v)) val = 250 + (3.5 - Math.abs(3.5 - c)) * 2 + (3.5 - Math.abs(3.5 - r)) * 2;
    else {
      const avance = ladoDe(v) === BLANCAS ? 7 - r : r;
      val = 100 + avance * 4 + (avance === 0 ? 8 : 0) + (c === 0 || c === 7 ? 3 : 0);
    }
    s += ladoDe(v) === jug ? val : -val;
  }
  return s;
}

let limite = Infinity;
function negamax(b, jug, prof, alfa, beta, ext) {
  if (Date.now() > limite) throw 'tiempo';
  const movs = movimientos(b, jug);
  if (!movs.length) return -10000 - prof;   // sin jugadas = pierde
  if (prof <= 0 && !(movs[0].capturas.length && ext < 6)) return evaluar(b, jug);
  if (movs.length > 1) movs.sort((x, y) => y.capturas.length - x.capturas.length);
  let mejor = -Infinity;
  for (const m of movs) {
    const v = -negamax(aplicar(b, m), 3 - jug, prof - 1, -beta, -alfa, prof <= 0 ? ext + 1 : ext);
    if (v > mejor) mejor = v;
    if (mejor > alfa) alfa = mejor;
    if (alfa >= beta) break;
  }
  return mejor;
}

function alAzar(a) { return a[Math.floor(Math.random() * a.length)]; }

function buscar(b, jug, movs, prof, ruido) {
  let mejor = -Infinity, lista = [];
  for (const m of movs) {
    let v = ruido
      ? -negamax(aplicar(b, m), 3 - jug, prof - 1, -Infinity, Infinity, 0) + Math.random() * ruido
      : -negamax(aplicar(b, m), 3 - jug, prof - 1, -Infinity, -(mejor - 1), 0);
    if (v > mejor) { mejor = v; lista = [m]; } else if (v === mejor) lista.push(m);
  }
  return alAzar(lista);
}

// nivel: 0 = Fácil, 1 = Medio, 2 = Difícil, 3 = Experto
function elegirJugada(b, jug, nivel) {
  const movs = movimientos(b, jug);
  if (movs.length <= 1) return movs[0] || null;
  limite = Infinity;
  if (nivel === 0) return Math.random() < 0.4 ? alAzar(movs) : buscar(b, jug, movs, 1, 60);
  if (nivel === 1) return buscar(b, jug, movs, 3, 25);
  if (nivel === 2) return buscar(b, jug, movs, 5, 0);
  // Experto: piensa cada vez más jugadas adelante mientras le alcance el tiempo
  let elegida = buscar(b, jug, movs, 4, 0);
  limite = Date.now() + 1200;
  try { for (let p = 5; p <= 12; p++) elegida = buscar(b, jug, movs, p, 0); } catch (e) { /* se acabó el tiempo */ }
  limite = Infinity;
  return elegida;
}

if (typeof module !== 'undefined') {
  module.exports = { BLANCAS, ROJAS, VACIO, ladoDe, esDama, tableroInicial, movimientos, aplicar, contar, mismaJugada, elegirJugada };
}
