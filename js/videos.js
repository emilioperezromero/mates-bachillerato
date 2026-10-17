/* =========================================================================
   Página de vídeos
   ========================================================================= */
(function () {
  const root = document.getElementById('videos-app');
  const { icon, esc, url } = App;
  let filtro = App.params.get('tema') || '';

  /* Acepta el ID de YouTube o un enlace completo */
  function idYoutube(v) {
    if (!v) return '';
    const m = String(v).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : String(v).trim();
  }

  function render() {
    if (!App.curso) {
      root.innerHTML = `<div class="container section">
        <div class="page-head"><div class="eyebrow">Vídeos</div><h1>Elige tu curso</h1>
        <p>Verás los vídeos de los temas de tu curso.</p></div><div id="elige"></div></div>`;
      App.selectorCursos(document.getElementById('elige'));
      return;
    }
    const temas = App.temasDe(App.curso);
    if (filtro && !temas.some(t => t.id === filtro)) filtro = '';
    root.innerHTML = `
      <div class="container">
        <div class="page-head">
          <div class="eyebrow">${esc(App.nombreCurso(App.curso))}</div>
          <h1>Vídeos</h1>
          <p>Explicaciones en vídeo de cada tema. Después de verlos, ve a la práctica guiada para comprobar si lo has entendido.</p>
        </div>
        <div class="filtros" role="tablist">
          <button class="filtro${!filtro ? ' activo' : ''}" data-tema="">Todos</button>
          ${temas.map(t => `<button class="filtro${filtro === t.id ? ' activo' : ''}" data-tema="${t.id}">${esc(t.titulo)}</button>`).join('')}
        </div>
        <div class="video-grid"></div>
      </div>`;
    root.querySelectorAll('.filtro').forEach(b => b.addEventListener('click', () => {
      filtro = b.dataset.tema;
      root.querySelectorAll('.filtro').forEach(x => x.classList.toggle('activo', x === b));
      App.setURL({ tema: filtro });
      grid();
    }));
    grid();
  }

  function grid() {
    const temas = App.temasDe(App.curso).map(t => t.id);
    const lista = (window.VIDEOS || []).filter(v => temas.includes(v.tema) && (!filtro || v.tema === filtro));
    const g = root.querySelector('.video-grid');
    if (!lista.length) {
      g.innerHTML = `<div class="card vacio" style="grid-column:1/-1"><div class="icono">${icon('video')}</div><p class="muted">Todavía no hay vídeos en este tema.</p></div>`;
      return;
    }
    g.innerHTML = lista.map((v, i) => {
      const id = idYoutube(v.youtube);
      const busqueda = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(v.busqueda || v.titulo + ' bachillerato');
      return `<article class="card video-card">
        <div class="video-media">
          ${id ? `<button class="video-play" data-i="${i}" aria-label="Reproducir: ${esc(v.titulo)}">
              <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy">
              <span class="boton">${icon('play')}</span>
            </button>`
          : `<div class="video-pendiente">${icon('video')}<strong>Vídeo próximamente</strong><span style="font-size:.85rem">Mientras tanto, puedes buscar explicaciones en YouTube.</span></div>`}
        </div>
        <div class="video-info">
          <div class="chips"><span class="chip chip-accent">${esc(TEMAS[v.tema].titulo)}</span>${v.duracion ? `<span class="chip">${esc(v.duracion)}</span>` : ''}</div>
          <h3>${esc(v.titulo)}</h3>
          ${v.descripcion ? `<p>${esc(v.descripcion)}</p>` : ''}
          <div class="acciones">
            ${id ? `<a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">${icon('external')} Ver en YouTube</a>`
              : `<a href="${busqueda}" target="_blank" rel="noopener">${icon('search')} Buscar en YouTube</a>`}
            <a href="${url('practica.html', { tema: v.tema })}">${icon('target')} Practicar</a>
          </div>
        </div>
      </article>`;
    }).join('');
    g.querySelectorAll('.video-play').forEach(b => b.addEventListener('click', () => {
      const v = lista[+b.dataset.i];
      const id = idYoutube(v.youtube);
      b.parentElement.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${esc(v.titulo)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    }));
  }

  document.addEventListener('curso-cambiado', () => { filtro = ''; render(); });
  render();
})();
