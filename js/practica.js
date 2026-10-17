/* =========================================================================
   Práctica guiada: lista de ejercicios y resolución paso a paso
   ========================================================================= */
(function () {
  const root = document.getElementById('practica-app');
  const { icon, esc, url } = App;
  const val = (x, p) => (typeof x === 'function' ? x(p) : x);
  const NIVELES = ['', 'Básico', 'Medio', 'Avanzado'];
  const MENSAJES_ERROR = [
    'No es correcto. Revisa tus cálculos con calma.',
    'Todavía no. Vuelve a leer lo que pide este paso.',
    'Sigue sin ser correcto. Una pista te puede ayudar.'
  ];

  let temaSel = App.params.get('tema');
  let ejSel = App.params.get('ej');

  const ejerciciosDe = temaId => EJERCICIOS.filter(e => e.tema === temaId);
  const temasCurso = () => App.temasDe(App.curso);
  const hayApuntes = temaId => (window.APUNTES_INDICE || [])
    .some(a => a.practicar === temaId && a.cursos.includes(App.curso));

  function render() {
    if (!App.curso) {
      root.innerHTML = `<div class="container section">
        <div class="page-head"><div class="eyebrow">Práctica guiada</div><h1>Elige tu curso para empezar</h1>
        <p>Te mostraremos los ejercicios de tu curso y modalidad.</p></div><div id="elige"></div></div>`;
      App.selectorCursos(document.getElementById('elige'));
      return;
    }
    const temas = temasCurso();
    if (!temas.some(t => t.id === temaSel)) temaSel = null;
    root.innerHTML = `<div class="container layout"><aside class="sidebar" id="side"></aside><section id="main"></section></div>`;
    const ej = EJERCICIOS.find(e => e.id === ejSel && temas.some(t => t.id === e.tema));
    if (ej) abrir(ej);
    else if (temaSel) lista(temaSel);
    else portada();
  }

  function pintarLateral() {
    const side = document.getElementById('side');
    const temas = temasCurso();
    const bloques = [...new Set(temas.map(t => t.bloque))];
    side.innerHTML = `
      <div class="side-group">
        <button class="side-link${!temaSel ? ' activo' : ''}" data-tema=""><span>${icon('sparkles')} Mi plan de práctica</span></button>
      </div>
      ${bloques.map(b => `<div class="side-group"><h4>${esc(b)}</h4>
        ${temas.filter(t => t.bloque === b).map(t => {
          const r = Progreso.resumenTema(t.id);
          return `<button class="side-link${t.id === temaSel ? ' activo' : ''}" data-tema="${t.id}">
            <span>${esc(t.titulo)}</span>
            <span class="mini"><span class="barra"><span style="width:${r.dominio}%"></span></span>${r.hechos}/${r.total}</span>
          </button>`;
        }).join('')}</div>`).join('')}`;
    side.querySelectorAll('[data-tema]').forEach(b => b.addEventListener('click', () => {
      temaSel = b.dataset.tema || null;
      ejSel = null;
      if (temaSel) lista(temaSel); else portada();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
  }

  /* ---------- Portada: plan personalizado ---------- */
  function portada() {
    temaSel = null; ejSel = null;
    App.setURL();
    pintarLateral();
    const main = document.getElementById('main');
    const recs = Progreso.recomendaciones(App.curso, 3);
    const temas = temasCurso();
    main.innerHTML = `
      <div class="tema-head">
        <div class="eyebrow">${esc(App.nombreCurso(App.curso))}</div>
        <h1>Mi plan de práctica</h1>
        <p>Resuelve los ejercicios paso a paso. Si te equivocas, te diremos qué ha fallado y podrás pedir pistas. Cada vez que repitas un ejercicio, los números cambian.</p>
      </div>
      <div class="card" style="margin-bottom:20px">
        <h3>${icon('target')} Te recomendamos ahora</h3>
        ${recs.length ? recs.map(r => `<a class="recomendacion" href="#" data-ej="${r.ejercicio ? r.ejercicio.id : ''}" data-tema="${r.tema.id}">
            <span class="icono">${icon('arrowR')}</span>
            <span><strong>${esc(r.titulo)}</strong><span>${esc(r.texto)}${r.ejercicio ? ` Siguiente: «${esc(r.ejercicio.titulo)}».` : ''}</span></span>
          </a>`).join('') : `<p class="muted">¡Enhorabuena! Dominas todos los temas de tu curso. Repite ejercicios para mantener la práctica.</p>`}
      </div>
      <div class="ej-grid">
        ${temas.map(t => {
          const r = Progreso.resumenTema(t.id);
          return `<button class="card ej-card" data-tema="${t.id}">
            <div class="chips"><span class="chip">${esc(t.bloque)}</span></div>
            <h3>${esc(t.titulo)}</h3>
            <p class="muted" style="margin:0;font-size:.92rem">${esc(t.resumen)}</p>
            <div class="barra" style="margin-top:6px"><span style="width:${r.dominio}%"></span></div>
            <div class="pie"><span>${r.hechos}/${r.total} ejercicios</span><span>${r.hechos ? `Media ${r.media}%` : 'Sin empezar'}</span></div>
          </button>`;
        }).join('')}
      </div>`;
    main.querySelectorAll('.recomendacion').forEach(a => a.addEventListener('click', ev => {
      ev.preventDefault();
      const ej = EJERCICIOS.find(e => e.id === a.dataset.ej);
      if (ej) abrir(ej); else lista(a.dataset.tema);
    }));
    main.querySelectorAll('.ej-card[data-tema]').forEach(b => b.addEventListener('click', () => lista(b.dataset.tema)));
  }

  /* ---------- Lista de ejercicios de un tema ---------- */
  function lista(temaId) {
    temaSel = temaId; ejSel = null;
    App.setURL({ tema: temaId });
    pintarLateral();
    const t = TEMAS[temaId];
    const ejs = ejerciciosDe(temaId);
    const main = document.getElementById('main');
    main.innerHTML = `
      <div class="tema-head">
        <div class="eyebrow">${esc(t.bloque)}</div>
        <h1>${esc(t.titulo)}</h1>
        <p>${esc(t.resumen)}</p>
        <div class="btn-row">
          ${hayApuntes(temaId) ? `<a class="btn btn-soft btn-sm" href="${url('apuntes.html', { tema: temaId })}">${icon('book')} Apuntes del tema</a>` : ''}
          <a class="btn btn-soft btn-sm" href="${url('videos.html', { tema: temaId })}">${icon('video')} Vídeos del tema</a>
        </div>
      </div>
      ${ejs.length ? `<div class="ej-grid">${ejs.map(e => {
        const r = Progreso.de(e.id);
        return `<button class="card ej-card" data-ej="${e.id}">
          <div class="chips">
            <span class="chip chip-accent">${e.tipo === 'concepto' ? 'Comprensión' : 'Paso a paso'}</span>
            ${e.generar ? `<span class="chip">${icon('shuffle')} Números aleatorios</span>` : ''}
          </div>
          <h3>${esc(e.titulo)}</h3>
          <div class="pie">
            <span class="nivel" title="Nivel ${NIVELES[e.nivel || 1]}">${[1, 2, 3].map(n => `<i class="${n <= (e.nivel || 1) ? 'on' : ''}"></i>`).join('')}&nbsp;${NIVELES[e.nivel || 1]}</span>
            ${r ? `<span class="chip ${r.mejor >= 80 ? 'chip-ok' : 'chip-warn'}">Mejor: ${r.mejor}%</span>` : `<span>${e.pasos.length} pasos</span>`}
          </div>
        </button>`;
      }).join('')}</div>` : `<div class="card vacio"><p class="muted">Todavía no hay ejercicios en este tema.</p></div>`}`;
    main.querySelectorAll('[data-ej]').forEach(b => b.addEventListener('click', () => {
      abrir(EJERCICIOS.find(e => e.id === b.dataset.ej));
    }));
  }

  /* ---------- Feedback ---------- */
  const ICONO_FB = { ok: 'checkCircle', err: 'x', warn: 'alert', pista: 'bulb' };
  function fb(el, tipo, html, anadir = false) {
    const div = document.createElement('div');
    div.className = `fb fb-${tipo}`;
    div.innerHTML = `${icon(ICONO_FB[tipo])}<div>${html}</div>`;
    if (!anadir) el.innerHTML = '';
    el.appendChild(div);
    App.renderMath(div);
    return div;
  }

  /* ---------- Reproductor de un ejercicio ---------- */
  function abrir(ej) {
    temaSel = ej.tema; ejSel = ej.id;
    App.setURL({ tema: ej.tema, ej: ej.id });
    pintarLateral();
    const main = document.getElementById('main');
    const p = ej.generar ? ej.generar() : {};
    const N = ej.pasos.length;
    const estado = ej.pasos.map(() => ({ errores: 0, pistas: 0, solucion: false, ok: false }));

    main.innerHTML = `
      <div class="player">
        <button class="btn-link volver">${icon('arrowL')} ${esc(TEMAS[ej.tema].titulo)}</button>
        <div class="player-head">
          <div class="chips">
            <span class="chip chip-accent">${ej.tipo === 'concepto' ? 'Comprensión de conceptos' : 'Ejercicio paso a paso'}</span>
            <span class="chip">${NIVELES[ej.nivel || 1]}</span>
          </div>
          <h1>${esc(ej.titulo)}</h1>
        </div>
        <div class="pasos-progreso"><div class="barra"><span style="width:0%"></span></div><span class="txt">Paso 1 de ${N}</span></div>
        ${ej.enunciado ? `<div class="card enunciado">
          <div class="etiqueta">${ej.tipo === 'concepto' ? 'Antes de empezar' : 'Enunciado'}</div>
          <div class="enunciado-texto">${val(ej.enunciado, p)}</div>
          ${ej.figura ? `<div class="figura">${ej.figura(p)}</div>` : ''}
        </div>` : ''}
        <div class="pasos"></div>
        <div class="final"></div>
      </div>`;
    main.querySelector('.volver').addEventListener('click', () => lista(ej.tema));
    App.renderMath(main.querySelector('.enunciado'));
    const cont = main.querySelector('.pasos');
    const barra = main.querySelector('.pasos-progreso .barra span');
    const txt = main.querySelector('.pasos-progreso .txt');
    window.scrollTo({ top: 0 });

    mostrarPaso(0);

    function mostrarPaso(k) {
      const paso = ej.pasos[k];
      const st = estado[k];
      const tipo = paso.tipo || 'num';
      const pistas = (paso.pistas || []).map(h => val(h, p));
      const respuesta = val(paso.respuesta, p);
      txt.textContent = `Paso ${k + 1} de ${N}`;

      const el = document.createElement('div');
      el.className = 'card paso activo';
      el.innerHTML = `
        <div class="paso-num">Paso ${k + 1}</div>
        <div class="paso-texto">${val(paso.texto, p)}</div>
        <div class="zona"></div>
        <div class="paso-acciones">
          ${pistas.length ? `<button class="btn btn-ghost btn-sm b-pista">${icon('bulb')} <span>Pista (0/${pistas.length})</span></button>` : ''}
          <button class="btn btn-ghost btn-sm b-sol" hidden>${icon('eye')} Ver solución</button>
        </div>
        <div class="ayudas"></div>
        <div class="feedback" aria-live="polite"></div>`;
      cont.appendChild(el);
      const zona = el.querySelector('.zona');
      const feedback = el.querySelector('.feedback');
      const ayudas = el.querySelector('.ayudas');
      const bPista = el.querySelector('.b-pista');
      const bSol = el.querySelector('.b-sol');
      let leerEntrada = () => null;
      let mostrarDada = () => '';

      /* --- Zona de respuesta según el tipo --- */
      if (tipo === 'opcion') {
        const opciones = val(paso.opciones, p);
        zona.innerHTML = `<div class="opciones">${opciones.map((o, i) =>
          `<button class="opcion" data-i="${i}"><span class="letra">${'ABCDEF'[i]}</span><span>${o.t}</span></button>`).join('')}</div>`;
        zona.querySelectorAll('.opcion').forEach(b => b.addEventListener('click', () => {
          const o = opciones[+b.dataset.i];
          if (o.ok) {
            b.classList.add('bien');
            zona.querySelectorAll('.opcion').forEach(x => { x.disabled = true; });
            resuelto(o.fb || val(paso.explicacion, p));
          } else {
            b.classList.add('mal');
            b.disabled = true;
            st.errores++;
            fb(feedback, 'err', `<span class="fb-titulo">No es esta.</span>${o.fb || MENSAJES_ERROR[0]}`);
            if (st.errores >= 2) bSol.hidden = false;
          }
        }));
      } else if (tipo === 'matriz') {
        const filas = respuesta.length, cols = respuesta[0].length;
        zona.innerHTML = `<div class="matriz-wrap">
          ${paso.prefijo ? `<span class="prefijo">${val(paso.prefijo, p)}</span>` : ''}
          <div class="matriz" style="grid-template-columns:repeat(${cols}, auto)">
            ${Array.from({ length: filas * cols }, (_, i) => `<input class="input" inputmode="text" autocomplete="off" aria-label="Fila ${Math.floor(i / cols) + 1}, columna ${i % cols + 1}">`).join('')}
          </div>
          <button class="btn btn-primary b-comp">${icon('check')} Comprobar</button>
        </div>
        <div class="ayuda-formato">Escribe un número en cada casilla. Puedes usar fracciones: <code>-1/3</code>.</div>`;
        const inputs = [...zona.querySelectorAll('.matriz .input')];
        leerEntrada = () => {
          if (inputs.some(i => !i.value.trim())) return null;
          return Array.from({ length: filas }, (_, i) => inputs.slice(i * cols, i * cols + cols).map(x => x.value));
        };
        mostrarDada = m => '\\begin{pmatrix}' + m.map(f => f.map(v => { try { return Mates.tex(v); } catch (e) { return v; } }).join(' & ')).join(' \\\\ ') + '\\end{pmatrix}';
        inputs.forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') comprobar(); }));
        zona.querySelector('.b-comp').addEventListener('click', comprobar);
        setTimeout(() => inputs[0].focus({ preventScroll: true }), 50);
      } else {
        const placeholder = {
          num: 'Escribe un número (p. ej. -3, 2/5, 0,75)',
          expr: 'p. ej. 3x^2 - 2x + 1',
          lista: tipo === 'lista' && paso.ordenada ? 'p. ej. 3; -2' : 'Separa los valores con ;'
        }[tipo];
        const ayuda = {
          num: 'Puedes escribir fracciones (<code>3/4</code>), decimales con coma o punto, <code>pi</code> y <code>sqrt(2)</code>.',
          expr: 'Potencias con <code>^</code> (x^2), multiplicación con <code>*</code> o sin signo (3x), raíz: <code>sqrt(x)</code>, <code>sen(x)</code>, <code>ln(x)</code>, <code>e^x</code>.',
          lista: 'Separa los valores con punto y coma: <code>2; -3</code>. Si usas decimales, escríbelos con punto.'
        }[tipo];
        zona.innerHTML = `
          <div class="resp-fila">
            ${paso.prefijo ? `<span class="prefijo">${val(paso.prefijo, p)}</span>` : ''}
            <input class="input resp" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${placeholder}" aria-label="Tu respuesta">
            <button class="btn btn-primary b-comp">${icon('check')} Comprobar</button>
          </div>
          <div class="preview"></div>
          <div class="ayuda-formato">${paso.ayuda || ayuda}</div>`;
        const input = zona.querySelector('.resp');
        const preview = zona.querySelector('.preview');
        leerEntrada = () => (input.value.trim() ? input.value.trim() : null);
        mostrarDada = v => {
          if (tipo === 'lista') return v.split(/;/).map(x => { try { return Mates.tex(x); } catch (e) { return x; } }).join(';\\ ');
          try { return Mates.tex(v); } catch (e) { return '\\text{' + v.replace(/[\\{}$&#^_%~]/g, '') + '}'; }
        };
        input.addEventListener('input', () => {
          const v = input.value.trim();
          if (!v) { preview.innerHTML = ''; return; }
          try {
            const t = mostrarDada(v);
            if (tipo !== 'lista') Mates.parse(v);
            preview.innerHTML = '<span>Has escrito:</span><span class="pv"></span>';
            App.tex(t, preview.querySelector('.pv'));
          } catch (e) {
            preview.innerHTML = '<span>…</span>';
          }
        });
        input.addEventListener('keydown', e => { if (e.key === 'Enter') comprobar(); });
        zona.querySelector('.b-comp').addEventListener('click', comprobar);
        setTimeout(() => input.focus({ preventScroll: true }), 50);
      }
      App.renderMath(el);

      /* --- Pistas y solución --- */
      if (bPista) bPista.addEventListener('click', () => {
        if (st.pistas >= pistas.length) return;
        st.pistas++;
        fb(ayudas, 'pista', `<span class="fb-titulo">Pista ${st.pistas}</span>${pistas[st.pistas - 1]}`, true);
        bPista.classList.remove('destacar');
        bPista.querySelector('span').textContent = `Pista (${st.pistas}/${pistas.length})`;
        if (st.pistas >= pistas.length) { bPista.disabled = true; bSol.hidden = false; }
      });
      bSol.addEventListener('click', () => {
        st.solucion = true;
        let sol = val(paso.sol, p);
        if (!sol) {
          if (tipo === 'num') sol = Mates.numTex(Mates.numero(respuesta));
          else if (tipo === 'expr') sol = Mates.tex(respuesta);
          else if (tipo === 'lista') sol = (paso.ordenada ? '\\left(' : '') + respuesta.map(v => Mates.numTex(Mates.numero(v))).join(paso.ordenada ? ',\\ ' : ';\\quad ') + (paso.ordenada ? '\\right)' : '');
          else if (tipo === 'matriz') sol = '\\begin{pmatrix}' + respuesta.map(f => f.map(v => Mates.numTex(Mates.numero(v))).join(' & ')).join(' \\\\ ') + '\\end{pmatrix}';
        }
        let solHtml;
        if (tipo === 'opcion') {
          const ok = val(paso.opciones, p).find(o => o.ok);
          solHtml = `La respuesta correcta es: <strong>${ok.t}</strong>`;
          zona.querySelectorAll('.opcion').forEach(x => { x.disabled = true; });
        } else {
          solHtml = `La respuesta es: $${paso.prefijo ? '' : '\\;'}${sol}$`;
        }
        el.querySelectorAll('input, .b-comp').forEach(x => { x.disabled = true; });
        terminarPaso('visto', `<span class="fb-titulo">Solución</span>${solHtml}${paso.explicacion ? `<p style="margin-top:8px">${val(paso.explicacion, p)}</p>` : ''}`);
      });

      /* --- Comprobar respuesta --- */
      function comprobar() {
        const entrada = leerEntrada();
        if (entrada == null) { fb(feedback, 'warn', tipo === 'matriz' ? 'Rellena todas las casillas.' : 'Escribe tu respuesta antes de comprobar.'); return; }
        let ok;
        try {
          ok = Mates.comprobar(paso, respuesta, entrada);
        } catch (e) {
          fb(feedback, 'warn', `<span class="fb-titulo">No entiendo tu respuesta</span>${esc(e.message)}. No cuenta como fallo.`);
          return;
        }
        if (ok) {
          el.querySelectorAll('input, .b-comp').forEach(x => { x.disabled = true; });
          const dada = mostrarDada(entrada);
          resuelto(val(paso.explicacion, p), dada);
          return;
        }
        st.errores++;
        const error = (paso.errores || []).find(er => {
          try { return Mates.comprobar(paso, val(er.r, p), entrada); } catch (e) { return false; }
        });
        let msg = error
          ? `<span class="fb-titulo">Casi… pero hay un error típico</span>${val(error.msg, p)}`
          : `<span class="fb-titulo">No es correcto</span>${MENSAJES_ERROR[Math.min(st.errores - 1, MENSAJES_ERROR.length - 1)]}`;
        if (st.errores >= 2 && bPista && st.pistas < pistas.length) {
          bPista.classList.add('destacar');
          msg += ' Pulsa <strong>Pista</strong> si te atascas.';
        }
        if (st.errores >= 3 || (!pistas.length && st.errores >= 2)) bSol.hidden = false;
        fb(feedback, 'err', msg);
      }

      function resuelto(explicacion, dada) {
        st.ok = true;
        const pre = dada ? `<div class="respuesta-dada">Tu respuesta: $${dada}$</div>` : '';
        const titulo = st.errores === 0 && st.pistas === 0 ? '¡Correcto a la primera!' : '¡Correcto!';
        terminarPaso('hecho', `<span class="fb-titulo">${titulo}</span>${pre}${explicacion || ''}`);
      }

      function terminarPaso(clase, html) {
        el.classList.remove('activo');
        el.classList.add(clase);
        el.querySelector('.paso-num').innerHTML = `${icon(clase === 'hecho' ? 'check' : 'eye')} Paso ${k + 1} · ${clase === 'hecho' ? 'resuelto' : 'solución vista'}`;
        el.querySelector('.paso-acciones').remove();
        el.querySelectorAll('.preview, .ayuda-formato').forEach(x => x.remove());
        fb(feedback, clase === 'hecho' ? 'ok' : 'warn', html);
        barra.style.width = `${Math.round(((k + 1) / N) * 100)}%`;
        if (k + 1 < N) {
          mostrarPaso(k + 1);
          setTimeout(() => cont.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
        } else {
          setTimeout(terminar, 300);
        }
      }
    }

    /* --- Resultado final --- */
    function terminar() {
      txt.textContent = 'Completado';
      const puntos = estado.map(s => (s.solucion ? 0 : Math.max(0.3, 1 - 0.25 * s.errores - 0.2 * s.pistas)));
      const nota = Math.round((puntos.reduce((a, b) => a + b, 0) / N) * 100);
      Progreso.registrar(ej.id, nota, {
        pistas: estado.reduce((a, s) => a + s.pistas, 0),
        soluciones: estado.filter(s => s.solucion).length,
        errores: estado.reduce((a, s) => a + s.errores, 0)
      });
      pintarLateral();
      const mensaje = nota >= 90 ? '¡Excelente! Dominas este tipo de ejercicio.'
        : nota >= 70 ? '¡Muy bien! Repítelo con otros números para afianzarlo.'
        : nota >= 40 ? 'Vas por buen camino. Fíjate en los pasos donde te has equivocado y vuelve a intentarlo.'
        : 'Este ejercicio todavía te cuesta. Repasa los apuntes y vuelve a intentarlo: con otros números será otra oportunidad.';
      const ejs = ejerciciosDe(ej.tema);
      const sig = ejs[ejs.indexOf(ej) + 1];
      const final = main.querySelector('.final');
      final.innerHTML = `
        <div class="card resultado">
          <div class="anillo" style="--p:${nota}"><span>${nota}%</span></div>
          <h2>${nota >= 70 ? '¡Ejercicio completado!' : 'Ejercicio terminado'}</h2>
          <p class="muted">${mensaje}</p>
          <ul class="resumen-pasos">${estado.map((s, i) => {
            const [cls, ic, t] = s.solucion ? ['no', 'eye', 'Solución vista']
              : s.errores === 0 && s.pistas === 0 ? ['ok', 'checkCircle', 'Correcto a la primera']
              : ['medio', 'checkCircle', `Correcto con ayuda (${s.errores} fallo${s.errores === 1 ? '' : 's'}, ${s.pistas} pista${s.pistas === 1 ? '' : 's'})`];
            return `<li><span class="${cls}">${icon(ic)}</span> Paso ${i + 1}: ${t}</li>`;
          }).join('')}</ul>
          ${nota < 60 && hayApuntes(ej.tema) ? `<p><a href="${url('apuntes.html', { tema: ej.tema })}">${icon('book')} Repasar los apuntes de ${esc(TEMAS[ej.tema].titulo)}</a></p>` : ''}
          <div class="btn-row">
            <button class="btn b-rep">${icon('refresh')} ${ej.generar ? 'Repetir con otros números' : 'Repetir'}</button>
            ${sig ? `<button class="btn btn-primary b-sig">Siguiente ejercicio ${icon('arrowR')}</button>` : `<button class="btn btn-primary b-lista">Volver al tema ${icon('arrowR')}</button>`}
          </div>
        </div>`;
      final.querySelector('.b-rep').addEventListener('click', () => abrir(ej));
      const bs = final.querySelector('.b-sig');
      if (bs) bs.addEventListener('click', () => abrir(sig));
      const bl = final.querySelector('.b-lista');
      if (bl) bl.addEventListener('click', () => lista(ej.tema));
      final.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  document.addEventListener('curso-cambiado', () => { temaSel = null; ejSel = null; render(); });
  render();
})();
