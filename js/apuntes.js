/* =========================================================================
   Página de apuntes (los datos están en data/apuntes.js)
   ========================================================================= */
(function () {
  const root = document.getElementById('apuntes-app');
  const { icon, esc, url } = App;
  const APUNTES = window.APUNTES || [];
  let sel = App.params.get('ap');
  const temaPedido = App.params.get('tema'); // enlaces desde la práctica

  const delCurso = () => APUNTES.filter(a => a.cursos.includes(App.curso));

  function render() {
    if (!App.curso) {
      root.innerHTML = `<div class="container section">
        <div class="page-head"><div class="eyebrow">Apuntes</div><h1>Elige tu curso</h1>
        <p>Verás los apuntes de los temas de tu curso y modalidad.</p></div><div id="elige"></div></div>`;
      App.selectorCursos(document.getElementById('elige'));
      return;
    }
    const lista = delCurso();
    if (!lista.some(a => a.id === sel)) {
      const delTema = temaPedido && lista.find(a => a.practicar === temaPedido);
      sel = (delTema || lista[0] || {}).id;
    }
    root.innerHTML = `<div class="container layout"><aside class="sidebar" id="side"></aside><section id="main"></section></div>`;
    lateral();
    mostrar(sel);
  }

  function lateral() {
    const lista = delCurso();
    const bloques = [...new Set(lista.map(a => a.bloque))];
    const side = document.getElementById('side');
    side.innerHTML = bloques.map(b => `<div class="side-group"><h4>${esc(b)}</h4>
      ${lista.filter(a => a.bloque === b).map(a => `<button class="side-link${a.id === sel ? ' activo' : ''}" data-ap="${a.id}">${esc(a.titulo)}</button>`).join('')}
    </div>`).join('');
    side.querySelectorAll('[data-ap]').forEach(b => b.addEventListener('click', () => {
      sel = b.dataset.ap;
      lateral();
      mostrar(sel);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
  }

  function mostrar(id) {
    const main = document.getElementById('main');
    const ap = APUNTES.find(a => a.id === id);
    if (!ap) {
      main.innerHTML = `<div class="card vacio"><div class="icono">${icon('book')}</div><p class="muted">Todavía no hay apuntes para este curso.</p></div>`;
      return;
    }
    App.setURL({ ap: id });
    const practicable = ap.practicar && App.temasDe(App.curso).some(t => t.id === ap.practicar);
    main.innerHTML = `
      <div class="tema-head">
        <div class="eyebrow">${esc(ap.bloque)}</div>
        <h1>${esc(ap.titulo)}</h1>
        ${ap.resumen ? `<p>${esc(ap.resumen)}</p>` : ''}
        <div class="btn-row no-print">
          ${practicable ? `<a class="btn btn-primary btn-sm" href="${url('practica.html', { tema: ap.practicar })}">${icon('target')} Practicar</a>
          <a class="btn btn-soft btn-sm" href="${url('videos.html', { tema: ap.practicar })}">${icon('video')} Vídeos</a>` : ''}
          ${ap.pdf ? `<a class="btn btn-sm" href="${esc(ap.pdf)}" target="_blank" rel="noopener">${icon('file')} PDF</a>` : ''}
          <button class="btn btn-ghost btn-sm b-print">${icon('print')} Imprimir</button>
        </div>
      </div>
      <nav class="card toc" hidden><h4>En este tema</h4><ol></ol></nav>
      <article class="card apunte">${LatexHTML.convert(ap.latex)}</article>`;
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

  document.addEventListener('curso-cambiado', () => { sel = null; render(); });
  render();
})();
