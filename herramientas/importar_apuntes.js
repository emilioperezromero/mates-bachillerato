/* =========================================================================
   Importa los apuntes LaTeX a la web.

   Uso (desde la carpeta de la web):
       node herramientas/importar_apuntes.js [carpeta_con_los_tex]

   - Por defecto lee la carpeta  apuntes_latex/  (no se publica).
   - Qué archivo es cada tema, su bloque y sus cursos se indica en LISTA.
   - Cada dibujo TikZ / pgfplots / forest se compila con LaTeX (MiKTeX)
     y se guarda como imagen SVG en  apuntes/fig/ .  Solo se recompilan
     los dibujos que han cambiado.
   - El resultado se escribe en  data/apuntes.js  (no editar a mano).
   ========================================================================= */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const SRC = path.resolve(process.argv[2] || path.join(ROOT, 'apuntes_latex'));
const FIG_DIR = path.join(ROOT, 'apuntes', 'fig');
const SALIDA = path.join(ROOT, 'data', 'apuntes.js');
const ZOOM = 1.3; // los dibujos se amplían para que su texto se lea como el de la página

/* ---------- Temas: archivo, título, bloque, cursos y tema de práctica ---------- */
const C1 = ['1c', '1s'], TODOS = ['1c', '1s', '2c', '2s'];
const LISTA = [
  { id: 'funciones', archivo: 'Análisis/1.0 Introducción Funciones .tex', titulo: 'Funciones elementales y a trozos', bloque: 'Análisis', cursos: TODOS, practicar: 'limites' },
  { id: 'limites', archivo: 'Análisis/1.1 Límites.tex', titulo: 'Límites', bloque: 'Análisis', cursos: TODOS, practicar: 'limites' },
  { id: 'asintotas', archivo: 'Análisis/1.2 Asíntotas.tex', titulo: 'Asíntotas y ramas infinitas', bloque: 'Análisis', cursos: TODOS, practicar: 'limites' },
  { id: 'continuidad', archivo: 'Análisis/1.3 Continuidad.tex', titulo: 'Continuidad', bloque: 'Análisis', cursos: TODOS, practicar: 'limites' },
  { id: 'derivadas', archivo: 'Análisis/1.4 Derivadas.tex', titulo: 'Derivadas', bloque: 'Análisis', cursos: TODOS, practicar: 'derivadas' },
  { id: 'tangente', archivo: 'Análisis/1.5 Recta Tangente.tex', titulo: 'Recta tangente', bloque: 'Análisis', cursos: TODOS, practicar: 'derivadas' },
  { id: 'normal', archivo: 'Análisis/1.6 Recta Normal.tex', titulo: 'Recta normal', bloque: 'Análisis', cursos: ['1c', '2c'], practicar: 'derivadas' },
  { id: 'lhopital', archivo: 'Análisis/1.7 Regla de L_Hôpital.tex', titulo: "Regla de L'Hôpital", bloque: 'Análisis', cursos: ['2c', '2s'], practicar: 'limites' },
  { id: 'monotonia', archivo: 'Análisis/1.8 Monotonía.tex', titulo: 'Monotonía y extremos', bloque: 'Análisis', cursos: TODOS, practicar: 'derivadas' },
  { id: 'curvatura', archivo: 'Análisis/1.9 Curvatura.tex', titulo: 'Curvatura y puntos de inflexión', bloque: 'Análisis', cursos: ['2c', '2s'], practicar: 'derivadas' },
  { id: 'optimizacion', archivo: 'Análisis/1.10 Optimización.tex', titulo: 'Optimización', bloque: 'Análisis', cursos: ['2c', '2s'], practicar: 'derivadas' },
  { id: 'representacion', archivo: 'Análisis/1.11 Representación de funciones.tex', titulo: 'Representación de funciones', bloque: 'Análisis', cursos: ['2c', '2s'], practicar: 'derivadas' },
  { id: 'integrales', archivo: 'Integrales/2.1 Introducción Integrales.tex', titulo: 'Introducción a las integrales', bloque: 'Integrales', cursos: ['2c', '2s'], practicar: 'integrales' },
  { id: 'inmediatas', archivo: 'Integrales/2.2 Integral Inmediata.tex', titulo: 'Integrales inmediatas', bloque: 'Integrales', cursos: ['2c', '2s'], practicar: 'integrales' },
  { id: 'partes', archivo: 'Integrales/2.3 Integración por Partes.tex', titulo: 'Integración por partes', bloque: 'Integrales', cursos: ['2c'], practicar: 'integrales' },
  { id: 'racionales', archivo: 'Integrales/2.4 Integral Racional.tex', titulo: 'Integrales racionales', bloque: 'Integrales', cursos: ['2c'], practicar: 'integrales' },
  { id: 'cambio-variable', archivo: 'Integrales/2.5 Integral Cambio Variable.tex', titulo: 'Cambio de variable', bloque: 'Integrales', cursos: ['2c'], practicar: 'integrales' },
  { id: 'volumenes', archivo: 'Integrales/2.6 Volúmen Cuerpos Revolución.tex', titulo: 'Volúmenes de revolución', bloque: 'Integrales', cursos: ['2c'], practicar: 'integrales' },
  { id: 'factorizacion', archivo: 'Álgebra/3.1 Factorización de Polinomios.tex', titulo: 'Factorización de polinomios', bloque: 'Álgebra', cursos: C1 },
  { id: 'matrices', archivo: 'Álgebra/3.2 Matrices.tex', titulo: 'Matrices', bloque: 'Álgebra', cursos: ['2c', '2s'], practicar: 'matrices' },
  { id: 'sistemas', archivo: 'Álgebra/3.3 Sistemas de Ecuaciones.tex', titulo: 'Sistemas de ecuaciones', bloque: 'Álgebra', cursos: ['2c', '2s'], practicar: 'matrices' },
  { id: 'sistemas-contexto', archivo: 'Álgebra/3.4 Ej. Sistemas Contextualizados.tex', titulo: 'Problemas de sistemas', bloque: 'Álgebra', cursos: ['2c', '2s'], practicar: 'matrices' },
  { id: 'geometria', archivo: 'Geometría/4.1 Geometría.tex', titulo: 'Geometría en el espacio', bloque: 'Geometría', cursos: ['2c'] },
  { id: 'probabilidad', archivo: 'Probabilidad/Probabilidad.tex', titulo: 'Probabilidad', bloque: 'Probabilidad', cursos: ['2c', '2s'], practicar: 'probabilidad' },
  { id: 'repaso-derivadas', archivo: 'Repaso/Derivadas ESO.tex', titulo: 'Repaso: derivadas', bloque: 'Repaso', cursos: TODOS, practicar: 'derivadas' },
  { id: 'repaso-integrales', archivo: 'Repaso/IntegralesESO.tex', titulo: 'Repaso: integrales', bloque: 'Repaso', cursos: ['2c', '2s'], practicar: 'integrales' },
  { id: 'repaso-sistemas', archivo: 'Repaso/Sistemas Lineales 2 Incógnitas.tex', titulo: 'Repaso: sistemas 2×2', bloque: 'Repaso', cursos: TODOS }
];

/* ---------- Colores (xcolor) ---------- */
const BASE = {
  red: [255, 0, 0], green: [0, 255, 0], blue: [0, 0, 255], cyan: [0, 255, 255], magenta: [255, 0, 255],
  yellow: [255, 255, 0], black: [0, 0, 0], white: [255, 255, 255], gray: [128, 128, 128],
  darkgray: [64, 64, 64], lightgray: [191, 191, 191], brown: [191, 128, 64], lime: [191, 255, 0],
  olive: [128, 128, 0], orange: [255, 128, 0], pink: [255, 191, 191], purple: [191, 0, 64],
  teal: [0, 128, 128], violet: [128, 0, 128]
};
function leerColores(txt, tabla) {
  const re = /\\definecolor\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(txt))) {
    const [, nombre, modelo, v] = m;
    const n = v.split(',').map(x => parseFloat(x));
    let rgb = null;
    if (modelo === 'RGB') rgb = n;
    else if (modelo === 'rgb') rgb = n.map(x => x * 255);
    else if (modelo === 'HTML') rgb = [0, 2, 4].map(i => parseInt(v.trim().slice(i, i + 2), 16));
    else if (modelo === 'gray') rgb = [n[0] * 255, n[0] * 255, n[0] * 255];
    else if (modelo === 'cmyk') rgb = [0, 1, 2].map(i => 255 * (1 - n[i]) * (1 - n[3]));
    if (rgb) tabla[nombre.trim()] = rgb.map(x => Math.round(x));
  }
}
function rgbDe(expr, tabla) {
  const partes = expr.trim().split('!');
  let c = tabla[partes[0].trim()];
  if (!c) return null;
  for (let i = 1; i < partes.length; i += 2) {
    const p = parseFloat(partes[i]) / 100;
    const otro = i + 1 < partes.length ? tabla[partes[i + 1].trim()] : BASE.white;
    if (!otro || isNaN(p)) return null;
    c = c.map((x, k) => x * p + otro[k] * (1 - p));
  }
  return c;
}
const hex = rgb => '#' + rgb.map(x => Math.round(x).toString(16).padStart(2, '0')).join('');

/* ---------- Utilidades de texto ---------- */
// Devuelve la posición justo después de la llave que cierra la que hay en s[i]
function cierraLlave(s, i) {
  let prof = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '\\') { j++; continue; }
    if (s[j] === '{') prof++;
    else if (s[j] === '}' && --prof === 0) return j + 1;
  }
  return s.length;
}
// Divide "a=1, title={x, y}, b" por las comas que no están entre llaves
function partirOpciones(s) {
  const out = [];
  let prof = 0, ini = 0, mates = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\') { i++; continue; }
    if (s[i] === '$') mates = !mates;
    else if (s[i] === '{') prof++;
    else if (s[i] === '}') prof--;
    else if (s[i] === ',' && prof === 0 && !mates) { out.push(s.slice(ini, i)); ini = i + 1; }
  }
  out.push(s.slice(ini));
  return out.map(x => x.trim()).filter(Boolean);
}
// Lee un argumento opcional [..] (con corchetes anidados) en la posición i
function leerOpcional(s, i) {
  while (s[i] === ' ' || s[i] === '\n') i++;
  if (s[i] !== '[') return null;
  let prof = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') prof++;
    else if (s[j] === '}') prof--;
    else if (s[j] === '[' && prof === 0) prof += 100;
    else if (s[j] === ']' && prof === 100) return { valor: s.slice(i + 1, j), fin: j + 1 };
    else if (s[j] === ']' && prof > 100) prof -= 100;
  }
  return null;
}
function leerObligatorio(s, i) {
  while (s[i] === ' ' || s[i] === '\n') i++;
  if (s[i] !== '{') return null;
  const fin = cierraLlave(s, i);
  return { valor: s.slice(i + 1, fin - 1), fin };
}
// Como en TeX: el % se come el resto de la línea, el salto y los espacios iniciales de la siguiente
const quitarComentarios = s => s.replace(/(?<!\\)%[^\n]*(?:\n[ \t]*)?/g, '');
const quitarLlaves = s => s.replace(/^\s*\{([\s\S]*)\}\s*$/, '$1');

/* ---------- Extraer dibujos ---------- */
const AJUSTES = ['pgfplotsset', 'tikzset', 'tdplotsetmaincoords', 'pgfmathsetmacro', 'usetikzlibrary', 'usepgfplotslibrary'];
// Quita los \begin{tikzpicture} que se quedaron sin cerrar (restos de borradores):
// son los que van seguidos de otro \begin{tikzpicture} antes de cualquier \end.
function quitarDibujosSinCerrar(cuerpo, avisos) {
  const marcas = [...cuerpo.matchAll(/\\(begin|end)\{tikzpicture\}/g)];
  const abiertos = marcas.filter(m => m[1] === 'begin').length - marcas.filter(m => m[1] === 'end').length;
  if (abiertos <= 0) return cuerpo;
  const quitar = [];
  for (let k = 0; k < marcas.length - 1 && quitar.length < abiertos; k++) {
    if (marcas[k][1] === 'begin' && marcas[k + 1][1] === 'begin') {
      // Hasta el siguiente \begin{...} (el resto del borrador no se muestra)
      const desde = marcas[k].index;
      const sig = cuerpo.indexOf('\\begin{', desde + 10);
      quitar.push([desde, sig < 0 ? marcas[k + 1].index : sig]);
    }
  }
  for (const [a, b] of quitar.reverse()) cuerpo = cuerpo.slice(0, a) + cuerpo.slice(b);
  avisos.push(`${quitar.length} \\begin{tikzpicture} sin cerrar (se ha ignorado)`);
  return cuerpo;
}

function extraerDibujos(cuerpo) {
  const dibujos = [];
  const ajustes = [];
  let out = '', i = 0;
  const re = new RegExp('\\\\begin\\{(tikzpicture|forest)\\}|\\\\(' + AJUSTES.join('|') + ')\\b', 'g');
  let m;
  while ((m = re.exec(cuerpo))) {
    if (m.index < i) continue;
    out += cuerpo.slice(i, m.index);
    if (m[2]) {
      // Ajuste global (se aplica a los dibujos siguientes)
      let pos = m.index + m[0].length;
      const nArgs = m[2] === 'tdplotsetmaincoords' || m[2] === 'pgfmathsetmacro' ? 2 : 1;
      for (let k = 0; k < nArgs; k++) { const a = leerObligatorio(cuerpo, pos); if (a) pos = a.fin; }
      ajustes.push(cuerpo.slice(m.index, pos));
      i = pos;
    } else {
      const env = m[1];
      const reFin = new RegExp('\\\\(begin|end)\\{' + env + '\\}', 'g');
      reFin.lastIndex = m.index + m[0].length;
      let prof = 1, f;
      while (prof > 0 && (f = reFin.exec(cuerpo))) prof += f[1] === 'begin' ? 1 : -1;
      const fin = f ? f.index + f[0].length : cuerpo.length;
      const codigo = cuerpo.slice(m.index, fin);
      dibujos.push({ codigo, ajustes: ajustes.slice() });
      out += `\\includegraphics{@@FIG${dibujos.length - 1}@@}`;
      i = fin;
    }
    re.lastIndex = i;
  }
  return { cuerpo: out + cuerpo.slice(i), dibujos };
}

/* ---------- Compilar un dibujo a SVG ---------- */
function cabecera(colores) {
  return String.raw`\documentclass[border=3pt]{standalone}
\def\pgfsysdriver{pgfsys-dvisvgm.def}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{amsmath,amssymb,amsfonts,xcolor}
\usepackage{tikz,tikz-3dplot,pgfplots,forest}
\pgfplotsset{compat=1.18}
\usetikzlibrary{shapes,backgrounds,arrows,arrows.meta,patterns,positioning,shapes.geometric,calc,trees,angles,quotes,intersections,decorations.pathreplacing,decorations.markings,3d}
\usepgfplotslibrary{fillbetween}
\usepackage{eurosym}
\tdplotsetmaincoords{70}{110}
\providecommand{\sen}{\operatorname{sen}}
\providecommand{\tg}{\operatorname{tg}}
\providecommand{\R}{\mathbb{R}}
` + colores + '\n';
}
function ejecutar(cmd, args, cwd) {
  return new Promise(res => execFile(cmd, args, { cwd, timeout: 240000, windowsHide: true, maxBuffer: 1 << 26 },
    (err, stdout, stderr) => res({ err, salida: String(stdout) + String(stderr) })));
}
async function compilar(dib, colores, destino) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fig-'));
  const tex = cabecera(colores) + '\\setlength{\\textwidth}{16cm}\\setlength{\\linewidth}{16cm}\n\\begin{document}\n' +
    dib.ajustes.join('\n') + '\n' + dib.codigo + '\n\\end{document}\n';
  fs.writeFileSync(path.join(dir, 'f.tex'), tex);
  const r = await ejecutar('latex', ['-interaction=nonstopmode', '-halt-on-error', 'f.tex'], dir);
  let ok = fs.existsSync(path.join(dir, 'f.dvi'));
  let error = '';
  if (!ok) error = (r.salida.match(/^!.*$/m) || ['error de LaTeX'])[0];
  else {
    const d = await ejecutar('dvisvgm', ['--no-fonts', '--exact-bbox', '-b', '2pt', '--zoom=' + ZOOM, '-o', 'f.svg', 'f.dvi'], dir);
    ok = fs.existsSync(path.join(dir, 'f.svg'));
    if (ok) fs.copyFileSync(path.join(dir, 'f.svg'), destino);
    else error = 'dvisvgm: ' + d.salida.slice(-300);
  }
  if (!ok) {
    // Se guarda el .tex y el .log del dibujo para poder revisarlo
    const errDir = path.join(SRC, '_errores');
    fs.mkdirSync(errDir, { recursive: true });
    const base = path.basename(destino, '.svg');
    fs.copyFileSync(path.join(dir, 'f.tex'), path.join(errDir, base + '.tex'));
    if (fs.existsSync(path.join(dir, 'f.log'))) fs.copyFileSync(path.join(dir, 'f.log'), path.join(errDir, base + '.log'));
  }
  fs.rmSync(dir, { recursive: true, force: true });
  return { ok, error };
}

/* ---------- Pasar a la sintaxis que entiende la web ---------- */
function transformar(cuerpo, colores, cajasDef) {
  const col = expr => {
    expr = expr.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(expr)) return expr;
    const c = rgbDe(expr, colores);
    return c ? hex(c) : expr;
  };

  // Entornos definidos con \newtcolorbox -> tcolorbox
  for (const [nombre, def] of Object.entries(cajasDef)) {
    const re = new RegExp('\\\\begin\\{' + nombre + '\\}', 'g');
    let m, out = '', i = 0;
    while ((m = re.exec(cuerpo))) {
      let pos = m.index + m[0].length;
      const args = [];
      let k = 0;
      if (def.opcional !== null) {
        const o = leerOpcional(cuerpo, pos);
        args.push(o ? o.valor : def.opcional);
        if (o) pos = o.fin;
        k = 1;
      }
      for (; k < def.n; k++) { const a = leerObligatorio(cuerpo, pos); args.push(a ? a.valor : ''); if (a) pos = a.fin; }
      const opts = def.opciones.replace(/#(\d)/g, (mm, d) => args[+d - 1] || '');
      out += cuerpo.slice(i, m.index) + `\\begin{tcolorbox}[${opts}]`;
      i = pos;
      re.lastIndex = pos;
    }
    cuerpo = (out + cuerpo.slice(i)).replace(new RegExp('\\\\end\\{' + nombre + '\\}', 'g'), '\\end{tcolorbox}');
  }

  // tcolorbox -> \begin{recuadro}[título]{#color}
  cuerpo = cuerpo.replace(/\\begin\{tcolorbox\}/g, () => '\\begin{tcolorbox}');
  {
    let out = '', i = 0, m;
    const re = /\\begin\{tcolorbox\}/g;
    while ((m = re.exec(cuerpo))) {
      let pos = m.index + m[0].length;
      const o = leerOpcional(cuerpo, pos);
      let titulo = '', marco = '#1c639b';
      if (o) {
        pos = o.fin;
        for (const op of partirOpciones(o.valor)) {
          const [k, ...v] = op.split('=');
          const val = v.join('=').trim();
          if (k.trim() === 'title') titulo = quitarLlaves(val);
          if (k.trim() === 'colframe') marco = col(val);
        }
      }
      titulo = titulo.replace(/\\(?:Large|LARGE|large|Huge|huge|bfseries|normalfont)\b\s*/g, '').replace(/[\[\]]/g, m2 => (m2 === '[' ? '(' : ')'));
      out += cuerpo.slice(i, m.index) + `\\begin{recuadro}[${titulo}]{${marco}}`;
      i = pos;
      re.lastIndex = pos;
    }
    cuerpo = (out + cuerpo.slice(i)).replace(/\\end\{tcolorbox\}/g, '\\end{recuadro}');
  }

  // Colores con nombre -> hexadecimal (texto y fórmulas)
  cuerpo = cuerpo.replace(/\\(textcolor|color|colorbox|cellcolor|rowcolor)\s*\{([^}]*)\}/g,
    (m, cmd, c) => `\\${cmd}{${col(c)}}`);
  return cuerpo;
}

// Saca el bloque de título del principio y devuelve el subtítulo, si lo hay
function quitarPortada(cuerpo) {
  const m = cuerpo.match(/^\s*\\begin\{center\}([\s\S]*?)\\end\{center\}/);
  if (!m || !/\\(Huge|huge|LARGE)\b/.test(m[1])) return { cuerpo, resumen: '' };
  let resumen = '';
  const sub = m[1].match(/\{\\Large\s+([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/);
  if (sub) resumen = sub[1].replace(/\\[a-zA-Z]+\s*/g, '').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
  return { cuerpo: cuerpo.slice(m[0].length), resumen };
}

/* ---------- Programa principal ---------- */
async function principal() {
  if (!fs.existsSync(SRC)) { console.error('No encuentro la carpeta ' + SRC); process.exit(1); }
  fs.mkdirSync(FIG_DIR, { recursive: true });
  const coloresComunes = Object.assign({}, BASE);
  const estilo = path.join(SRC, 'estilo_apuntes.tex');
  const textoEstilo = fs.existsSync(estilo) ? fs.readFileSync(estilo, 'utf8') : '';
  leerColores(textoEstilo, coloresComunes);

  const resultado = [];
  const pendientes = [];
  const usadas = new Set();
  for (const t of LISTA) {
    const archivo = path.join(SRC, t.archivo);
    if (!fs.existsSync(archivo)) { console.warn('⚠ No existe: ' + t.archivo); continue; }
    const fuente = fs.readFileSync(archivo, 'utf8').replace(/\r\n?/g, '\n');
    if (!fuente.trim()) { console.warn('⚠ Vacío (se omite): ' + t.archivo); continue; }
    const partes = fuente.split('\\begin{document}');
    const preambulo = quitarComentarios(partes.length > 1 ? partes[0] : '') + (/\\input\{estilo_apuntes\}/.test(partes[0]) ? textoEstilo : '');
    let cuerpo = quitarComentarios((partes[1] || partes[0]).split('\\end{document}')[0]);

    const colores = Object.assign({}, coloresComunes);
    leerColores(preambulo, colores);
    const defColores = (preambulo.match(/\\definecolor\{[^}]+\}\{[^}]+\}\{[^}]+\}/g) || []).join('\n');

    // \newtcolorbox{nombre}[n][opcional]{opciones}
    const cajasDef = {};
    const reCaja = /\\newtcolorbox\{(\w+)\}(?:\[(\d)\])?/g;
    let mc;
    while ((mc = reCaja.exec(preambulo))) {
      let pos = mc.index + mc[0].length;
      const o = leerOpcional(preambulo, pos);
      if (o) pos = o.fin;
      const a = leerObligatorio(preambulo, pos);
      cajasDef[mc[1]] = { n: +(mc[2] || 0), opcional: o ? o.valor : null, opciones: a ? a.valor : '' };
    }

    const avisos = [];
    cuerpo = quitarDibujosSinCerrar(cuerpo, avisos);
    avisos.forEach(a => console.warn(`⚠ ${t.archivo}: ${a}`));
    const ext = extraerDibujos(cuerpo);
    cuerpo = ext.cuerpo;
    ext.dibujos.forEach((d, k) => {
      const hash = crypto.createHash('sha1').update(ZOOM + cabecera(defColores) + d.ajustes.join('\n') + d.codigo).digest('hex').slice(0, 10);
      const nombre = `${t.id}-${k + 1}-${hash}.svg`;
      usadas.add(nombre);
      const destino = path.join(FIG_DIR, nombre);
      if (!fs.existsSync(destino)) pendientes.push({ t, k, d, colores: defColores, destino, nombre });
      cuerpo = cuerpo.replace(`@@FIG${k}@@`, 'apuntes/fig/' + nombre);
    });

    // Un dibujo metido entre \[ \] o $$ $$ se centra (no es una fórmula)
    cuerpo = cuerpo.replace(/\\\[\s*(\\includegraphics\{[^}]*\})\s*\\\]|\$\$\s*(\\includegraphics\{[^}]*\})\s*\$\$/g,
      (m, a, b) => `\\begin{center}${a || b}\\end{center}`);
    const portada = quitarPortada(cuerpo);
    cuerpo = transformar(portada.cuerpo, colores, cajasDef).replace(/\n{3,}/g, '\n\n').trim();
    resultado.push({
      id: t.id, titulo: t.titulo, bloque: t.bloque, cursos: t.cursos, practicar: t.practicar || '',
      resumen: portada.resumen, pdf: t.pdf || '', latex: cuerpo
    });
    console.log(`✓ ${t.titulo}: ${ext.dibujos.length} dibujo(s)`);
  }

  // Compilar los dibujos nuevos (varios a la vez)
  const fallos = [];
  if (pendientes.length) {
    console.log(`\nCompilando ${pendientes.length} dibujo(s) con LaTeX…`);
    let hechos = 0;
    const cola = pendientes.slice();
    const trabajador = async () => {
      while (cola.length) {
        const p = cola.shift();
        const r = await compilar(p.d, p.colores, p.destino);
        hechos++;
        if (!r.ok) fallos.push({ ...p, error: r.error });
        process.stdout.write(`\r  ${hechos}/${pendientes.length}`);
      }
    };
    await Promise.all(Array.from({ length: Math.max(1, Math.min(4, os.cpus().length - 1)) }, trabajador));
    console.log('');
  }
  for (const f of fallos) {
    console.warn(`✗ Dibujo ${f.k + 1} de "${f.t.titulo}": ${f.error}`);
    const r = resultado.find(x => x.id === f.t.id);
    r.latex = r.latex.replace(`\\includegraphics{apuntes/fig/${f.nombre}}`,
      '\\begin{center}\\textit{(Dibujo no disponible en la web: consúltalo en el PDF.)}\\end{center}');
  }
  // Borrar imágenes antiguas que ya no se usan
  for (const f of fs.readdirSync(FIG_DIR)) if (f.endsWith('.svg') && !usadas.has(f)) fs.unlinkSync(path.join(FIG_DIR, f));

  const js = '/* Archivo generado por herramientas/importar_apuntes.js a partir de tus .tex.\n' +
    '   No lo edites a mano: cambia los .tex y vuelve a ejecutar el importador. */\n' +
    'window.APUNTES = ' + JSON.stringify(resultado, null, 1) + ';\n';
  fs.writeFileSync(SALIDA, js);
  // Índice ligero (sin el texto) para enlazar los apuntes desde otras páginas
  const indice = resultado.map(({ id, titulo, bloque, cursos, practicar }) => ({ id, titulo, bloque, cursos, practicar }));
  fs.writeFileSync(path.join(ROOT, 'data', 'apuntes_indice.js'),
    '/* Generado por herramientas/importar_apuntes.js. No editar a mano. */\nwindow.APUNTES_INDICE = ' + JSON.stringify(indice) + ';\n');
  console.log(`\nListo: ${resultado.length} temas en data/apuntes.js` + (fallos.length ? `, ${fallos.length} dibujo(s) con error` : ''));
}

principal();
