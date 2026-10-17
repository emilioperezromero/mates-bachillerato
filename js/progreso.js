/* =========================================================================
   Progreso del alumno (se guarda solo en su navegador)
   ========================================================================= */
const Progreso = (() => {
  const CLAVE = 'mates-progreso-v1';

  function cargar() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || { ej: {} }; } catch (e) { return { ej: {} }; }
  }
  function guardar(d) {
    try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (e) { /* sin almacenamiento */ }
  }

  function registrar(id, nota, det) {
    const d = cargar();
    const r = d.ej[id] || { intentos: 0, mejor: 0, pistas: 0, soluciones: 0, errores: 0 };
    r.intentos++;
    r.ultima = nota;
    r.mejor = Math.max(r.mejor, nota);
    r.pistas += det.pistas;
    r.soluciones += det.soluciones;
    r.errores += det.errores;
    r.fecha = new Date().toISOString();
    d.ej[id] = r;
    guardar(d);
  }

  const de = id => cargar().ej[id] || null;

  function resumenTema(temaId) {
    const d = cargar();
    const ejs = EJERCICIOS.filter(e => e.tema === temaId);
    let hechos = 0, suma = 0;
    ejs.forEach(e => { const r = d.ej[e.id]; if (r) { hechos++; suma += r.mejor; } });
    return {
      total: ejs.length,
      hechos,
      media: hechos ? Math.round(suma / hechos) : 0,
      dominio: ejs.length ? Math.round(suma / ejs.length) : 0
    };
  }

  /* Siguiente ejercicio aconsejado de un tema: el primero sin hacer o el de peor nota */
  function siguienteDe(temaId) {
    const d = cargar();
    const ejs = EJERCICIOS.filter(e => e.tema === temaId);
    const pendiente = ejs.find(e => !d.ej[e.id]);
    if (pendiente) return pendiente;
    return ejs.slice().sort((a, b) => d.ej[a.id].mejor - d.ej[b.id].mejor)[0];
  }

  function recomendaciones(cursoId, max = 3) {
    const temas = App.temasDe(cursoId).map(t => Object.assign(t, resumenTema(t.id)));
    const recs = [];
    temas.filter(t => t.hechos > 0 && t.media < 60).forEach(t => recs.push({
      tema: t, prioridad: 0,
      titulo: `Repasa: ${t.titulo}`,
      texto: `Tu nota media es ${t.media}%. Relee los apuntes y repite los ejercicios con otros números.`
    }));
    temas.filter(t => t.hechos > 0 && t.media >= 60 && t.hechos < t.total).forEach(t => recs.push({
      tema: t, prioridad: 1,
      titulo: `Continúa con ${t.titulo}`,
      texto: `Llevas ${t.hechos} de ${t.total} ejercicios. ¡Vas bien!`
    }));
    temas.filter(t => t.hechos === 0 && t.total > 0).forEach(t => recs.push({
      tema: t, prioridad: 2,
      titulo: `Empieza: ${t.titulo}`,
      texto: 'Aún no has practicado este tema.'
    }));
    temas.filter(t => t.hechos === t.total && t.media >= 60 && t.media < 90).forEach(t => recs.push({
      tema: t, prioridad: 3,
      titulo: `Mejora tu nota en ${t.titulo}`,
      texto: `Tienes un ${t.media}%. Repite los ejercicios en los que usaste pistas.`
    }));
    return recs.sort((a, b) => a.prioridad - b.prioridad).slice(0, max)
      .map(r => Object.assign(r, { ejercicio: siguienteDe(r.tema.id) }));
  }

  function informe(cursoId, nombre) {
    const d = cargar();
    const c = CURSOS[cursoId];
    const lineas = [
      'INFORME DE PROGRESO · Mates Bachillerato',
      '========================================',
      `Alumno/a: ${nombre || '(sin nombre)'}`,
      `Curso: ${c.nivel} · ${c.modalidad} (${c.asignatura})`,
      `Fecha: ${new Date().toLocaleString('es-ES')}`,
      ''
    ];
    App.temasDe(cursoId).forEach(t => {
      const r = resumenTema(t.id);
      lineas.push(`■ ${t.titulo}: ${r.hechos}/${r.total} ejercicios · nota media ${r.media}%`);
      EJERCICIOS.filter(e => e.tema === t.id).forEach(e => {
        const x = d.ej[e.id];
        lineas.push(x
          ? `    - ${e.titulo}: mejor ${x.mejor}% (última ${x.ultima}%), ${x.intentos} intento(s), ${x.pistas} pista(s), ${x.soluciones} solución(es) vista(s)`
          : `    - ${e.titulo}: sin hacer`);
      });
      lineas.push('');
    });
    return lineas.join('\n');
  }

  function borrar() { guardar({ ej: {} }); }

  return { registrar, de, resumenTema, siguienteDe, recomendaciones, informe, borrar };
})();
