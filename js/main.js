/* =========================================================================
   Funciones comunes a todas las páginas:
   curso seleccionado, cabecera, modo claro/oscuro y fórmulas con KaTeX.
   ========================================================================= */
(function () {
  /* ---- Almacenamiento local (con protección por si el navegador lo bloquea) ---- */
  const LS = {
    get(k, d = null) {
      try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; }
    },
    set(k, v) {
      try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ }
    }
  };

  /* ---- Iconos (SVG en línea) ---- */
  const P = {
    book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6.5A2.5 2.5 0 0 0 4 21.5"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H19"/>',
    video: '<rect x="2" y="5" width="15" height="14" rx="2"/><path d="m17 10 5-3v10l-5-3z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    x: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowL: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    play: '<path d="M6 4v16l14-8z" fill="currentColor"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    print: '<path d="M6 9V2h12v7"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v8H6z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    external: '<path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/>',
    shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'
  };
  function icon(name, cls = '') {
    return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
  }

  /* ---- Curso seleccionado: primero la URL, después lo guardado ---- */
  const params = new URLSearchParams(location.search);
  let curso = params.get('curso');
  if (!CURSOS[curso]) curso = LS.get('curso');
  if (!CURSOS[curso]) curso = null;
  if (curso) LS.set('curso', curso);

  function nombreCurso(id, corto = false) {
    const c = CURSOS[id];
    if (!c) return '';
    return corto ? `${c.nivel.split(' ')[0]} ${c.modalidad === 'Ciencias' ? 'Ciencias' : 'CCSS'}` : `${c.nivel} · ${c.modalidad}`;
  }

  function temasDe(id) {
    return (CURSOS[id] ? CURSOS[id].temas : []).filter(t => TEMAS[t]).map(t => Object.assign({ id: t }, TEMAS[t]));
  }

  /* Construye un enlace a otra página conservando el curso */
  function url(pagina, extra = {}) {
    const q = new URLSearchParams();
    if (curso) q.set('curso', curso);
    Object.entries(extra).forEach(([k, v]) => { if (v != null && v !== '') q.set(k, v); });
    const s = q.toString();
    return pagina + (s ? '?' + s : '');
  }

  /* Cambia los parámetros de la URL sin recargar la página */
  function setURL(extra = {}) {
    try {
      const u = new URL(location.href);
      u.search = new URLSearchParams(url('', extra).slice(1)).toString();
      history.replaceState(null, '', u);
    } catch (e) { /* algunos navegadores lo impiden con file:// */ }
  }

  /* ---- Fórmulas ---- */
  const MACROS = {
    '\\R': '\\mathbb{R}', '\\N': '\\mathbb{N}', '\\Z': '\\mathbb{Z}', '\\Q': '\\mathbb{Q}', '\\C': '\\mathbb{C}',
    '\\sen': '\\operatorname{sen}', '\\tg': '\\operatorname{tg}', '\\cotg': '\\operatorname{cotg}',
    '\\cosec': '\\operatorname{cosec}', '\\arcsen': '\\operatorname{arcsen}', '\\arctg': '\\operatorname{arctg}'
  };
  const DELIMITADORES = [
    { left: '$$', right: '$$', display: true },
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false },
    { left: '$', right: '$', display: false }
  ];
  ['equation', 'equation*', 'align', 'align*', 'gather', 'gather*', 'multline', 'multline*', 'alignat', 'alignat*'].forEach(env => {
    DELIMITADORES.push({ left: `\\begin{${env}}`, right: `\\end{${env}}`, display: true });
  });

  function renderMath(el) {
    if (!el || typeof window.renderMathInElement !== 'function') return;
    window.renderMathInElement(el, {
      delimiters: DELIMITADORES,
      macros: Object.assign({}, MACROS),
      throwOnError: false,
      ignoredClasses: ['no-math']
    });
  }

  function tex(str, el, display = false) {
    if (window.katex) {
      try {
        window.katex.render(str, el, { throwOnError: true, displayMode: display, macros: Object.assign({}, MACROS) });
        return true;
      } catch (e) { /* se muestra como texto */ }
    }
    el.textContent = str;
    return false;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---- Tarjetas para elegir curso ---- */
  function selectorCursos(contenedor) {
    contenedor.innerHTML = `<div class="curso-grid">${Object.entries(CURSOS).map(([id, c]) => `
      <button class="curso-card${id === curso ? ' seleccionado' : ''}" data-id="${id}" type="button">
        <span class="curso-check">${icon('checkCircle')}</span>
        <span class="curso-nivel">${esc(c.nivel)}</span>
        <span class="curso-nombre">${esc(c.modalidad)}</span>
        <span class="curso-asig">${esc(c.asignatura)}</span>
        <span class="curso-temas">${c.temas.length} temas</span>
      </button>`).join('')}</div>`;
    contenedor.querySelectorAll('.curso-card').forEach(b => b.addEventListener('click', () => setCurso(b.dataset.id)));
  }

  function setCurso(id) {
    if (!CURSOS[id]) return;
    curso = id;
    LS.set('curso', id);
    aplicarCurso();
    setURL();
    document.dispatchEvent(new CustomEvent('curso-cambiado', { detail: id }));
  }

  /* ---- Cabecera ---- */
  function aplicarCurso() {
    if (curso) document.body.dataset.curso = curso; else delete document.body.dataset.curso;
    const sel = document.getElementById('curso-select');
    if (sel) sel.value = curso || '';
    document.querySelectorAll('.site-nav a, .logo').forEach(a => {
      const base = a.getAttribute('href').split('?')[0];
      a.setAttribute('href', url(base));
    });
  }

  function iniciarCabecera() {
    const pagina = document.body.dataset.page;
    document.querySelectorAll('.site-nav a').forEach(a => {
      if (a.dataset.page === pagina) { a.classList.add('activo'); a.setAttribute('aria-current', 'page'); }
    });

    const sel = document.getElementById('curso-select');
    if (sel) {
      sel.innerHTML = `<option value="" disabled>Elige tu curso</option>` +
        Object.keys(CURSOS).map(id => `<option value="${id}">${esc(nombreCurso(id, true))}</option>`).join('');
      sel.addEventListener('change', () => setCurso(sel.value));
    }

    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-nav');
    if (toggle && nav) {
      toggle.innerHTML = icon('menu');
      toggle.addEventListener('click', () => {
        const abierto = nav.classList.toggle('abierto');
        toggle.setAttribute('aria-expanded', abierto);
      });
    }

    const tema = document.getElementById('theme-toggle');
    if (tema) {
      const pintar = () => {
        const oscuro = document.documentElement.dataset.theme === 'dark';
        tema.innerHTML = icon(oscuro ? 'sun' : 'moon');
        tema.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      };
      pintar();
      tema.addEventListener('click', () => {
        const nuevo = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = nuevo;
        LS.set('tema-color', nuevo);
        pintar();
      });
    }

    const anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();

    aplicarCurso();
  }

  window.App = {
    get curso() { return curso; },
    params, LS, icon, esc, url, setURL, tex, renderMath, MACROS,
    setCurso, nombreCurso, temasDe, selectorCursos
  };

  iniciarCabecera();
})();
