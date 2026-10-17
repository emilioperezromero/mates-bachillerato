/* =========================================================================
   Página de apuntes
   ========================================================================= */
(function () {
  const root = document.getElementById('apuntes-app');
  const { icon, esc, url } = App;
  let temaSel = App.params.get('tema');

  function render() {
    if (!App.curso) {
      root.innerHTML = `<div class="container section">
        <div class="page-head"><div class="eyebrow">Apuntes</div><h1>Elige tu curso</h1>
        <p>Verás los apuntes de los temas de tu curso y modalidad.</p></div><div id="elige"></div></div>`;
      App.selectorCursos(document.getElementById('elige'));
      return;
    }
    const temas = App.temasDe(App.curso);
    if (!temas.some(t => t.id === temaSel)) temaSel = temas[0] && temas[0].id;
    root.innerHTML = `<div class="container layout"><aside class="sidebar" id="side"></aside><section id="main"></section></div>`;
    lateral();
    mostrar(temaSel);
  }

  function lateral() {
    const temas = App.temasDe(App.curso);
    const bloques = [...new Set(temas.map(t => t.bloque))];
    const side = document.getElementById('side');
    side.innerHTML = bloques.map(b => `<div class="side-group"><h4>${esc(b)}</h4>
      ${temas.filter(t => t.bloque === b).map(t => `<button class="side-link${t.id === temaSel ? ' activo' : ''}" data-tema="${t.id}">${esc(t.titulo)}</button>`).join('')}
    </div>`).join('');
    side.querySelectorAll('[data-tema]').forEach(b => b.addEventListener('click', () => {
      temaSel = b.dataset.tema;
      lateral();
      mostrar(temaSel);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
  }

  function mostrar(temaId) {
    App.setURL({ tema: temaId });
    const t = TEMAS[temaId];
    const ap = (window.APUNTES || {})[temaId] || {};
    const main = document.getElementById('main');
    main.innerHTML = `
      <div class="tema-head">
        <div class="eyebrow">${esc(t.bloque)}</div>
        <h1>${esc(t.titulo)}</h1>
        <p>${esc(t.resumen)}</p>
        <div class="btn-row no-print">
          <a class="btn btn-primary btn-sm" href="${url('practica.html', { tema: temaId })}">${icon('target')} Practicar este tema</a>
          <a class="btn btn-soft btn-sm" href="${url('videos.html', { tema: temaId })}">${icon('video')} Vídeos</a>
          ${ap.pdf ? `<a class="btn btn-sm" href="${esc(ap.pdf)}" target="_blank" rel="noopener">${icon('file')} PDF</a>` : ''}
          <button class="btn btn-ghost btn-sm b-print">${icon('print')} Imprimir</button>
        </div>
      </div>
      <nav class="card toc" hidden><h4>En este tema</h4><ol></ol></nav>
      <article class="card apunte">${ap.latex ? LatexHTML.convert(ap.latex)
        : `<div class="vacio"><div class="icono">${icon('book')}</div><p class="muted">Los apuntes de este tema estarán disponibles pronto.</p></div>`}</article>`;
    main.querySelector('.b-print').addEventListener('click', () => window.print());
    const art = main.querySelector('.apunte');
    App.renderMath(art);
    const h2 = [...art.querySelectorAll('h2')];
    if (h2.length > 1) {
      const toc = main.querySelector('.toc');
      toc.hidden = false;
      toc.querySelector('ol').innerHTML = h2.map(h => `<li><a href="#${h.id}">${h.innerHTML}</a></li>`).join('');
      toc.querySelectorAll('a').forEach(a => a.addEventListener('click', e => {
        e.preventDefault();
        const destino = document.getElementById(a.getAttribute('href').slice(1));
        if (destino) destino.scrollIntoView({ behavior: 'smooth' });
      }));
    }
  }

  document.addEventListener('curso-cambiado', () => { temaSel = null; render(); });
  render();
})();
