# 🐸 Ranas al Ataque

Juego de estrategia para niños de 8 años en adelante. Las ranas verdes deben recuperar el estanque de los sapos morados: copias o saltas ranas, y los sapos que quedan junto a ellas cambian de color.

## Modos
- **Aventura**: 12 niveles con dificultad creciente, estrellas y pistas. Del nivel 7 en adelante la computadora piensa varias jugadas adelante.
- **Jugar con amigos en línea**: cada jugador tiene un código de 6 letras. Lo compartes con "Invitar a un amigo" (WhatsApp, etc.), tu amigo te agrega y se pueden retar. Al jugar una vez, quedan agregados como amigos los dos.
- **Duelo**: dos jugadores en el mismo teléfono.

## Archivos
- `index.html`: el juego (pantallas, dibujos, sonidos y modo en línea)
- `logica.js`: las reglas y la inteligencia de la computadora
- `manifest.webmanifest`, `sw.js`, `icon-*.png`: lo necesario para instalarlo como app

## Probarlo en la computadora
Haz doble clic en `index.html`. Todo funciona, menos el modo en línea y la instalación, que necesitan que el juego esté publicado en internet.

## Instalarlo en Android
1. Publica esta carpeta en internet con HTTPS. Las opciones gratis más fáciles son:
   - **Netlify Drop** (app.netlify.com/drop): arrastra la carpeta `Juego` y te da un enlace.
   - **GitHub Pages**: sube la carpeta a un repositorio y activa Pages en Settings → Pages.
2. En el teléfono, abre el enlace con **Chrome** → menú ⋮ → **Instalar aplicación** (o "Agregar a pantalla principal").
3. Queda un ícono como cualquier app. La aventura y el duelo funcionan también sin internet.

## Si quieres un archivo APK o publicarlo en Google Play
Con el enlace del paso 1, entra a **pwabuilder.com**, pega el enlace y elige *Android*. Genera el paquete para instalar o subir a Play Store.

## Cómo funciona el modo en línea
Los teléfonos se conectan directamente entre sí con PeerJS (usa su servidor público gratuito solo para encontrarse). No hace falta montar un servidor propio. Ten en cuenta que:
- Los dos tienen que tener el juego abierto y con internet al mismo tiempo.
- El servidor público de PeerJS es gratis y no tiene garantía. Si algún día falla, se puede cambiar por uno propio.
- En algunas redes muy cerradas (escuelas, ciertas compañías móviles) la conexión directa puede fallar.
- No hay chat ni búsqueda de desconocidos: solo se juega con quien tenga tu código.
