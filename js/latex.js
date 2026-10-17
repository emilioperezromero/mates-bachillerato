/* =========================================================================
   Conversor sencillo de LaTeX a HTML para los apuntes.
   - Las fórmulas ($...$, $$...$$, \[...\], \(...\), equation, align...)
     se dejan intactas y las dibuja KaTeX.
   - Se entienden: \section, \subsection, \subsubsection, itemize,
     enumerate, description, tabular, center, \textbf, \emph, \href...
   - Entornos tipo teorema: definicion, teorema, propiedad, ejemplo,
     observacion, nota, importante, demostracion, ejercicio, solucion...
     (admiten título opcional: \begin{teorema}[de Bolzano])
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
  const OTROS = ['itemize', 'enumerate', 'description', 'center', 'flushleft', 'flushright', 'quote', 'quotation'];
  const ENTORNOS = Object.keys(CAJAS).concat(OTROS).join('|');
  const MATES_DISPLAY = 'equation\\*?|align\\*?|gather\\*?|multline\\*?|alignat\\*?';

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* Reemplaza \comando{arg1}{arg2}... respetando llaves anidadas */
  function replaceCmd(s, nombre, nargs, fn) {
    const re = new RegExp('\\\\' + nombre + '\\s*\\{', 'g');
    let out = '', i = 0, m;
    while ((m = re.exec(s))) {
      let pos = m.index + m[0].length;
      const args = [];
      let ok = true;
      for (let k = 0; k < nargs; k++) {
        if (k > 0) {
          while (s[pos] === ' ' || s[pos] === '\n') pos++;
          if (s[pos] !== '{') { ok = false; break; }
          pos++;
        }
        let prof = 1, j = pos;
        while (j < s.length && prof > 0) {
          if (s[j] === '{' && s[j - 1] !== '\\') prof++;
          else if (s[j] === '}' && s[j - 1] !== '\\') prof--;
          j++;
        }
        args.push(s.slice(pos, j - 1));
        pos = j;
      }
      if (!ok) continue;
      out += s.slice(i, m.index) + fn(...args);
      i = pos;
      re.lastIndex = pos;
    }
    return out + s.slice(i);
  }

  const slug = t => t.replace(/<[^>]+>|[\u0000\u0001]\d+[\u0000\u0001]/g, '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'seccion';

  function inline(t) {
    const acentos = { "'": '́', '`': '̀', '^': '̂', '"': '̈', '~': '̃' };
    t = t.replace(/\\(['`^"~])\{?\\?([a-zA-Z])\}?/g, (m, a, ch) => ch + acentos[a]).normalize('NFC');
    t = t.replace(/\{\\bf\s+([^{}]*)\}/g, '<strong>$1</strong>').replace(/\{\\(?:it|em)\s+([^{}]*)\}/g, '<em>$1</em>');
    for (let k = 0; k < 2; k++) {
      t = replaceCmd(t, 'textbf', 1, x => `<strong>${x}</strong>`);
      t = replaceCmd(t, '(?:textit|emph|textsl)', 1, x => `<em>${x}</em>`);
      t = replaceCmd(t, 'underline', 1, x => `<u>${x}</u>`);
      t = replaceCmd(t, 'texttt', 1, x => `<code>${x}</code>`);
      t = replaceCmd(t, 'textsc', 1, x => `<span class="sc">${x}</span>`);
      t = replaceCmd(t, '(?:textrm|textnormal|mbox|text)', 1, x => x);
      t = replaceCmd(t, 'textcolor', 2, (c, x) => `<span style="color:${c.replace(/[^a-zA-Z#0-9]/g, '')}">${x}</span>`);
      t = replaceCmd(t, 'href', 2, (u, x) => `<a href="${u}" target="_blank" rel="noopener">${x}</a>`);
      t = replaceCmd(t, 'url', 1, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
      t = replaceCmd(t, 'footnote', 1, x => ` <small class="muted">(${x})</small>`);
      t = replaceCmd(t, 'paragraph\\*?', 1, x => `<strong>${x}.</strong> `);
      t = replaceCmd(t, '(?:label|ref|eqref|pageref|vspace\\*?|hspace\\*?|index|cite|title|author|date|setlength|newcommand|renewcommand)', 1, () => '');
    }
    return t
      .replace(/\\\\(\[[^\]]*\])?/g, '<br>')
      .replace(/---/g, '—').replace(/--/g, '–')
      .replace(/``/g, '“').replace(/''/g, '”')
      .replace(/\\(?:ldots|dots)\b/g, '…')
      .replace(/\\(?:noindent|newpage|clearpage|maketitle|medskip|bigskip|smallskip|centering|hfill|vfill|par|tableofcontents|hline|indent|linebreak|pagebreak)\b\s*/g, '')
      .replace(/\\(?:quad|qquad)\b/g, ' ')
      .replace(/\\[,;:!]/g, '&thinsp;')
      .replace(/\\([&%#_{}])/g, '$1')
      .replace(/(^|[^\\])~/g, '$1&nbsp;');
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

    // Comentarios y dólares escapados
    s = s.replace(/(^|[^\\])%.*$/gm, '$1');
    s = s.replace(/\\\$/g, () => tok('<span class="no-math">$</span>'));

    // Fórmulas: se guardan aparte para no tocarlas
    [/\$\$[\s\S]+?\$\$/g, /\\\[[\s\S]+?\\\]/g,
      new RegExp('\\\\begin\\{(' + MATES_DISPLAY + ')\\}[\\s\\S]+?\\\\end\\{\\1\\}', 'g'),
      /\\\([\s\S]+?\\\)/g, /\$[^$]+?\$/g
    ].forEach(re => { s = s.replace(re, m => tok(esc(m))); });

    // Imágenes
    s = s.replace(/\\includegraphics\s*(?:\[[^\]]*\])?\s*\{([^}]*)\}/g,
      (m, f) => tok(`<img src="${esc(f)}" alt="" class="apunte-img">`));

    // Tablas
    s = s.replace(/\\begin\{tabular\}\s*\{(?:[^{}]|\{[^{}]*\})*\}([\s\S]*?)\\end\{tabular\}/g, (m, cuerpo) => {
      const filas = cuerpo.split(/\\\\/)
        .map(r => r.replace(/\\hline|\\cline\{[^}]*\}|\\toprule|\\midrule|\\bottomrule/g, '').trim())
        .filter(Boolean);
      const html = '<div class="tabla-wrap"><table class="tabla">' + filas.map((r, i) => '<tr>' +
        r.split('&').map(c => { const tag = i === 0 ? 'th' : 'td'; return `<${tag}>${inline(esc(c.trim()))}</${tag}>`; }).join('') +
        '</tr>').join('') + '</table></div>';
      return tok(html, true);
    });

    s = esc(s);
    s = inline(s);

    // Títulos
    s = replaceCmd(s, '(?:chapter|section)\\*?', 1, t => tok(`<h2 id="${slug(t)}">${t}</h2>`, true));
    s = replaceCmd(s, 'subsection\\*?', 1, t => tok(`<h3>${t}</h3>`, true));
    s = replaceCmd(s, 'subsubsection\\*?', 1, t => tok(`<h4>${t}</h4>`, true));

    // Entornos (de dentro hacia fuera)
    const reEnt = new RegExp('\\\\begin\\{(' + ENTORNOS + ')\\}(\\[[^\\]]*\\])?((?:(?!\\\\begin\\{(?:' + ENTORNOS + ')\\})[\\s\\S])*?)\\\\end\\{\\1\\}');
    let guard = 0;
    while (reEnt.test(s) && guard++ < 500) {
      s = s.replace(reEnt, (m, env, opt, cuerpo) => {
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
        const [nombre, clase] = CAJAS[env];
        const sub = opt ? ` <span class="caja-sub">(${opt.slice(1, -1)})</span>` : '';
        return tok(`<div class="caja caja-${clase}"><div class="caja-titulo">${nombre}${sub}</div>${dentro}</div>`, true);
      });
    }

    // Entornos desconocidos: se quitan las etiquetas y se conserva el contenido
    s = s.replace(/\\(?:begin|end)\{[^}]*\}(?:\[[^\]]*\])?/g, '\n\n');
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
