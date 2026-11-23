// =====================================================
//  Captura la Bandera — reglas del juego y la "mente" de la computadora
// =====================================================
const AZUL = 1, ROJO = 2;
const TIPOS = {
  1: { e: '🐭', n: 'Ratón' }, 2: { e: '🐱', n: 'Gato' }, 3: { e: '🐶', n: 'Perro' },
  4: { e: '🐺', n: 'Lobo' }, 5: { e: '🐻', n: 'Oso' }, 6: { e: '🦁', n: 'León' },
  B: { e: '🚩', n: 'Bandera' }, T: { e: '💣', n: 'Trampa' },
};

function alAzar(a) { return a[Math.floor(Math.random() * a.length)]; }
function mezclar(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function crearTablero(W, H, lagos) {
  const lago = new Array(W * H).fill(false);
  for (const [x, y] of lagos) lago[y * W + x] = true;
  return { W, H, N: W * H, lago };
}

// Casillas donde cada equipo acomoda su ejército (sus 2 filas de atrás)
function zona(t, lado) {
  const filas = lado === AZUL ? [t.H - 2, t.H - 1] : [0, 1], r = [];
  for (const y of filas) for (let x = 0; x < t.W; x++) r.push(y * t.W + x);
  return r;
}
function filaDeAtras(t, lado) { return zona(t, lado).filter(i => ((i / t.W) | 0) === (lado === AZUL ? t.H - 1 : 0)); }

function vecinos(t, i) {
  const x = i % t.W, y = (i / t.W) | 0, r = [];
  if (y > 0) r.push(i - t.W);
  if (y < t.H - 1) r.push(i + t.W);
  if (x > 0) r.push(i - 1);
  if (x < t.W - 1) r.push(i + 1);
  return r.filter(j => !t.lago[j]);
}
function distancia(t, a, b) { return Math.abs(a % t.W - b % t.W) + Math.abs(((a / t.W) | 0) - ((b / t.W) | 0)); }

function seMueve(tipo) { return tipo !== 'B' && tipo !== 'T'; }

// ¿Qué pasa cuando "atk" ataca a "def"?
function resolver(atk, def) {
  if (def === 'B') return 'gana';
  if (def === 'T') return atk === 1 ? 'gana' : 'pierde';
  return atk > def ? 'gana' : atk < def ? 'pierde' : 'empate';
}

function movimientos(t, c, lado) {
  const r = [];
  for (let i = 0; i < t.N; i++) {
    const p = c[i];
    if (!p || p.lado !== lado || !seMueve(p.tipo)) continue;
    for (const j of vecinos(t, i)) if (!c[j] || c[j].lado !== lado) r.push({ de: i, a: j });
  }
  return r;
}

function mover(t, celdas, m) {
  const c = celdas.map(p => (p ? { ...p } : null));
  const p = c[m.de], q = c[m.a];
  p.movio = true;
  if (!q) { c[m.a] = p; c[m.de] = null; return { celdas: c, batalla: null, bandera: false }; }
  const res = resolver(p.tipo, q.tipo);
  const batalla = { atk: { ...p }, def: { ...q }, res };
  if (res === 'gana') { p.visto = true; c[m.a] = p; c[m.de] = null; }
  else if (res === 'pierde') { q.visto = true; c[m.de] = null; }
  else { c[m.a] = null; c[m.de] = null; }
  return { celdas: c, batalla, bandera: q.tipo === 'B' && res === 'gana' };
}

// Acomoda un ejército. Si "listo" es true, esconde la bandera atrás y la rodea de trampas.
function colocar(t, lado, ejercito, listo) {
  const z = zona(t, lado), atras = filaDeAtras(t, lado), pos = {};
  let resto = [...ejercito];
  const quitar = tp => resto.splice(resto.indexOf(tp), 1);
  const bi = listo ? alAzar([atras[0], atras[atras.length - 1], ...atras]) : alAzar(atras);
  pos[bi] = 'B'; quitar('B');
  if (listo) {
    for (const j of mezclar(vecinos(t, bi).filter(j => z.includes(j)))) {
      if (!resto.includes('T')) break;
      pos[j] = 'T'; quitar('T');
    }
  }
  const libres = mezclar(z.filter(j => pos[j] === undefined));
  mezclar(resto).forEach((tp, k) => { pos[libres[k]] = tp; });
  return Object.keys(pos).map(i => ({ i: +i, tipo: pos[i] }));
}

function ponerEjercito(c, lado, lista) {
  for (const { i, tipo } of lista) c[i] = { lado, tipo, visto: false, movio: false };
}

function contarAnimales(c, lado) { return c.filter(p => p && p.lado === lado && seMueve(p.tipo)).length; }

// ===== Inteligencia de la computadora =====
// Solo usa lo que un jugador puede saber: sus piezas, las del rival que ya se descubrieron
// y cuáles se han movido (las que se mueven no son bandera ni trampa).
function valor(tp) { return tp === 'B' ? 100 : tp === 'T' ? 3 : tp === 1 ? 3 : tp === 6 ? 8 : tp; }

function eligeIA(t, c, lado, nivel, anterior) {
  const movs = movimientos(t, c, lado);
  if (!movs.length) return null;
  if (nivel === 0 && Math.random() < 0.35) return alAzar(movs);
  const op = 3 - lado, ruido = [30, 12, 4, 1][nivel] ?? 4;
  const miBandera = c.findIndex(p => p && p.lado === lado && p.tipo === 'B');
  let mejor = -Infinity, elegido = movs[0];
  for (const m of movs) {
    const p = c[m.de], q = c[m.a];
    const yDe = (m.de / t.W) | 0, yA = (m.a / t.W) | 0;
    const avance = lado === ROJO ? yA - yDe : yDe - yA;
    let s = 0;
    if (q) {
      if (q.visto) {
        const r = resolver(p.tipo, q.tipo);
        s += r === 'gana' ? 40 + valor(q.tipo) * 5 : r === 'empate' ? 5 + (valor(q.tipo) - valor(p.tipo)) * 5 : -40 - valor(p.tipo) * 5;
      } else if (!q.movio) {
        // Pieza que nunca se movió: puede ser bandera o trampa. El ratón es ideal para revisarla.
        s += p.tipo === 1 ? 30 : p.tipo === 2 ? 8 : -4 * p.tipo;
      } else {
        s += (p.tipo - 3) * 7 + (p.tipo <= 2 ? 6 : 0);
      }
      if (nivel >= 1 && miBandera >= 0 && distancia(t, m.a, miBandera) <= 2) s += 25;
    } else {
      s += avance * (nivel === 0 ? 2 : 4);
      if (nivel >= 1) {
        for (const j of vecinos(t, m.a)) {
          if (j === m.de) continue;
          const e = c[j];
          if (!e || e.lado !== op || !seMueve(e.tipo)) continue;
          if (e.visto) s += resolver(e.tipo, p.tipo) === 'gana' ? -30 - valor(p.tipo) * 4 : 6;
          else if (e.movio && p.tipo >= 5) s -= 6;
        }
        for (const j of vecinos(t, m.de)) {
          const e = c[j];
          if (e && e.lado === op && e.visto && seMueve(e.tipo) && resolver(e.tipo, p.tipo) === 'gana') s += 25;
        }
      }
      if (nivel >= 2) {
        // Acercarse a un objetivo: algo que sabe que puede vencer, o una pieza quieta (¿la bandera?)
        let objetivo = -1, dMin = Infinity;
        for (let j = 0; j < t.N; j++) {
          const e = c[j];
          if (!e || e.lado !== op) continue;
          const bueno = e.visto ? resolver(p.tipo, e.tipo) === 'gana'
                      : !e.movio ? p.tipo <= 2
                      : p.tipo >= 4;
          if (!bueno) continue;
          const d = distancia(t, m.de, j);
          if (d < dMin) { dMin = d; objetivo = j; }
        }
        if (objetivo >= 0) s += (dMin - distancia(t, m.a, objetivo)) * (nivel >= 3 ? 9 : 6);
        if (p.tipo === 6 && avance > 0) s -= 3;
      }
    }
    if (anterior && m.de === anterior.a && m.a === anterior.de) s -= 12;  // no ir y venir
    s += Math.random() * ruido;
    if (s > mejor) { mejor = s; elegido = m; }
  }
  return elegido;
}

if (typeof module !== 'undefined') {
  module.exports = { AZUL, ROJO, TIPOS, crearTablero, zona, vecinos, seMueve, resolver, movimientos, mover, colocar, ponerEjercito, contarAnimales, eligeIA };
}
