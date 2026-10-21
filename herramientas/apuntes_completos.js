/* =========================================================================
   Junta todos los temas de los apuntes en un solo documento LaTeX con índice
   y lo compila a PDF.

   Uso (desde la carpeta de la web):
       node herramientas/apuntes_completos.js [carpeta_con_los_tex]

   - Lee los .tex de  apuntes_latex/  en el orden de la lista de temas
     de importar_apuntes.js (un capítulo por tema, una parte por bloque).
   - Escribe  apuntes_latex/completo/apuntes_completos.tex  (un único
     archivo que también se puede subir tal cual a Overleaf) y lo compila
     con pdflatex en esa misma carpeta.
   ========================================================================= */
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { LISTA, quitarComentarios, quitarDibujosSinCerrar, quitarPortada, leerOpcional, leerObligatorio } = require('./importar_apuntes.js');

const ROOT = path.join(__dirname, '..');
const SRC = path.resolve(process.argv[2] || path.join(ROOT, 'apuntes_latex'));
const DEST = path.join(SRC, 'completo');
const NOMBRE = 'apuntes_completos';

const PREAMBULO = String.raw`\documentclass[12pt,a4paper,oneside,openany]{book}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[spanish,es-noshorthands]{babel}
\usepackage{amsmath,amssymb,amsfonts}
\usepackage[a4paper,margin=2.5cm,headheight=15pt]{geometry}
\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{tikz}
\usepackage{tikz-3dplot}
\usepackage{pgfplots}
\usepackage{forest}
\usepackage{multicol}
\usepackage{enumitem}
\usepackage{float}
\usepackage{caption}
\usepackage[most]{tcolorbox}
\usepackage{fancyhdr}
\usepackage{eurosym}
\usepackage{booktabs}
\usepackage{array}
\usetikzlibrary{shapes,backgrounds,arrows,arrows.meta,patterns,patterns.meta,positioning,shapes.geometric,calc,trees,angles,quotes,intersections,decorations.pathreplacing,decorations.markings,3d,babel}
\usepgfplotslibrary{fillbetween}
\pgfplotsset{compat=1.18}
\tdplotsetmaincoords{70}{110}
\providecommand{\sen}{\sin}
\usepackage[hidelinks,pdfencoding=auto]{hyperref}

% Encabezado y pie
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\small Apuntes Matemáticas. EPR}
\fancyhead[R]{\small\nouppercase{\leftmark}}
\fancyfoot[C]{\thepage}
\renewcommand{\headrulewidth}{0.4pt}
\fancypagestyle{plain}{\fancyhf{}\fancyfoot[C]{\thepage}\renewcommand{\headrulewidth}{0pt}}
\renewcommand{\chaptermark}[1]{\markboth{#1}{}}
\renewcommand{\sectionmark}[1]{}
\setcounter{tocdepth}{1}
`;

const PORTADA = String.raw`\begin{titlepage}
\centering
\vspace*{5cm}
{\Huge\bfseries Apuntes de Matemáticas\par}
\vspace{0.6cm}
{\LARGE Bachillerato\par}
\vspace{1.5cm}
{\large Análisis · Integrales · Álgebra · Geometría · Probabilidad · Repaso\par}
\vfill
{\large EPR\par}
\vspace{0.3cm}
{\large \today\par}
\end{titlepage}
\tableofcontents
`;

// Saca del preámbulo de un tema lo que hay que conservar
function analizarPreambulo(pre, cajas) {
  const colores = pre.match(/\\definecolor\{[^}]+\}\{[^}]+\}\{[^}]+\}/g) || [];
  const ajustes = [];
  const par = pre.match(/\\setlength\{\\parindent\}\{[^}]*\}/);
  if (par) ajustes.push(par[0]);
  // \newtcolorbox{nombre}[n][opcional]{opciones}  -> preámbulo común
  const re = /\\newtcolorbox\{(\w+)\}/g;
  let m;
  while ((m = re.exec(pre))) {
    let pos = m.index + m[0].length;
    const n = pre.slice(pos).match(/^\s*\[\d\]/);
    if (n) pos += n[0].length;
    const o = leerOpcional(pre, pos);
    if (o) pos = o.fin;
    const a = leerObligatorio(pre, pos);
    if (a) pos = a.fin;
    if (!cajas.has(m[1])) cajas.set(m[1], pre.slice(m.index, pos));
  }
  return { colores, ajustes };
}

// Hace que los \section* también salgan en el índice
function seccionesAlIndice(cuerpo) {
  const re = /\\section\*\s*\{/g;
  let out = '', i = 0, m;
  while ((m = re.exec(cuerpo))) {
    const a = leerObligatorio(cuerpo, m.index + m[0].length - 1);
    if (!a) continue;
    // En el índice, el título sin colores
    const titulo = a.valor.trim().replace(/\\color\s*\{[^}]*\}\s*/g, '').replace(/\\textcolor\s*\{[^}]*\}/g, '');
    const textoPDF = titulo.replace(/\$[^$]*\$|\\\(.*?\\\)/g, '').replace(/\\[a-zA-Z]+\*?(\{[^}]*\})?/g, '').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
    out += cuerpo.slice(i, a.fin) + `\\addcontentsline{toc}{section}{\\texorpdfstring{${titulo}}{${textoPDF}}}`;
    i = a.fin;
    re.lastIndex = a.fin;
  }
  return out + cuerpo.slice(i);
}

// Cosas que Overleaf deja pasar pero pdflatex no
function compatiblePdflatex(cuerpo) {
  return cuerpo
    // Emojis y caracteres que pdflatex no sabe escribir
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️‍�]/gu, '')
    .replace(/ /g, '\\,')
    // \\ usado como espacio donde no hay línea que terminar ("There's no line here to end")
    .replace(/\\begin\{tabular\}[\s\S]*?\\end\{tabular\}|(\\end\{(?:itemize|enumerate|description|center)\})[ \t]*\\\\(?:\[[^\]\n]*\])?/g,
      (m, fin) => (fin ? fin + '\\medskip' : m))
    .replace(/(\\(?:sub)*section\*?\{[^\n]*\})[ \t]*(?:\n[ \t]*)?\\\\(?:\[[^\]\n]*\])?/g, '$1')
    .replace(/\n[ \t]*\n[ \t]*((?:\\(?:med|big|small)skip)?)[ \t]*\\\\(?:\[[^\]\n]*\])?/g, '\n\n$1')
    // Una línea en blanco dentro de una fórmula grande es un error en LaTeX
    .replace(/\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$/g, f => f.replace(/\n[ \t]*\n(\s*\n)*/g, '\n'));
}

function generar() {
  const estilo = path.join(SRC, 'estilo_apuntes.tex');
  const textoEstilo = fs.existsSync(estilo) ? quitarComentarios(fs.readFileSync(estilo, 'utf8')) : '';
  const cajas = new Map();
  const coloresComunes = textoEstilo.match(/\\definecolor\{[^}]+\}\{[^}]+\}\{[^}]+\}/g) || [];
  const capitulos = [];
  let bloque = null;

  for (const t of LISTA) {
    const archivo = path.join(SRC, t.archivo);
    if (!fs.existsSync(archivo)) { console.warn('⚠ No existe: ' + t.archivo); continue; }
    const fuente = fs.readFileSync(archivo, 'utf8').replace(/\r\n?/g, '\n');
    if (!fuente.trim()) { console.warn('⚠ Vacío (se omite): ' + t.archivo); continue; }
    const partes = fuente.split('\\begin{document}');
    const pre = quitarComentarios(partes.length > 1 ? partes[0] : '');
    let cuerpo = quitarComentarios((partes[1] || partes[0]).split('\\end{document}')[0]);
    const { colores, ajustes } = analizarPreambulo(pre, cajas);

    const avisos = [];
    cuerpo = quitarDibujosSinCerrar(cuerpo, avisos);
    avisos.forEach(a => console.warn(`⚠ ${t.archivo}: ${a}`));
    cuerpo = quitarPortada(cuerpo).cuerpo
      .replace(/\\(?:maketitle|tableofcontents)\b/g, '')
      .replace(/\\(?:thispagestyle|pagestyle)\{[^}]*\}/g, '');
    cuerpo = seccionesAlIndice(compatiblePdflatex(cuerpo)).replace(/\n{3,}/g, '\n\n').trim();

    if (t.bloque !== bloque) {
      bloque = t.bloque;
      capitulos.push(`\n%${'='.repeat(70)}\n\\part{${bloque}}\n%${'='.repeat(70)}\n`);
    }
    capitulos.push(`%${'-'.repeat(70)}\n% ${t.archivo}\n%${'-'.repeat(70)}\n` +
      `\\chapter{${t.titulo}}\n` +
      (colores.length ? colores.join('\n') + '\n' : '') +
      `\\begingroup\n${ajustes.join('\n')}\n${cuerpo}\n\\endgroup\n`);
    console.log('✓ ' + t.titulo);
  }

  const tex = '% Archivo generado por herramientas/apuntes_completos.js a partir de tus .tex.\n' +
    '% Para cambiar los apuntes, edita los .tex de cada tema y vuelve a generarlo.\n' +
    PREAMBULO + '\n% Colores comunes (estilo_apuntes.tex)\n' + coloresComunes.join('\n') +
    '\n\n% Recuadros definidos en los temas\n' + [...cajas.values()].join('\n') +
    '\n\n\\begin{document}\n' + PORTADA + '\n' + capitulos.join('\n') + '\n\\end{document}\n';
  fs.mkdirSync(DEST, { recursive: true });
  fs.writeFileSync(path.join(DEST, NOMBRE + '.tex'), tex);
  return tex;
}

function pdflatex() {
  return new Promise(res => execFile('pdflatex', ['-interaction=nonstopmode', '-file-line-error', NOMBRE + '.tex'],
    { cwd: DEST, timeout: 900000, windowsHide: true, maxBuffer: 1 << 28 },
    (err, stdout) => res(String(stdout))));
}

async function principal() {
  if (!fs.existsSync(SRC)) { console.error('No encuentro la carpeta ' + SRC); process.exit(1); }
  generar();
  // Tres pasadas: la tercera deja el índice y los números de página definitivos
  for (let pasada = 1; pasada <= 3; pasada++) {
    process.stdout.write(`Compilando (pasada ${pasada}/3)… `);
    const t0 = Date.now();
    const salida = await pdflatex();
    console.log(Math.round((Date.now() - t0) / 1000) + ' s');
    if (pasada === 3) {
      const errores = salida.split('\n').filter(l => /^.*:\d+: /.test(l) || /^! /.test(l));
      const pdf = path.join(DEST, NOMBRE + '.pdf');
      const paginas = (salida.match(/Output written on .*\((\d+) pages/) || [])[1];
      if (errores.length) console.warn(`\n⚠ ${errores.length} error(es) de LaTeX:\n  ` + [...new Set(errores)].slice(0, 30).join('\n  '));
      if (fs.existsSync(pdf)) console.log(`\nListo: ${pdf}` + (paginas ? ` (${paginas} páginas)` : ''));
      else console.error('\nNo se ha generado el PDF. Revisa ' + path.join(DEST, NOMBRE + '.log'));
    }
  }
}

principal();
