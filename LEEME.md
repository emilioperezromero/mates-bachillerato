# Mates Bachillerato — guía para el profesor/a

Web de apuntes, vídeos y práctica guiada para 1º y 2º de Bachillerato (Ciencias y CCSS).
Hecha solo con HTML, CSS y JavaScript. Para las fórmulas usa KaTeX, que se carga desde internet.

## Cómo verla

Haz doble clic en `index.html`. Necesitas conexión a internet para que se vean las fórmulas y los vídeos.

## Dónde está cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Cursos y temas de cada curso | `data/cursos.js` |
| Apuntes (en LaTeX) | tus `.tex` en `apuntes_latex/` + el importador (ver abajo) |
| Qué tema va en qué curso | lista `LISTA` en `herramientas/importar_apuntes.js` |
| Vídeos | `data/videos.js` |
| Ejercicios guiados | `data/ejercicios.js` |
| Colores y diseño | `css/styles.css` |

No hace falta tocar nada de la carpeta `js/`.

## Añadir o cambiar apuntes

Los apuntes salen directamente de tus archivos `.tex` de Overleaf:

1. Copia tus `.tex` en la carpeta `apuntes_latex/`, con las mismas subcarpetas (Análisis, Integrales, Álgebra…).
   Esta carpeta **no se publica**: solo se sube el resultado.
2. Ejecuta el importador desde la carpeta de la web:
   ```
   node herramientas/importar_apuntes.js
   ```
3. Revisa la web y publícala (`git add -A`, `git commit`, `git push`).

El importador:
- Convierte cada dibujo TikZ / pgfplots / forest en una imagen SVG (en `apuntes/fig/`) usando MiKTeX.
  Solo recompila los dibujos que han cambiado.
- Pasa los `tcolorbox` (y los definidos con `\newtcolorbox`) a recuadros de color, y los colores de `\definecolor` a la web.
- Escribe el resultado en `data/apuntes.js` (no lo edites a mano).
- Avisa de los dibujos que no compilan y guarda su `.tex` y su `.log` en `apuntes_latex/_errores/`.

Para añadir un tema nuevo, o cambiar en qué cursos aparece, edita la lista `LISTA` al principio de
`herramientas/importar_apuntes.js`. Cada tema indica su archivo, título, bloque, cursos y el tema de práctica
con el que se enlaza. Si añades `pdf: 'apuntes/nombre.pdf'`, aparecerá un botón para descargar el PDF.

## Añadir vídeos

En `data/videos.js`, pega el enlace de YouTube en el campo `youtube` del vídeo que quieras.
Mientras esté vacío, se muestra la tarjeta "Vídeo próximamente" con un botón para buscar el tema en YouTube.

## Añadir ejercicios

Copia un ejercicio parecido de `data/ejercicios.js` y modifícalo. Al principio del archivo se explica cada campo.

- Tipos de paso: `num` (un número), `expr` (una expresión con x), `lista` (varios números), `matriz` y `opcion` (elegir una respuesta).
- La función `generar` crea números aleatorios nuevos cada vez que se abre el ejercicio.
- En `errores` puedes poner respuestas equivocadas típicas con un mensaje que explique el fallo.

## Añadir un tema nuevo

1. En `data/cursos.js`, añade el tema a `TEMAS` y su identificador a los cursos que correspondan.
2. Añade sus apuntes, vídeos y ejercicios usando ese mismo identificador.

## Progreso de los alumnos

El progreso se guarda solo en el navegador de cada alumno (no hay servidor).
Desde la página de inicio, el alumno puede descargar un informe en texto y enviártelo.

## Publicarla en internet (opcional)

Puedes subir la carpeta completa a un alojamiento gratuito de páginas estáticas, como GitHub Pages o Netlify.
Así tus alumnos solo necesitan un enlace, y los vídeos de YouTube incrustados funcionan mejor que abriendo el archivo en local.
