# 🚩 Captura la Bandera

Juego de estrategia para niños de 8 años en adelante. Cada jugador tiene un ejército de animales y una bandera escondida. Gana quien capture la bandera del rival.

## Reglas
- Mueves un animal una casilla por turno (adelante, atrás o a los lados). No se puede pisar el agua 🌊.
- Los animales del rival están escondidos hasta que pelean.
- Si chocan, gana el número más grande: 🐭1 🐱2 🐶3 🐺4 🐻5 🦁6. Si son iguales, salen los dos.
- La 💣 trampa vence a todos menos al 🐭 Ratón. La 🚩 y las 💣 no se mueven.
- Antes de atacar, el tablero avisa: verde = ganas, rojo = pierdes, amarillo = no se sabe.

## Modos
- **Aventura**: 7 niveles que enseñan las reglas poco a poco (primero sin trampas, luego con lagos, etc.), con rivales cada vez más listos y estrellas.
- **Amigos en línea**: cada jugador tiene un código de 6 letras. Se comparte con "Invitar a un amigo", se agregan y se retan.
- **Dos jugadores, un teléfono**: se pasan el teléfono por turnos y una pantalla tapa el tablero para que el otro no vea.

## Archivos
- `index.html`: pantallas, dibujos, sonidos y modo en línea
- `logica.js`: reglas y la inteligencia de la computadora
- `manifest.webmanifest`, `sw.js`, `icon-*.png`: lo necesario para instalarlo como app

## Probarlo en la computadora
Doble clic en `index.html`. Todo funciona menos el modo en línea y la instalación, que necesitan que esté publicado en internet.

## Publicarlo e instalarlo en Android
1. Copia estos archivos a la carpeta del repositorio de GitHub Pages, haz Commit y Push en GitHub Desktop.
2. Abre el enlace de GitHub Pages en Chrome en el teléfono → menú ⋮ → **Instalar aplicación**.
3. Para un APK o Google Play: pega el enlace en **pwabuilder.com** y elige Android.

## Sobre el modo en línea
Los teléfonos se conectan directamente con PeerJS (servidor público gratuito, sin garantía). Ambos deben tener el juego abierto y con internet. En redes muy cerradas la conexión puede fallar. No hay chat ni búsqueda de desconocidos.
