# Mates Bachillerato — guía para el profesor/a

Web de apuntes, vídeos y práctica guiada para 1º y 2º de Bachillerato (Ciencias y CCSS).
Hecha solo con HTML, CSS y JavaScript. Para las fórmulas usa KaTeX, que se carga desde internet.

## Cómo verla

Haz doble clic en `index.html`. Necesitas conexión a internet para que se vean las fórmulas y los vídeos.

## Dónde está cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Cursos y temas de cada curso | `data/cursos.js` |
| Apuntes (en LaTeX) | `data/apuntes.js` |
| Vídeos | `data/videos.js` |
| Ejercicios guiados | `data/ejercicios.js` |
| Colores y diseño | `css/styles.css` |

No hace falta tocar nada de la carpeta `js/`.

## Añadir o cambiar apuntes

En `data/apuntes.js`, cada tema tiene un bloque `latex: String.raw\`...\``. Pega ahí tu LaTeX.
Puedes pegar el documento entero: solo se usa lo que hay entre `\begin{document}` y `\end{document}`.

Se entiende: `\section`, `\subsection`, `itemize`, `enumerate`, `tabular`, `center`, `\textbf`, `\emph`, `\href`,
las fórmulas (`$...$`, `$$...$$`, `\[...\]`, `align`, `equation`…) y estos entornos con recuadro de color:
`definicion`, `teorema`, `propiedad`, `regla`, `ejemplo`, `ejercicio`, `solucion`, `observacion`, `nota`,
`recuerda`, `importante`, `cuidado` y `demostracion`. Todos admiten título opcional: `\begin{teorema}[de Bolzano]`.

Dos precauciones:
1. No uses comillas invertidas (\`) en el texto.
2. No escribas `$` pegado a `{` (pon un espacio: `$ {`).

Si además tienes el PDF, guárdalo en una carpeta `apuntes/` y pon `pdf: 'apuntes/nombre.pdf'`. Aparecerá un botón para descargarlo.

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
