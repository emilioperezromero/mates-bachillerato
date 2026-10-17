/* =========================================================================
   Página de inicio
   ========================================================================= */
(function () {
  const { icon, esc, url } = App;

  function pintar() {
    App.selectorCursos(document.getElementById('cursos'));
    document.querySelectorAll('[data-href]').forEach(a => { a.href = url(a.dataset.href); });
    progreso();
  }

  function progreso() {
    const cont = document.getElementById('progreso');
    if (!App.curso) {
      cont.innerHTML = `<div class="card vacio"><div class="icono">${icon('target')}</div>
        <h3>Elige tu curso para ver tu progreso</h3><p class="muted">Selecciona una de las tarjetas de arriba.</p></div>`;
      return;
    }
    const temas = App.temasDe(App.curso);
    const recs = Progreso.recomendaciones(App.curso, 3);
    const nombre = App.LS.get('nombre-alumno', '');
    cont.innerHTML = `
      <div class="progreso-panel">
        <div class="card">
          <h3>Tus temas · ${esc(App.nombreCurso(App.curso))}</h3>
          ${temas.map(t => {
            const r = Progreso.resumenTema(t.id);
            return `<div class="tema-progreso">
              <span class="nombre">${esc(t.titulo)}</span>
              <span class="dato">${r.hechos}/${r.total} · ${r.hechos ? r.media + '%' : 'sin empezar'}</span>
              <div class="barra"><span style="width:${r.dominio}%"></span></div>
            </div>`;
          }).join('')}
        </div>
        <div class="card">
          <h3>${icon('sparkles')} Siguiente paso</h3>
          ${recs.map(r => `<a class="recomendacion" href="${url('practica.html', { tema: r.tema.id, ej: r.ejercicio && r.ejercicio.id })}">
            <span class="icono">${icon('arrowR')}</span>
            <span><strong>${esc(r.titulo)}</strong><span>${esc(r.texto)}</span></span></a>`).join('') || '<p class="muted">¡Lo dominas todo! Repite ejercicios para no perder práctica.</p>'}
          <div class="informe-form">
            <label class="sr-only" for="nombre">Tu nombre</label>
            <input id="nombre" class="input" placeholder="Tu nombre y apellidos" value="${esc(nombre)}">
            <button class="btn btn-sm b-informe">${icon('download')} Descargar informe</button>
          </div>
          <p class="muted" style="font-size:.82rem;margin:8px 0 0">El progreso se guarda solo en este navegador. Descarga el informe si tu profesor/a te lo pide.</p>
        </div>
      </div>`;
    const input = cont.querySelector('#nombre');
    input.addEventListener('change', () => App.LS.set('nombre-alumno', input.value.trim()));
    cont.querySelector('.b-informe').addEventListener('click', () => {
      const n = input.value.trim();
      App.LS.set('nombre-alumno', n);
      const blob = new Blob([Progreso.informe(App.curso, n)], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `informe-${(n || 'alumno').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}-${App.curso}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
  }

  document.addEventListener('curso-cambiado', pintar);
  pintar();
})();
