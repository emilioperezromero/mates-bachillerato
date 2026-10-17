/* =========================================================================
   Conversor sencillo de LaTeX a HTML para los apuntes.
   - Las fórmulas ($...$, $$...$$, \[...\], \(...\), equation, align...)
     se dejan intactas y las dibuja KaTeX.
   - Se entienden: \section, \subsection, \subsubsection, itemize,
     enumerate, description, tabular, center, minipage, multicols, figure,
     \textbf, \emph, \textcolor, \color, tamaños (\large, \small...), \href...
   - Entornos tipo teorema: definicion, teorema, propiedad, ejemplo,
     observacion, nota, importante, demostracion, ejercicio, solucion...
     (admiten título opcional: \begin{teorema}[de Bolzano])
   - Recuadros de color: \begin{recuadro}[Título]{#1c639b} ... \end{recuadro}
     (el importador convierte los tcolorbox a este formato)
   - Si pegas un documento completo, se usa lo que hay entre
     \begin{document} y \end{document}.
   ========================================================================= */
const LatexHTML = (() => {
  const CAJAS = {
    definicion: ['Definición', 'def'], 'definición': ['Definición', 'def'],
    teorema: ['Teorema', 'teo'], propiedad: ['Propiedad', 'teo'], propiedades: ['Propiedades', 'teo'],
    proposicion: ['Proposición', 'teo'], corolario: ['Corolario', 'teo'], lema: ['Lema', 'teo'],
    formula: ['Fórmula', 'teo'], regla: ['Regla', 'teo'],
    ejemplo: ['Ejemplo', 'ej'], ejercicio: ['Ejercicio', 'ej'], solucion: ['Solución', 'ej'],
    observacion: ['Observación', 'obs'], nota: ['Nota', 'obs'], recuerda: ['Recuerda', 'obs'],
    importante: ['Importante', 'imp'], cuidado: ['¡Cuidado!', 'imp'],
    demostracion: ['Demostración', 'dem'], proof: ['Demostración', 'dem']
  };
  const OTROS = ['itemize', 'enumerate', 'description', 'center', 'flushleft', 'flushright', 'quote', 'quotation',
    'recuadro', 'minipage', 'multicols', 'figure', 'table'];
  const ENTORNOS = Object.keys(CAJAS).concat(OTROS).map(e => e + '\\*?').join('|');
  const TAMANOS = { Huge: 'xl', huge: 'xl', LARGE: 'xl', Large: 'l', large: 'm', small: 's', footnotesize: 's', scriptsize: 'xs', tiny: 'xs' };

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const colorSeguro = c => c.replace(/[^a-zA-Z#0-9]/g, '');

  // Posición justo después de la llave que cierra la que hay en s[i]
  function cierraLlave(s, i) {
    let prof = 0;
    for (let j = i; j < s.length; j++) {
      if (s[j] === '\\') { j++; continue; }
      if (s[j] === '{') prof++;
      else if (s[j] === '}' && --prof === 0) return j + 1;
    }
    return s.length;
  }

  /* Reemplaza \comando{arg1}{arg2}... respetando llaves anidadas */
  function replaceCmd(s, nombre, nargs, fn) {
    const re = new RegExp('\\\\' + nombre + '\\s*\\{', 'g');
    let out = '', i = 0, m;
    while ((m = re.exec(s))) {
      let pos = m.index + m[0].length - 1;
      const args = [];
      let ok = true;
      for (let k = 0; k < nargs; k++) {
        while (s[pos] === ' ' || s[pos] === '\n') pos++;
        if (s[pos] !== '{') { ok = false; break; }
        const fin = cierraLlave(s, pos);
        args.push(s.slice(pos + 1, fin - 1));
        pos = fin;
      }
      if (!ok) continue;
      out += s.slice(i, m.index) + fn(...args);
      i = pos;
      re.lastIndex = pos;
    }
    return out + s.slice(i);
  }

  /* Declaraciones que afectan hasta el final del grupo: {\large ...}, {\color{red} ...} */
  function declaraciones(t) {
    const re = new RegExp('\\\\(?:(' + Object.keys(TAMANOS).join('|') + ')|(bfseries|itshape|sffamily)|color\\s*\\{([^}]*)\\})(?![a-zA-Z])\\s*');
    let m, guard = 0;
    while ((m = re.exec(t)) && guard++ < 5000) {
      const ini = m.index + m[0].length;
      let prof = 0, fin = t.length;
      for (let j = ini; j < t.length; j++) {
        if (t[j] === '\\') {
          if (prof === 0 && t.startsWith('\\end{', j)) { fin = j; break; }
          j++; continue;
        }
        if (t[j] === '{') prof++;
        else if (t[j] === '}') { if (prof === 0) { fin = j; break; } prof--; }
        else if (t[j] === '\n' && t[j + 1] === '\n' && prof === 0) { fin = j; break; }
      }
      const abre = m[1] ? `<span class="fs-${TAMANOS[m[1]]}">`
        : m[2] === 'bfseries' ? '<strong>' : m[2] === 'itshape' ? '<em>' : m[2] ? '<span>'
          : `<span style="color:${colorSeguro(m[3])}">`;
      const cierra = m[2] === 'bfseries' ? '</strong>' : m[2] === 'itshape' ? '</em>' : '</span>';
      t = t.slice(0, m.index) + abre + t.slice(ini, fin) + cierra + t.slice(fin);
    }
    return t;
  }

  const slug = t => t.replace(/<[^>]+>|[\u0000\u0001]\d+[\u0000\u0001]/g, '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'seccion';

  function inline(t) {
    const acentos = { "'": '́', '`': '̀', '^': '̂', '"': '̈', '~': '̃' };
    t = t.replace(/\\(['`^"~])\{?\\?([a-zA-Z])\}?/g, (m, a, ch) => ch + acentos[a]).normalize('NFC');
    t = t.replace(/\\normalsize\b|\\normalfont\b|\\centering\b|\\raggedright\b|\\raggedleft\b|\\columnbreak\b/g, '');
    t = declaraciones(t);
    t = t.replace(/\{\\bf\s+([^{}]*)\}/g, '<strong>$1</strong>').replace(/\{\\(?:it|em)\s+([^{}]*)\}/g, '<em>$1</em>');
    t = replaceCmd(t, '(?:setlength|addtolength|renewcommand|newcommand|definecolor)', 2, () => '');
    t = replaceCmd(t, 'captionof\\*?', 2, (tipo, x) => `<span class="leyenda">${x}</span>`);
    t = replaceCmd(t, 'caption\\*?', 1, x => `<span class="leyenda">${x}</span>`);
    t = replaceCmd(t, 'rule', 2, () => '<hr>');
    for (let k = 0; k < 2; k++) {
      t = replaceCmd(t, '(?:textbf|mathbf)', 1, x => `<strong>${x}</strong>`);
      t = replaceCmd(t, '(?:textit|emph|textsl)', 1, x => `<em>${x}</em>`);
      t = replaceCmd(t, 'underline', 1, x => `<u>${x}</u>`);
      t = replaceCmd(t, 'texttt', 1, x => `<code>${x}</code>`);
      t = replaceCmd(t, 'textsc', 1, x => `<span class="sc">${x}</span>`);
      t = replaceCmd(t, '(?:textrm|textnormal|textsf|textup|mbox|text|makebox)', 1, x => x);
      t = replaceCmd(t, 'textcolor', 2, (c, x) => `<span style="color:${colorSeguro(c)}">${x}</span>`);
      t = replaceCmd(t, 'colorbox', 2, (c, x) => `<span class="marcado" style="background:${colorSeguro(c)}">${x}</span>`);
      t = replaceCmd(t, '(?:fbox|framebox|boxed)', 1, x => `<span class="fbox">${x}</span>`);
      t = replaceCmd(t, 'fcolorbox', 3, (c1, c2, x) => `<span class="fbox" style="border-color:${colorSeguro(c1)};background:${colorSeguro(c2)}">${x}</span>`);
      t = replaceCmd(t, 'resizebox\\*?', 2, () => '');
      t = replaceCmd(t, 'scalebox', 1, () => '');
      t = replaceCmd(t, 'href', 2, (u, x) => `<a href="${u}" target="_blank" rel="noopener">${x}</a>`);
      t = replaceCmd(t, 'url', 1, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
      t = replaceCmd(t, 'footnote', 1, x => ` <small class="muted">(${x})</small>`);
      t = replaceCmd(t, 'paragraph\\*?', 1, x => `<strong>${x}.</strong> `);
      t = replaceCmd(t, '(?:label|ref|eqref|pageref|vspace\\*?|hspace\\*?|index|cite|title|author|date|thispagestyle|pagestyle|tcbuselibrary|usetikzlibrary|pgfplotsset)', 1, () => '');
    }
    return t
      .replace(/\\\\(\[[^\]]*\])?/g, '<br>')
      .replace(/\\newline\b/g, '<br>')
      .replace(/\\(?:hrule|tcblower)\b/g, '<hr>')
      .replace(/\\ /g, ' ')
      .replace(/---/g, '—').replace(/--/g, '–')
      .replace(/``/g, '“').replace(/''/g, '”')
      .replace(/\\(?:ldots|dots)\b/g, '…')
      .replace(/\\(?:euro|EUR)\b(\{\})?/g, '€')
      .replace(/\\(?:textdegree|degree)\b(\{\})?/g, '°')
      .replace(/\\checkmark\b/g, '✓')
      .replace(/\\textbullet\b/g, '•')
      .replace(/\\LaTeX\b(\{\})?/g, 'LaTeX')
      .replace(/\\(?:noindent|newpage|clearpage|maketitle|medskip|bigskip|smallskip|hfill|vfill|par|tableofcontents|hline|indent|linebreak|pagebreak|null)\b\s*/g, '')
      .replace(/\\(?:quad|qquad)\b/g, ' ')
      .replace(/\\[,;:!]/g, '&thinsp;')
      .replace(/\\([&%#_{}$])/g, '$1')
      .replace(/(^|[^\\])~/g, '$1&nbsp;');
  }

  // Anchura de un minipage como porcentaje: {0.45\textwidth}, {6cm}...
  function anchura(arg) {
    const f = arg.match(/^\s*([\d.]*)\s*\\(?:textwidth|linewidth|columnwidth|hsize)/);
    if (f) return Math.round((parseFloat(f[1]) || 1) * 100);
    const cm = arg.match(/([\d.]+)\s*(cm|mm|in|pt)/);
    if (cm) {
      const v = parseFloat(cm[1]) * { cm: 1, mm: 0.1, in: 2.54, pt: 0.0353 }[cm[2]];
      return Math.min(100, Math.round(v / 16 * 100));
    }
    return 100;
  }

  // Tablas: \begin{tabular}{cols} ... \end{tabular}
  function tablas(s, tok) {
    const re = /\\begin\{tabular\}/;
    let m, guard = 0;
    while ((m = re.exec(s)) && guard++ < 500) {
      let pos = m.index + m[0].length;
      while (s[pos] === ' ' || s[pos] === '\n') pos++;
      if (s[pos] === '[') pos = s.indexOf(']', pos) + 1;
      while (s[pos] === ' ' || s[pos] === '\n') pos++;
      if (s[pos] === '{') pos = cierraLlave(s, pos);
      const fin = s.indexOf('\\end{tabular}', pos);
      if (fin < 0) break;
      const cuerpo = s.slice(pos, fin);
      const filas = cuerpo.split(/\\\\(?:\[[^\]]*\])?/)
        .map(r => r.replace(/\\hline|\\cline\{[^}]*\}|\\toprule|\\midrule|\\bottomrule|\\rowcolor\{[^}]*\}|\\noalign\{[^}]*\}/g, '').trim())
        .filter(Boolean);
      const html = '<div class="tabla-wrap"><table class="tabla">' + filas.map((r, i) => '<tr>' +
        r.split('&').map(c => {
          const tag = i === 0 ? 'th' : 'td';
          let span = 1, fondo = '';
          c = c.replace(/\\cellcolor\{([^}]*)\}/g, (mm, col) => { fondo = colorSeguro(col); return ''; });
          c = replaceCmd(c, 'multicolumn', 3, (n, f, x) => { span = parseInt(n, 10) || 1; return x; });
          c = replaceCmd(c, 'multirow', 3, (n, w, x) => x);
          const attrs = (span > 1 ? ` colspan="${span}"` : '') + (fondo ? ` style="background:${fondo}"` : '');
          const txt = inline(esc(c.trim())).replace(/\\[a-zA-Z]+\*?/g, '').replace(/[{}]/g, '');
          return `<${tag}${attrs}>${txt}</${tag}>`;
        }).join('') +
        '</tr>').join('') + '</table></div>';
      s = s.slice(0, m.index) + tok(html, true) + s.slice(fin + '\\end{tabular}'.length);
    }
    return s;
  }

  /* Separa las fórmulas recorriendo el texto de izquierda a derecha.
     Cada fórmula se guarda como \(...\) o \[...\] para que KaTeX no se confunda. */
  const MATES_ENT = /^\\begin\{(equation\*?|align\*?|gather\*?|multline\*?|alignat\*?|eqnarray\*?)\}/;
  function extraerMates(s, tok) {
    const limpiar = f => f.replace(/\\cline\{[^}]*\}/g, '\\hline')
      .replace(/\\fbox\s*\{\s*(?:\\\(|\$)([\s\S]*?)(?:\\\)|\$)\s*\}/g, '\\boxed{$1}')
      .replace(/\\fbox\s*\{/g, '\\boxed{');
    // Busca el $ que cierra; los $ dentro de llaves (\text{... $x$ ...}) no cuentan
    const cierre = (marca, desde) => {
      let prof = 0;
      for (let j = desde; j < s.length; j++) {
        if (s[j] === '\\') { j++; continue; }
        if (s[j] === '{') prof++;
        else if (s[j] === '}') prof = Math.max(0, prof - 1);
        else if (prof === 0 && s.startsWith(marca, j)) return j;
        else if (s[j] === '\n' && s[j + 1] === '\n' && marca === '$') return -1;
      }
      return -1;
    };
    let out = '', i = 0;
    while (i < s.length) {
      const c = s[i], nx = s[i + 1];
      if (c === '\\') {
        if (nx === '\\') {
          // Salto de línea, con o sin espacio: \\[6pt]
          const mm = s.slice(i + 2, i + 40).match(/^\s*\[[^\]\n]*\]/);
          out += '\\\\';
          i += 2 + (mm ? mm[0].length : 0);
          continue;
        }
        if (nx === '$') { out += tok('<span class="no-math">$</span>'); i += 2; continue; }
        if (nx === '[' || nx === '(') {
          const j = s.indexOf(nx === '[' ? '\\]' : '\\)', i + 2);
          if (j >= 0) {
            const f = limpiar(s.slice(i + 2, j));
            // Dentro de una fórmula grande sobran los \( \) que a veces se cuelan
            out += tok(esc(nx === '[' ? '\\[' + f.replace(/\\[()]/g, ' ') + '\\]' : '\\(' + f + '\\)'));
            i = j + 2;
            continue;
          }
        }
        const be = c === '\\' && nx === 'b' ? s.slice(i, i + 30).match(MATES_ENT) : null;
        if (be) {
          const fin = '\\end{' + be[1] + '}';
          const j = s.indexOf(fin, i);
          if (j >= 0) {
            const env = be[1].replace('eqnarray', 'align');
            const f = limpiar(s.slice(i + be[0].length, j));
            out += tok(esc('\\begin{' + env + '}' + f + '\\end{' + env + '}'));
            i = j + fin.length;
            continue;
          }
        }
        out += c + (nx || '');
        i += 2;
        continue;
      }
      if (c === '$') {
        const doble = nx === '$';
        const j = cierre(doble ? '$$' : '$', i + (doble ? 2 : 1));
        if (j >= 0) {
          const f = limpiar(s.slice(i + (doble ? 2 : 1), j));
          out += tok(esc(doble ? '\\[' + f + '\\]' : '\\(' + f + '\\)'));
          i = j + (doble ? 2 : 1);
          continue;
        }
      }
      out += c;
      i++;
    }
    return out;
  }

  function convert(src) {
    const tokens = [];
    const tok = (html, bloque) => {
      tokens.push(html);
      const c = bloque ? '\u0001' : '\u0000';
      const t = c + (tokens.length - 1) + c;
      return bloque ? '\n\n' + t + '\n\n' : t;
    };
    const esBloque = x => /^\u0001\d+\u0001$/.test(x);
    const parrafos = (t, compacto) => {
      const partes = t.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
      if (compacto && partes.length === 1 && !esBloque(partes[0])) return partes[0];
      return partes.map(x => (esBloque(x) ? x : `<p>${x}</p>`)).join('');
    };

    let s = String(src || '').replace(/\r\n?/g, '\n');
    const doc = s.match(/\\begin\{document\}([\s\S]*?)(?:\\end\{document\}|$)/);
    if (doc) s = doc[1];

    // Comentarios y fórmulas (las fórmulas se guardan aparte para no tocarlas)
    s = s.replace(/(?<!\\)%[^\n]*(?:\n[ \t]*)?/g, '');
    s = extraerMates(s, tok);

    // Imágenes
    s = s.replace(/\\includegraphics\s*(?:\[[^\]]*\])?\s*\{([^}]*)\}/g,
      (m, f) => tok(`<img src="${esc(f)}" alt="" class="apunte-img" loading="lazy">`));

    s = tablas(s, tok);
    s = esc(s);
    s = inline(s);

    // Títulos
    s = replaceCmd(s, '(?:chapter|section)\\*?', 1, t => tok(`<h2 id="${slug(t)}">${t}</h2>`, true));
    s = replaceCmd(s, 'subsection\\*?', 1, t => tok(`<h3>${t}</h3>`, true));
    s = replaceCmd(s, 'subsubsection\\*?', 1, t => tok(`<h4>${t}</h4>`, true));

    // Entornos (de dentro hacia fuera)
    const reEnt = new RegExp('\\\\begin\\{(' + ENTORNOS + ')\\}(\\[[^\\]]*\\])?((?:(?!\\\\begin\\{(?:' + ENTORNOS + ')\\})[\\s\\S])*?)\\\\end\\{\\1\\}');
    let guard = 0;
    while (reEnt.test(s) && guard++ < 2000) {
      s = s.replace(reEnt, (m, envAst, opt, cuerpo) => {
        const env = envAst.replace('*', '');
        // Argumento obligatorio de minipage, multicols y recuadro
        let arg = '';
        if (env === 'minipage' || env === 'multicols' || env === 'recuadro') {
          const a = cuerpo.match(/^\s*\{([^{}]*)\}/);
          if (a) { arg = a[1]; cuerpo = cuerpo.slice(a[0].length); }
        }
        if (env === 'itemize' || env === 'enumerate' || env === 'description') {
          const items = cuerpo.split(/\\item\b/).slice(1).map(it => {
            let etiqueta = '';
            it = it.replace(/^\s*\[([^\]]*)\]/, (mm, l) => { etiqueta = l; return ''; });
            return `<li>${etiqueta ? `<strong>${etiqueta}</strong> ` : ''}${parrafos(it, true)}</li>`;
          });
          const tag = env === 'enumerate' ? 'ol' : 'ul';
          return tok(`<${tag}>${items.join('')}</${tag}>`, true);
        }
        const dentro = parrafos(cuerpo);
        if (env === 'center') return tok(`<div class="centro">${dentro}</div>`, true);
        if (env === 'quote' || env === 'quotation') return tok(`<blockquote>${dentro}</blockquote>`, true);
        if (env === 'flushleft' || env === 'flushright') return tok(`<div style="text-align:${env === 'flushleft' ? 'left' : 'right'}">${dentro}</div>`, true);
        if (env === 'minipage') return tok(`<div class="minipagina" style="--w:${anchura(arg)}%">${dentro}</div>`, true);
        if (env === 'multicols') return tok(`<div class="multicol" style="--cols:${parseInt(arg, 10) || 2}">${dentro}</div>`, true);
        if (env === 'figure' || env === 'table') return tok(`<div class="figura">${dentro}</div>`, true);
        if (env === 'recuadro') {
          const titulo = opt && opt.length > 2 ? `<div class="caja-titulo">${opt.slice(1, -1)}</div>` : '';
          return tok(`<div class="caja caja-libre" style="--caja:${colorSeguro(arg) || '#1c639b'}">${titulo}${dentro}</div>`, true);
        }
        const [nombre, clase] = CAJAS[env];
        const sub = opt ? ` <span class="caja-sub">(${opt.slice(1, -1)})</span>` : '';
        return tok(`<div class="caja caja-${clase}"><div class="caja-titulo">${nombre}${sub}</div>${dentro}</div>`, true);
      });
    }

    // Entornos desconocidos: se quitan las etiquetas y se conserva el contenido
    s = s.replace(/\\(?:begin|end)\{[^}]*\}(?:\[[^\]]*\])?/g, '\n\n');
    // Comandos que no se conocen: se quita el nombre y se deja su contenido
    s = s.replace(/\\[a-zA-Z]+\*?(?:\[[^\]\n]*\])?/g, '');
    s = s.replace(/[{}]/g, '');

    s = parrafos(s);
    let n = 0;
    while (/[\u0000\u0001]\d+[\u0000\u0001]/.test(s) && n++ < 50) {
      s = s.replace(/([\u0000\u0001])(\d+)\1/g, (m, c, i) => tokens[+i]);
    }
    return s;
  }

  return { convert };
})();
