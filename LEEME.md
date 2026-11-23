# ⚪🔴 Damas

Damas para niños de 8 años en adelante, instalable en Android.

## Modos
- **Contra la máquina**, con 4 niveles: Fácil 🐣, Medio 🙂, Difícil 😎 y Experto 🧠. Puedes elegir jugar con blancas, rojas o al azar. Se puede deshacer jugadas y se guardan las partidas ganadas en cada nivel.
- **Contra un amigo en línea**: cada jugador tiene un código de 6 letras. Lo compartes con "Invitar a un amigo", tu amigo te agrega y se pueden retar.

## Reglas
- Las fichas avanzan una casilla en diagonal hacia adelante y comen saltando hacia adelante.
- Comer es obligatorio, y se puede comer varias fichas seguidas.
- Al llegar al otro lado, la ficha se corona y se vuelve **dama 👑**. La dama se mueve en diagonal todas las casillas libres que quiera, hacia adelante o hacia atrás, y puede comer desde lejos.
- **1 minuto por jugada.** Si se acaba el tiempo, se mueve una ficha al azar.
- Gana quien deje al rival sin fichas o sin jugadas. Si pasan 50 jugadas de damas sin comer, es empate.

## Archivos
- `index.html`: pantallas, tablero, reloj, sonidos y modo en línea
- `logica.js`: reglas e inteligencia de la máquina
- `manifest.webmanifest`, `sw.js`, `icon-*.png`: lo necesario para instalarlo como app

## Publicar e instalar
1. Copia los archivos a la carpeta del repositorio de GitHub Pages, y haz Commit y Push en GitHub Desktop.
2. En el teléfono, abre el enlace en Chrome → menú ⋮ → **Instalar aplicación**.
3. Si quieres un APK o publicarlo en Google Play, pega el enlace en **pwabuilder.com**.

## Modo en línea
Usa PeerJS para conectar los teléfonos directamente; su servidor público es gratis, pero no tiene garantía. Los dos jugadores deben tener el juego abierto y con internet. No hay chat ni búsqueda de desconocidos.
