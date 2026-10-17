/* =========================================================================
   BANCO DE EJERCICIOS GUIADOS
   -------------------------------------------------------------------------
   Cada ejercicio:
     id        identificador único (sin espacios)
     tema      identificador del tema (ver data/cursos.js)
     tipo      'guiado' (paso a paso) o 'concepto' (comprensión)
     nivel     1 básico · 2 medio · 3 avanzado
     titulo    texto corto
     generar   (opcional) función que devuelve números aleatorios {a, b, ...}
     enunciado texto con LaTeX entre $...$ (puede usar los números: p => ...)
     figura    (opcional) función que devuelve un SVG
     pasos     lista de pasos

   Cada paso:
     texto       lo que se pregunta
     tipo        'num' (número) · 'expr' (expresión con x) · 'lista' (varios
                 números) · 'matriz' · 'opcion' (elegir una respuesta)
     respuesta   la respuesta correcta (número, texto de expresión, lista o matriz)
     prefijo     (opcional) LaTeX delante de la casilla, p. ej. "$f'(x)=$"
     pistas      lista de pistas, de menos a más ayuda
     errores     lista de errores típicos: { r: respuesta errónea, msg: explicación }
     explicacion se muestra al acertar o al ver la solución
     sol         (opcional) LaTeX de la solución si se quiere escribir a mano
     tol         (opcional) margen de error admitido (p. ej. 0.01 para céntimos)
     vars        (expr) letras permitidas, por defecto ['x']
     modo        (expr) 'primitiva' admite cualquier constante +C
     ordenada    (lista) true si el orden importa (coordenadas de un punto)
     opciones    (opcion) lista de { t: texto, ok: true/false, fb: comentario }

   Consejo: usa L`...` para escribir LaTeX sin duplicar las barras invertidas.
   ========================================================================= */

const L = String.raw;

/* ---------- Utilidades para generar números y escribir LaTeX ---------- */
const R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  nz(a, b) { let v; do { v = R.int(a, b); } while (v === 0); return v; },
  pick: arr => arr[Math.floor(Math.random() * arr.length)]
};
const mcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
/* número en LaTeX con coma decimal */
const nt = (x, dec = 4) => String(Math.round(x * 10 ** dec) / 10 ** dec).replace('.', '{,}');
/* euros con dos decimales y separador de miles */
const eur = x => {
  const [e, d] = Math.abs(x).toFixed(2).split('.');
  return (x < 0 ? '-' : '') + e.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') + '{,}' + d;
};
/* fracción simplificada en LaTeX */
const fr = (n, d) => {
  if (d < 0) { n = -n; d = -d; }
  const g = mcd(n, d); n /= g; d /= g;
  return d === 1 ? String(n) : (n < 0 ? '-' : '') + L`\frac{${Math.abs(n)}}{${d}}`;
};
/* +3 / -3 para escribir "x + 3" o "x - 3" */
const sg = k => (k >= 0 ? `+ ${nt(k)}` : `- ${nt(-k)}`);
/* polinomio en LaTeX a partir de sus coeficientes (de mayor a menor grado) */
function poly(c, v = 'x') {
  const n = c.length - 1;
  let s = '';
  c.forEach((k, i) => {
    const e = n - i;
    if (k === 0) return;
    const ak = Math.abs(k);
    const coef = ak === 1 && e !== 0 ? '' : nt(ak);
    const pv = e === 0 ? '' : e === 1 ? v : `${v}^{${e}}`;
    s += (s === '' ? (k < 0 ? '-' : '') : k < 0 ? ' - ' : ' + ') + coef + pv;
  });
  return s || '0';
}
/* el mismo polinomio como texto para comprobar respuestas */
function polyS(c, v = 'x') {
  const n = c.length - 1;
  const t = c.map((k, i) => (k === 0 ? null : `(${k})*${v}^${n - i}`)).filter(Boolean);
  return t.length ? t.join('+') : '0';
}
const evalPoly = (c, x) => c.reduce((s, k) => s * x + k, 0);
/* matriz en LaTeX */
const pm = M => L`\begin{pmatrix}` + M.map(f => f.join(' & ')).join(L` \\ `) + L`\end{pmatrix}`;
const mulM = (A, B) => A.map((f, i) => B[0].map((_, j) => f.reduce((s, _, k) => s + A[i][k] * B[k][j], 0)));
const matR = (n, m, a, b) => Array.from({ length: n }, () => Array.from({ length: m }, () => R.int(a, b)));

/* Región factible de programación lineal en SVG */
function svgRegion({ S, A, B }) {
  const W = 300, pad = 30, max = S + 1;
  const k = (W - pad - 14) / max;
  const X = x => pad + x * k, Y = y => W - pad - y * k;
  const paso = max > 12 ? 2 : 1;
  let g = '';
  for (let i = 0; i <= max; i += paso) {
    g += `<line class="svg-grid" x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(max)}"/><line class="svg-grid" x1="${X(0)}" y1="${Y(i)}" x2="${X(max)}" y2="${Y(i)}"/>`;
    if (i > 0) g += `<text class="svg-texto" x="${X(i)}" y="${Y(0) + 14}" text-anchor="middle">${i}</text><text class="svg-texto" x="${X(0) - 6}" y="${Y(i) + 4}" text-anchor="end">${i}</text>`;
  }
  const v = [[0, 0], [A, 0], [A, S - A], [S - B, B], [0, B]];
  return `<svg viewBox="0 0 ${W} ${W}" role="img" aria-label="Región factible">
    ${g}
    <line class="svg-eje" x1="${X(0)}" y1="${Y(0)}" x2="${X(max)}" y2="${Y(0)}"/>
    <line class="svg-eje" x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(max)}"/>
    <line class="svg-recta" x1="${X(0)}" y1="${Y(S)}" x2="${X(S)}" y2="${Y(0)}"/>
    <line class="svg-recta" x1="${X(A)}" y1="${Y(0)}" x2="${X(A)}" y2="${Y(max)}"/>
    <line class="svg-recta" x1="${X(0)}" y1="${Y(B)}" x2="${X(max)}" y2="${Y(B)}"/>
    <polygon class="svg-region" points="${v.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}"/>
    ${v.map(([x, y]) => `<circle class="svg-punto" cx="${X(x)}" cy="${Y(y)}" r="4"/>`).join('')}
    <text class="svg-texto" x="${X(max) - 2}" y="${Y(0) - 6}" text-anchor="end">x</text>
    <text class="svg-texto" x="${X(0) + 6}" y="${Y(max) + 10}">y</text>
  </svg>`;
}

window.EJERCICIOS = [

  /* =====================================================================
     LÍMITES Y CONTINUIDAD
     ===================================================================== */
  {
    id: 'lim-factorizar', tema: 'limites', tipo: 'guiado', nivel: 1,
    titulo: 'Indeterminación 0/0: factorizar y simplificar',
    generar() {
      const a = R.int(1, 5);
      let b; do { b = R.nz(-5, 5); } while (b === a);
      return { a, b };
    },
    enunciado: ({ a, b }) => L`Calcula el límite: $$\lim_{x\to ${a}} \frac{${poly([1, -(a + b), a * b])}}{${poly([1, -a])}}$$`,
    pasos: [
      {
        tipo: 'opcion',
        texto: ({ a }) => L`Sustituye $x = ${a}$ en el numerador y en el denominador. ¿Qué obtienes?`,
        opciones: ({ a }) => [
          { t: L`$\frac{0}{0}$, una indeterminación`, ok: true, fb: L`Exacto: numerador y denominador se anulan en $x=${a}$. Eso significa que los dos tienen el factor $(x - ${a})$.` },
          { t: L`$\frac{k}{0}$ con $k \neq 0$`, fb: 'Vuelve a calcular el numerador sustituyendo con cuidado: ¿seguro que no da 0?' },
          { t: 'Un número real directamente', fb: 'Si fuera así habríamos terminado, pero fíjate: el denominador vale 0.' },
          { t: L`$\frac{\infty}{\infty}$`, fb: 'Esa indeterminación aparece cuando x tiende a infinito, no cuando tiende a un número.' }
        ]
      },
      {
        tipo: 'num',
        texto: ({ a }) => L`Como $x=${a}$ es raíz del numerador, este se puede escribir como $(x - ${a})(x - r)$. ¿Cuánto vale la otra raíz $r$?`,
        respuesta: ({ b }) => b,
        pistas: [
          L`Puedes dividir el numerador entre $(x - a)$ usando la regla de Ruffini.`,
          ({ a, b }) => L`La suma de las dos raíces de $x^2 + Bx + C$ es $-B$. Aquí: $${a} + r = ${a + b}$.`
        ],
        errores: [{ r: ({ b }) => -b, msg: 'Revisa el signo: si (x − r) es un factor, la raíz es r (no −r).' }],
        explicacion: ({ a, b }) => L`El numerador factorizado es $(x ${sg(-a)})(x ${sg(-b)})$.`
      },
      {
        tipo: 'expr',
        texto: 'Simplifica la fracción. ¿Qué expresión queda?',
        prefijo: ({ a, b }) => L`$\dfrac{(x ${sg(-a)})(x ${sg(-b)})}{x ${sg(-a)}} =$`,
        respuesta: ({ b }) => polyS([1, -b]),
        pistas: [({ a }) => L`El factor $(x ${sg(-a)})$ aparece arriba y abajo: se puede cancelar (para $x \neq ${a}$).`],
        errores: [{ r: ({ a }) => polyS([1, -a]), msg: 'Has dejado precisamente el factor que se cancela. Debe desaparecer el que está arriba y abajo.' }],
        explicacion: 'Al simplificar desaparece la causa de la indeterminación.'
      },
      {
        tipo: 'num',
        texto: '¿Cuánto vale el límite?',
        respuesta: ({ a, b }) => a - b,
        pistas: [({ a }) => L`Sustituye ahora $x = ${a}$ en la expresión simplificada.`],
        errores: [{ r: ({ a, b }) => b - a, msg: 'Cuidado con el signo al sustituir.' }],
        explicacion: ({ a, b }) => L`$$\lim_{x\to ${a}} (x ${sg(-b)}) = ${a - b}$$`
      }
    ]
  },

  {
    id: 'lim-infinito', tema: 'limites', tipo: 'guiado', nivel: 1,
    titulo: 'Límite en el infinito de un cociente de polinomios',
    generar: () => ({ p: R.nz(-6, 6), q: R.nz(-9, 9), r: R.int(2, 7), s: R.nz(-9, 9) }),
    enunciado: ({ p, q, r, s }) => L`Calcula $$\lim_{x\to +\infty} \frac{${poly([p, q, 1])}}{${poly([r, 0, s])}}$$`,
    pasos: [
      {
        tipo: 'opcion',
        texto: L`Si sustituyes «$x = +\infty$», ¿qué tipo de expresión aparece?`,
        opciones: [
          { t: L`Una indeterminación del tipo $\frac{\infty}{\infty}$`, ok: true, fb: 'Correcto: numerador y denominador crecen sin límite (en valor absoluto).' },
          { t: L`$\frac{0}{0}$`, fb: 'Eso pasa cuando x tiende a una raíz común, no a infinito.' },
          { t: 'El límite vale 1, porque infinito entre infinito es 1', fb: '¡Error muy frecuente! ∞/∞ es una indeterminación: puede dar cualquier valor.' },
          { t: 'El límite vale 0', fb: 'Todavía no podemos saberlo: hay que resolver la indeterminación.' }
        ]
      },
      {
        tipo: 'num',
        texto: ({ q }) => L`Dividimos numerador y denominador entre $x^2$ (la mayor potencia). ¿A qué tiende $\dfrac{${q}}{x}$ cuando $x \to +\infty$?`,
        respuesta: 0,
        pistas: ['Piensa en dividir un número fijo entre 1000, 1 000 000, 1 000 000 000…'],
        explicacion: 'Un número fijo dividido entre algo que crece sin límite tiende a 0.'
      },
      {
        tipo: 'num',
        texto: '¿Cuánto vale el límite? (puedes escribirlo como fracción, p. ej. 3/4)',
        respuesta: ({ p, r }) => p / r,
        sol: ({ p, r }) => fr(p, r),
        pistas: [({ p, q, r, s }) => L`Tras dividir entre $x^2$ queda $\dfrac{${p} + \frac{${q}}{x} + \frac{1}{x^2}}{${r} + \frac{${s}}{x^2}}$. ¿Qué queda cuando los términos con $x$ se hacen 0?`],
        errores: [
          { r: ({ p, r }) => r / p, msg: 'Has invertido la fracción: es el coeficiente principal del numerador entre el del denominador.' },
          { r: 0, msg: 'El límite es 0 cuando el grado del numerador es MENOR que el del denominador. Aquí los grados son iguales.' }
        ],
        explicacion: ({ p, r }) => L`Cuando los grados son iguales, el límite es el cociente de los coeficientes principales: $${fr(p, r)}$.`
      }
    ]
  },

  {
    id: 'lim-continuidad', tema: 'limites', tipo: 'concepto', nivel: 2,
    titulo: 'Continuidad y tipos de discontinuidad',
    enunciado: 'Responde a estas preguntas sobre continuidad. Lee bien cada opción: los comentarios de las respuestas incorrectas también enseñan.',
    pasos: [
      {
        tipo: 'opcion',
        texto: L`Una función $f$ es continua en $x = a$ si…`,
        opciones: [
          { t: L`existe $f(a)$`, fb: 'Es necesario, pero no suficiente: también tiene que existir el límite y coincidir con f(a).' },
          { t: L`existe $\lim_{x\to a} f(x)$`, fb: 'Es necesario, pero no basta: el límite tiene que coincidir con f(a).' },
          { t: L`existen $f(a)$ y $\lim_{x\to a} f(x)$, y son iguales`, ok: true, fb: 'Exacto: esas son las tres condiciones de continuidad.' },
          { t: 'sus límites laterales son distintos', fb: 'Si los laterales son distintos, el límite no existe: la función NO es continua.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: L`Sea $f(x)=\begin{cases} x+2 & \text{si } x<1 \\ 3x & \text{si } x\ge 1\end{cases}$. ¿Es continua en $x=1$?`,
        opciones: [
          { t: 'Sí', ok: true, fb: L`Límite por la izquierda: $1+2=3$. Por la derecha: $3\cdot 1 = 3$. Y $f(1)=3$. Todo coincide.` },
          { t: 'No, porque está definida a trozos', fb: 'Que esté definida a trozos no implica que sea discontinua: hay que calcular los límites laterales.' },
          { t: 'No, porque los límites laterales son distintos', fb: L`Calcúlalos: izquierda $1+2=3$, derecha $3\cdot1=3$. Son iguales.` }
        ]
      },
      {
        tipo: 'opcion',
        texto: L`La función $f(x)=\dfrac{x^2-4}{x-2}$ en $x=2$…`,
        opciones: [
          { t: 'tiene una discontinuidad evitable', ok: true, fb: L`Bien: $f(2)$ no existe, pero $\lim_{x\to2}\frac{(x-2)(x+2)}{x-2} = 4$ es finito.` },
          { t: 'tiene una discontinuidad de salto finito', fb: 'Para un salto, los límites laterales tendrían que ser distintos. Aquí los dos valen 4.' },
          { t: 'tiene una asíntota vertical', fb: 'El límite es finito (vale 4), así que no hay asíntota.' },
          { t: 'es continua', fb: 'f(2) no existe (sale 0/0), así que no puede ser continua en x = 2.' }
        ]
      }
    ]
  },

  /* =====================================================================
     DERIVADAS
     ===================================================================== */
  {
    id: 'der-polinomio', tema: 'derivadas', tipo: 'guiado', nivel: 1,
    titulo: 'Derivada de un polinomio',
    generar: () => ({ a: R.nz(-5, 5), b: R.nz(-6, 6), c: R.nz(-9, 9), d: R.nz(-9, 9), k: R.int(-2, 2) }),
    enunciado: ({ a, b, c, d, k }) => L`Sea $f(x) = ${poly([a, b, c, d])}$. Calcula $f'(x)$ y después $f'(${k})$.`,
    pasos: [
      {
        tipo: 'expr',
        texto: ({ a }) => L`Empieza por el primer término. ¿Cuál es la derivada de $${poly([a, 0, 0, 0])}$?`,
        respuesta: ({ a }) => polyS([3 * a, 0, 0]),
        pistas: [
          L`Regla de la potencia: $(x^n)' = n\,x^{n-1}$. Los números que multiplican se mantienen.`,
          ({ a }) => L`$(${a}x^3)' = ${a}\cdot 3\,x^{3-1}$`
        ],
        errores: [
          { r: ({ a }) => polyS([a, 0, 0]), msg: 'Has bajado el exponente, pero te falta multiplicar por él.' },
          { r: ({ a }) => polyS([3 * a, 0, 0, 0]), msg: 'Has multiplicado por el exponente, pero no le has restado 1.' }
        ],
        explicacion: ({ a }) => L`$(${poly([a, 0, 0, 0])})' = ${poly([3 * a, 0, 0])}$`
      },
      {
        tipo: 'expr',
        texto: 'Ahora deriva la función completa.',
        prefijo: L`$f'(x) =$`,
        respuesta: ({ a, b, c }) => polyS([3 * a, 2 * b, c]),
        pistas: [
          'Deriva término a término: la derivada de una suma es la suma de las derivadas.',
          L`La derivada de un número (constante) es $0$, y la de $c\,x$ es $c$.`
        ],
        errores: [
          { r: ({ a, b, c, d }) => polyS([3 * a, 2 * b, c + d]), msg: 'La derivada de una constante es 0: el término independiente desaparece.' },
          { r: ({ a, b }) => polyS([3 * a, 2 * b, 0]), msg: L`Te has dejado un término: la derivada de $c\,x$ es $c$, no $0$.` },
          { r: ({ a, b, c }) => polyS([3 * a, b, c]), msg: L`Revisa el término en $x^2$: $(b\,x^2)' = 2b\,x$.` }
        ],
        explicacion: ({ a, b, c }) => L`$f'(x) = ${poly([3 * a, 2 * b, c])}$`
      },
      {
        tipo: 'num',
        texto: ({ k }) => L`Sustituye: ¿cuánto vale $f'(${k})$?`,
        respuesta: ({ a, b, c, k }) => evalPoly([3 * a, 2 * b, c], k),
        pistas: [
          ({ a, b, c, k }) => L`Sustituye $x=${k}$ en $f'(x) = ${poly([3 * a, 2 * b, c])}$.`,
          'Si el número es negativo, escríbelo entre paréntesis y cuida los signos.'
        ],
        errores: [{ r: ({ a, b, c, d, k }) => evalPoly([a, b, c, d], k), msg: L`Has sustituido en $f$, pero te piden $f'$.` }],
        explicacion: ({ a, b, c, k }) => L`$f'(${k}) = ${evalPoly([3 * a, 2 * b, c], k)}$. Es la pendiente de la recta tangente en ese punto.`
      }
    ]
  },

  {
    id: 'der-cadena', tema: 'derivadas', tipo: 'guiado', nivel: 2,
    titulo: 'Regla de la cadena',
    generar: () => ({ a: R.int(2, 5) * R.pick([1, -1]), b: R.nz(-7, 7), n: R.int(3, 6) }),
    enunciado: ({ a, b, n }) => L`Deriva $f(x) = (${poly([a, b])})^{${n}}$ usando la regla de la cadena.`,
    pasos: [
      {
        tipo: 'expr',
        texto: ({ n }) => L`Identifica la función «de dentro»: $f(x) = u^{${n}}$, siendo $u(x)$…`,
        prefijo: L`$u(x) =$`,
        respuesta: ({ a, b }) => polyS([a, b]),
        pistas: ['Es lo que está dentro del paréntesis.'],
        explicacion: ({ a, b }) => L`$u(x) = ${poly([a, b])}$`
      },
      {
        tipo: 'expr',
        texto: L`Calcula $u'(x)$.`,
        prefijo: L`$u'(x) =$`,
        respuesta: ({ a }) => String(a),
        pistas: [L`La derivada de $a\,x + b$ es $a$.`],
        explicacion: ({ a }) => L`$u'(x) = ${a}$`
      },
      {
        tipo: 'expr',
        texto: ({ n }) => L`Aplica la regla de la cadena: $f'(x) = ${n}\,u^{${n - 1}}\cdot u'(x)$. Escribe $f'(x)$.`,
        prefijo: L`$f'(x) =$`,
        ayuda: 'No hace falta desarrollar la potencia: puedes escribir, por ejemplo, <code>12(2x+1)^3</code>.',
        respuesta: ({ a, b, n }) => `${n * a}*(${polyS([a, b])})^${n - 1}`,
        sol: ({ a, b, n }) => L`${n * a}\,(${poly([a, b])})^{${n - 1}}`,
        pistas: [({ a, b, n }) => L`Baja el exponente, réstale 1 y multiplica por la derivada de dentro: $${n}\,(${poly([a, b])})^{${n - 1}}\cdot (${a})$.`],
        errores: [
          { r: ({ a, b, n }) => `${n}*(${polyS([a, b])})^${n - 1}`, msg: L`Te has olvidado de multiplicar por la derivada de dentro, $u'(x)$. ¡Es el error más típico de la regla de la cadena!` },
          { r: ({ a, b, n }) => `${n * a}*(${polyS([a, b])})^${n}`, msg: 'El exponente tiene que bajar una unidad.' },
          { r: ({ a, b, n }) => `${n}*(${a})^${n - 1}`, msg: 'Has derivado solo lo de dentro. Primero se deriva la potencia (dejando dentro lo mismo) y luego se multiplica por u\'(x).' }
        ],
        explicacion: ({ a, b, n }) => L`$f'(x) = ${n}\,(${poly([a, b])})^{${n - 1}}\cdot ${a < 0 ? `(${a})` : a} = ${n * a}\,(${poly([a, b])})^{${n - 1}}$`
      }
    ]
  },

  {
    id: 'der-tangente', tema: 'derivadas', tipo: 'guiado', nivel: 2,
    titulo: 'Recta tangente en un punto',
    generar: () => ({ b: R.int(-6, 6), c: R.int(-6, 6), x0: R.nz(-3, 3) }),
    enunciado: ({ b, c, x0 }) => L`Halla la ecuación de la recta tangente a $f(x) = ${poly([1, b, c])}$ en el punto de abscisa $x_0 = ${x0}$.`,
    pasos: [
      {
        tipo: 'num',
        texto: ({ x0 }) => L`Calcula $f(${x0})$, la ordenada del punto de tangencia.`,
        respuesta: ({ b, c, x0 }) => evalPoly([1, b, c], x0),
        pistas: [({ x0 }) => L`Sustituye $x = ${x0}$ en $f(x)$. Usa paréntesis si es negativo.`],
        explicacion: ({ b, c, x0 }) => L`El punto de tangencia es $(${x0},\ ${evalPoly([1, b, c], x0)})$.`
      },
      {
        tipo: 'expr',
        texto: L`Calcula la derivada $f'(x)$.`,
        prefijo: L`$f'(x) =$`,
        respuesta: ({ b }) => polyS([2, b]),
        errores: [{ r: ({ b, c }) => polyS([2, b + c]), msg: 'La derivada de la constante es 0.' }],
        explicacion: ({ b }) => L`$f'(x) = ${poly([2, b])}$`
      },
      {
        tipo: 'num',
        texto: ({ x0 }) => L`La pendiente de la tangente es $m = f'(${x0})$. ¿Cuánto vale?`,
        respuesta: ({ b, x0 }) => 2 * x0 + b,
        errores: [{ r: ({ b, c, x0 }) => evalPoly([1, b, c], x0), msg: L`Eso es $f(x_0)$. La pendiente es $f'(x_0)$: sustituye en la derivada.` }],
        explicacion: ({ b, x0 }) => L`$m = f'(${x0}) = ${2 * x0 + b}$`
      },
      {
        tipo: 'expr',
        texto: L`Usa $y - f(x_0) = f'(x_0)\,(x - x_0)$ y escribe la recta despejando $y$.`,
        prefijo: L`$y =$`,
        respuesta: ({ b, c, x0 }) => `${evalPoly([1, b, c], x0)}+(${2 * x0 + b})*(x-(${x0}))`,
        sol: ({ b, c, x0 }) => { const m = 2 * x0 + b, y0 = evalPoly([1, b, c], x0); return poly([m, y0 - m * x0]); },
        pistas: [({ b, c, x0 }) => L`Sustituye: $y - (${evalPoly([1, b, c], x0)}) = ${2 * x0 + b}\,(x - (${x0}))$, y despeja $y$.`],
        errores: [
          { r: ({ b, c, x0 }) => `${2 * x0 + b}*(x-(${x0}))-(${evalPoly([1, b, c], x0)})`, msg: L`Revisa el despeje: $f(x_0)$ pasa al otro lado sumando.` },
          { r: ({ b, c, x0 }) => `${evalPoly([1, b, c], x0)}+(${2 * x0 + b})*(x+(${x0}))`, msg: L`Cuidado: es $(x - x_0)$. Si $x_0$ es negativo, queda $x + |x_0|$.` }
        ],
        explicacion: ({ b, c, x0 }) => { const m = 2 * x0 + b, y0 = evalPoly([1, b, c], x0); return L`La recta tangente es $y = ${poly([m, y0 - m * x0])}$.`; }
      }
    ]
  },

  {
    id: 'der-concepto', tema: 'derivadas', tipo: 'concepto', nivel: 1,
    titulo: '¿Qué significa la derivada?',
    enunciado: 'Comprueba que entiendes el significado de la derivada, no solo cómo se calcula.',
    pasos: [
      {
        tipo: 'opcion',
        texto: L`¿Qué representa geométricamente $f'(a)$?`,
        opciones: [
          { t: L`La pendiente de la recta tangente a la gráfica en $(a, f(a))$`, ok: true, fb: 'Exacto. Por eso la recta tangente es y − f(a) = f\'(a)(x − a).' },
          { t: L`El valor de la función en $x=a$`, fb: L`Eso es $f(a)$, no $f'(a)$.` },
          { t: L`El área bajo la curva hasta $x=a$`, fb: 'Eso tiene que ver con la integral, no con la derivada.' },
          { t: L`La pendiente de la recta que une $(0, f(0))$ y $(a, f(a))$`, fb: 'Esa es una recta secante (tasa de variación media). La derivada es el límite de esas pendientes.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: L`Si $f'(x) > 0$ para todo $x$ de un intervalo, entonces en ese intervalo $f$ es…`,
        opciones: [
          { t: 'creciente', ok: true, fb: 'Correcto: pendiente positiva significa que la función sube.' },
          { t: 'decreciente', fb: 'Al revés: decreciente cuando f\'(x) < 0.' },
          { t: 'positiva', fb: 'El signo de f\' habla de si f crece o decrece, no del signo de f.' },
          { t: 'cóncava hacia arriba', fb: 'La curvatura depende de f\'\', no de f\'.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: L`Si $f'(a) = 0$ y $f''(a) > 0$, en $x = a$ hay…`,
        opciones: [
          { t: 'un mínimo relativo', ok: true, fb: L`Bien: tangente horizontal y curva con forma de «$\cup$».` },
          { t: 'un máximo relativo', fb: L`Al revés: $f''(a) > 0$ indica forma de «$\cup$», así que es un mínimo.` },
          { t: 'un punto de inflexión', fb: L`En un punto de inflexión cambia la curvatura; normalmente $f''(a) = 0$.` },
          { t: 'no se puede afirmar nada', fb: 'Sí se puede: es el criterio de la segunda derivada.' }
        ]
      }
    ]
  },

  /* =====================================================================
     TRIGONOMETRÍA
     ===================================================================== */
  {
    id: 'trig-razones', tema: 'trigonometria', tipo: 'guiado', nivel: 2,
    titulo: 'Razones trigonométricas a partir del seno',
    generar() {
      const [c1, c2, h] = R.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
      const q = R.pick([2, 3, 4]);
      const s = q === 2 ? c1 : -c1;
      const c = q === 4 ? c2 : -c2;
      return { c1, c2, h, q, s, c, nombre: { 2: 'segundo', 3: 'tercer', 4: 'cuarto' }[q] };
    },
    enunciado: ({ s, h, nombre }) => L`Sabiendo que $\sen\alpha = ${fr(s, h)}$ y que $\alpha$ está en el ${nombre} cuadrante, calcula $\cos\alpha$ y $\tg\alpha$.`,
    pasos: [
      {
        tipo: 'num',
        texto: L`Usa la relación fundamental $\sen^2\alpha + \cos^2\alpha = 1$. ¿Cuánto vale $\cos^2\alpha$? (puedes escribir una fracción)`,
        respuesta: ({ c2, h }) => (c2 * c2) / (h * h),
        sol: ({ c2, h }) => fr(c2 * c2, h * h),
        pistas: [({ s, h }) => L`$\cos^2\alpha = 1 - \left(${fr(s, h)}\right)^2$`],
        errores: [{ r: ({ c1, h }) => 1 - c1 / h, msg: 'Hay que elevar el seno al cuadrado antes de restarlo.' }],
        explicacion: ({ c1, c2, h }) => L`$\cos^2\alpha = 1 - \frac{${c1 * c1}}{${h * h}} = \frac{${c2 * c2}}{${h * h}}$`
      },
      {
        tipo: 'num',
        texto: L`Calcula ahora $\cos\alpha$. ¡Ojo con el signo según el cuadrante!`,
        respuesta: ({ c, h }) => c / h,
        sol: ({ c, h }) => fr(c, h),
        pistas: [
          L`Haz la raíz cuadrada del resultado anterior.`,
          'En el 1.º y el 4.º cuadrante el coseno es positivo; en el 2.º y el 3.º es negativo.'
        ],
        errores: [{ r: ({ c, h }) => -c / h, msg: ({ nombre, c }) => `El valor absoluto es correcto, pero en el ${nombre} cuadrante el coseno es ${c < 0 ? 'negativo' : 'positivo'}.` }],
        explicacion: ({ c, h, nombre }) => L`En el ${nombre} cuadrante el coseno es ${c < 0 ? 'negativo' : 'positivo'}: $\cos\alpha = ${fr(c, h)}$.`
      },
      {
        tipo: 'num',
        texto: L`Calcula $\tg\alpha = \dfrac{\sen\alpha}{\cos\alpha}$.`,
        respuesta: ({ s, c }) => s / c,
        sol: ({ s, c }) => fr(s, c),
        errores: [
          { r: ({ s, c }) => c / s, msg: 'Has calculado coseno entre seno (la cotangente). La tangente es seno entre coseno.' },
          { r: ({ s, c }) => -s / c, msg: 'Revisa el signo: divide los dos valores con sus signos.' }
        ],
        explicacion: ({ s, c, h }) => L`$\tg\alpha = \dfrac{${fr(s, h)}}{${fr(c, h)}} = ${fr(s, c)}$`
      }
    ]
  },

  {
    id: 'trig-radianes', tema: 'trigonometria', tipo: 'guiado', nivel: 1,
    titulo: 'Grados y radianes',
    generar: () => ({
      deg: R.pick([30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330]),
      rad: R.pick([[1, 6], [1, 4], [1, 3], [2, 3], [3, 4], [5, 6], [7, 6], [5, 4], [4, 3], [5, 3], [7, 4], [11, 6]])
    }),
    enunciado: L`Recuerda: $180^\circ$ equivalen a $\pi$ radianes.`,
    pasos: [
      {
        tipo: 'num',
        texto: ({ deg }) => L`Pasa $${deg}^\circ$ a radianes. Escribe el resultado con pi, por ejemplo: 3pi/4.`,
        respuesta: ({ deg }) => (deg * Math.PI) / 180,
        tol: 0.001,
        sol: ({ deg }) => { const g = mcd(deg, 180), n = deg / g, d = 180 / g; return L`\frac{${n === 1 ? '' : n}\pi}{${d}}`; },
        pistas: [({ deg }) => L`Multiplica por $\dfrac{\pi}{180}$ y simplifica: $${deg}\cdot\dfrac{\pi}{180}$.`],
        errores: [{ r: ({ deg }) => (deg * 180) / Math.PI, msg: 'Has usado el factor al revés. De grados a radianes se multiplica por π/180.' }],
        explicacion: ({ deg }) => { const g = mcd(deg, 180), n = deg / g, d = 180 / g; return L`$${deg}^\circ = ${deg}\cdot\frac{\pi}{180} = \frac{${n === 1 ? '' : n}\pi}{${d}}$ rad`; }
      },
      {
        tipo: 'num',
        texto: ({ rad: [n, d] }) => L`Pasa $\dfrac{${n === 1 ? '' : n}\pi}{${d}}$ rad a grados (escribe solo el número).`,
        respuesta: ({ rad: [n, d] }) => (n * 180) / d,
        sol: ({ rad: [n, d] }) => `${(n * 180) / d}^\\circ`,
        pistas: [L`Sustituye $\pi$ por $180^\circ$ y simplifica.`],
        errores: [{ r: ({ rad: [n, d] }) => (n * Math.PI) / d, msg: 'Ese es el valor en radianes como decimal. Para pasarlo a grados, cambia π por 180°.' }],
        explicacion: ({ rad: [n, d] }) => L`$\frac{${n === 1 ? '' : n}\pi}{${d}} = \frac{${n === 1 ? '' : n + L`\cdot`} 180^\circ}{${d}} = ${(n * 180) / d}^\circ$`
      }
    ]
  },

  {
    id: 'trig-concepto', tema: 'trigonometria', tipo: 'concepto', nivel: 1,
    titulo: 'Signos y ángulos relacionados',
    enunciado: 'Piensa en la circunferencia goniométrica: el coseno es la coordenada x y el seno la coordenada y.',
    pasos: [
      {
        tipo: 'opcion',
        texto: '¿En qué cuadrantes es negativo el coseno?',
        opciones: [
          { t: 'En el 2.º y el 3.º', ok: true, fb: 'Correcto: ahí la coordenada x es negativa.' },
          { t: 'En el 3.º y el 4.º', fb: 'En esos cuadrantes es negativo el seno (la coordenada y).' },
          { t: 'En el 1.º y el 2.º', fb: 'En el 1.º cuadrante todas las razones son positivas.' },
          { t: 'En el 2.º y el 4.º', fb: 'En esos es negativa la tangente.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: L`$\sen(180^\circ - \alpha)$ es igual a…`,
        opciones: [
          { t: L`$\sen\alpha$`, ok: true, fb: 'Bien: son ángulos suplementarios y tienen el mismo seno (la misma altura).' },
          { t: L`$-\sen\alpha$`, fb: 'El ángulo suplementario está en el 2.º cuadrante, donde el seno es positivo.' },
          { t: L`$\cos\alpha$`, fb: L`Eso ocurre con el complementario: $\sen(90^\circ - \alpha) = \cos\alpha$.` },
          { t: L`$-\cos\alpha$`, fb: 'Dibuja ambos ángulos en la circunferencia: tienen la misma altura.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: 'El teorema del coseno es una generalización de…',
        opciones: [
          { t: 'el teorema de Pitágoras', ok: true, fb: L`Exacto: si el ángulo es recto, $\cos 90^\circ = 0$ y queda $a^2 = b^2 + c^2$.` },
          { t: 'el teorema del seno', fb: 'Son dos teoremas distintos para resolver triángulos.' },
          { t: 'el teorema de Tales', fb: 'Tales trata sobre proporcionalidad de segmentos.' },
          { t: 'la relación fundamental', fb: 'La relación fundamental relaciona sen y cos de un mismo ángulo.' }
        ]
      }
    ]
  },

  /* =====================================================================
     MATEMÁTICA FINANCIERA
     ===================================================================== */
  {
    id: 'fin-compuesto', tema: 'financiera', tipo: 'guiado', nivel: 1,
    titulo: 'Interés compuesto',
    generar: () => ({
      C: R.pick([1000, 1500, 2000, 2500, 3000, 5000, 8000, 10000]),
      r: R.pick([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]),
      t: R.int(3, 10)
    }),
    enunciado: ({ C, r, t }) => L`Se depositan $${eur(C).replace('{,}00', '')}$ € a un interés compuesto del $${nt(r)}\,\%$ anual durante $${t}$ años. Calcula el capital final y los intereses generados.`,
    pasos: [
      {
        tipo: 'num',
        texto: L`¿Cuál es el tipo de interés en tanto por uno, $i$?`,
        respuesta: ({ r }) => r / 100,
        errores: [{ r: ({ r }) => r, msg: 'Divide entre 100: por ejemplo, el 3 % en tanto por uno es 0,03.' }],
        explicacion: ({ r }) => L`$i = \frac{${nt(r)}}{100} = ${nt(r / 100)}$`
      },
      {
        tipo: 'num',
        texto: L`Aplica $C_f = C_0\,(1+i)^t$. ¿Cuál es el capital final? (redondea a céntimos)`,
        respuesta: ({ C, r, t }) => +(C * (1 + r / 100) ** t).toFixed(2),
        tol: 0.011,
        sol: ({ C, r, t }) => eur(C * (1 + r / 100) ** t) + L`\text{ €}`,
        pistas: [({ C, r, t }) => L`$C_f = ${C}\cdot(1 + ${nt(r / 100)})^{${t}} = ${C}\cdot ${nt(1 + r / 100)}^{${t}}$`],
        errores: [{ r: ({ C, r, t }) => +(C * (1 + (r / 100) * t)).toFixed(2), msg: L`Eso es interés simple, $C_0(1 + i\cdot t)$. En el compuesto los intereses también generan intereses.` }],
        explicacion: ({ C, r, t }) => L`$C_f = ${C}\cdot ${nt(1 + r / 100)}^{${t}} \approx ${eur(C * (1 + r / 100) ** t)}$ €`
      },
      {
        tipo: 'num',
        texto: '¿Cuántos euros de intereses se han generado?',
        respuesta: ({ C, r, t }) => +(C * (1 + r / 100) ** t - C).toFixed(2),
        tol: 0.02,
        sol: ({ C, r, t }) => eur(C * (1 + r / 100) ** t - C) + L`\text{ €}`,
        pistas: ['Intereses = capital final − capital inicial.'],
        explicacion: ({ C, r, t }) => L`$I = C_f - C_0 \approx ${eur(C * (1 + r / 100) ** t - C)}$ €`
      }
    ]
  },

  {
    id: 'fin-porcentajes', tema: 'financiera', tipo: 'guiado', nivel: 1,
    titulo: 'Porcentajes encadenados',
    generar: () => ({ P: R.pick([40, 60, 80, 120, 150, 200, 250]), a: R.pick([10, 15, 20, 25, 30]), b: R.pick([10, 15, 20, 25]) }),
    enunciado: ({ P, a, b }) => L`Un artículo cuesta $${P}$ €. Primero sube un $${a}\,\%$ y después baja un $${b}\,\%$. ¿Cuál es el precio final? ¿Cuál ha sido la variación porcentual total?`,
    pasos: [
      {
        tipo: 'num',
        texto: ({ a }) => L`¿Cuál es el índice de variación de una subida del $${a}\,\%$?`,
        respuesta: ({ a }) => 1 + a / 100,
        pistas: [L`Índice de variación de una subida del $r\,\%$: $1 + \dfrac{r}{100}$.`],
        errores: [{ r: ({ a }) => a / 100, msg: 'Así solo calculas el aumento. El índice incluye el precio inicial: 1 + r/100.' }],
        explicacion: ({ a }) => L`$1 + ${nt(a / 100)} = ${nt(1 + a / 100)}$`
      },
      {
        tipo: 'num',
        texto: ({ b }) => L`¿Y el índice de variación de una bajada del $${b}\,\%$?`,
        respuesta: ({ b }) => 1 - b / 100,
        errores: [
          { r: ({ b }) => 1 + b / 100, msg: 'En una bajada se resta: 1 − r/100.' },
          { r: ({ b }) => b / 100, msg: 'Ese es el descuento. El índice de variación es 1 − r/100.' }
        ],
        explicacion: ({ b }) => L`$1 - ${nt(b / 100)} = ${nt(1 - b / 100)}$`
      },
      {
        tipo: 'num',
        texto: '¿Cuál es el índice de variación total?',
        respuesta: ({ a, b }) => (1 + a / 100) * (1 - b / 100),
        pistas: ['Cuando se encadenan variaciones porcentuales, los índices se multiplican.'],
        errores: [
          { r: ({ a, b }) => 1 + (a - b) / 100, msg: '¡Los porcentajes no se suman ni se restan! Los índices de variación se multiplican.' },
          { r: ({ a, b }) => (1 + a / 100) + (1 - b / 100), msg: 'Los índices se multiplican, no se suman.' }
        ],
        explicacion: ({ a, b }) => L`$${nt(1 + a / 100)}\cdot ${nt(1 - b / 100)} = ${nt((1 + a / 100) * (1 - b / 100))}$`
      },
      {
        tipo: 'num',
        texto: '¿Cuál es el precio final? (en euros)',
        respuesta: ({ P, a, b }) => P * (1 + a / 100) * (1 - b / 100),
        tol: 0.011,
        errores: [{ r: ({ P, a, b }) => P * (1 + (a - b) / 100), msg: 'Has restado los porcentajes directamente. Multiplica el precio por el índice total.' }],
        explicacion: ({ P, a, b }) => L`$${P}\cdot ${nt((1 + a / 100) * (1 - b / 100))} = ${eur(P * (1 + a / 100) * (1 - b / 100))}$ €`
      },
      {
        tipo: 'num',
        texto: '¿Cuál ha sido la variación porcentual total? Escribe el porcentaje con su signo (negativo si es una bajada).',
        respuesta: ({ a, b }) => ((1 + a / 100) * (1 - b / 100) - 1) * 100,
        tol: 0.01,
        pistas: [L`Variación $= (\text{índice total} - 1)\cdot 100$.`],
        errores: [{ r: ({ a, b }) => a - b, msg: ({ b }) => `No se pueden restar los porcentajes directamente: la bajada del ${b} % se aplica sobre un precio que ya ha subido.` }],
        explicacion: ({ a, b }) => { const v = ((1 + a / 100) * (1 - b / 100) - 1) * 100; return L`$(${nt((1 + a / 100) * (1 - b / 100))} - 1)\cdot 100 = ${nt(v, 2)}\,\%$. ${v < 0 ? 'Es una bajada.' : v > 0 ? 'Es una subida.' : 'El precio no cambia.'}`; }
      }
    ]
  },

  {
    id: 'fin-concepto', tema: 'financiera', tipo: 'concepto', nivel: 1,
    titulo: 'Interés simple, compuesto y TAE',
    enunciado: 'Conceptos básicos de matemática financiera.',
    pasos: [
      {
        tipo: 'opcion',
        texto: 'En el interés simple, los intereses que se generan cada año…',
        opciones: [
          { t: 'son siempre los mismos', ok: true, fb: 'Correcto: se calculan siempre sobre el capital inicial.' },
          { t: 'aumentan cada año', fb: 'Eso ocurre en el interés compuesto, porque los intereses se acumulan al capital.' },
          { t: 'disminuyen cada año', fb: 'No: en el simple se calculan siempre sobre el mismo capital.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: 'La TAE (tasa anual equivalente) sirve sobre todo para…',
        opciones: [
          { t: 'comparar productos con distintas frecuencias de capitalización', ok: true, fb: 'Exacto: expresa todo como si fuera un interés compuesto anual.' },
          { t: 'calcular los impuestos de un depósito', fb: 'La TAE no tiene que ver con impuestos.' },
          { t: 'es lo mismo que el interés nominal', fb: 'Solo coinciden si la capitalización es anual.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: L`Un banco ofrece un $6\,\%$ nominal anual con capitalización mensual. El tipo de interés mensual es…`,
        opciones: [
          { t: L`$0{,}5\,\%$`, ok: true, fb: L`Bien: $6\,\% : 12 = 0{,}5\,\%$ mensual.` },
          { t: L`$6\,\%$`, fb: 'Ese es el tipo anual. Hay que dividirlo entre los 12 meses.' },
          { t: L`$0{,}6\,\%$`, fb: 'Revisa la división: 6 entre 12.' },
          { t: L`$72\,\%$`, fb: 'Has multiplicado por 12 en lugar de dividir.' }
        ]
      }
    ]
  },

  /* =====================================================================
     ESTADÍSTICA BIDIMENSIONAL
     ===================================================================== */
  {
    id: 'bid-regresion', tema: 'bidimensional', tipo: 'guiado', nivel: 2,
    titulo: 'Covarianza y recta de regresión',
    generar() {
      const x = [1, 2, 3, 4, 5];
      const b0 = R.int(2, 6), b1 = R.pick([1, 2, 3]);
      const y = x.map(xi => b0 + b1 * xi + R.int(-2, 2));
      const ym = y.reduce((s, v) => s + v, 0) / 5;
      const mxy = x.reduce((s, xi, i) => s + xi * y[i], 0) / 5;
      const sxy = mxy - 3 * ym;
      return { x, y, ym, mxy, sxy, b: sxy / 2 };
    },
    enunciado: ({ x, y }) => L`Una empresa ha anotado su gasto en publicidad ($x$, en miles de euros) y sus ventas ($y$, en miles de unidades): $$\begin{array}{c|ccccc} x & ${x.join(' & ')} \\ \hline y & ${y.join(' & ')} \end{array}$$ Vamos a calcular la recta de regresión de $y$ sobre $x$.`,
    pasos: [
      {
        tipo: 'num',
        texto: L`Calcula la media $\bar{x}$.`,
        respuesta: 3,
        explicacion: L`$\bar{x} = \frac{1+2+3+4+5}{5} = 3$`
      },
      {
        tipo: 'num',
        texto: L`Calcula la media $\bar{y}$.`,
        respuesta: ({ ym }) => ym,
        tol: 0.01,
        explicacion: ({ y, ym }) => L`$\bar{y} = \frac{${y.join('+')}}{5} = ${nt(ym)}$`
      },
      {
        tipo: 'num',
        texto: L`Calcula $\dfrac{\sum x_i\,y_i}{n}$.`,
        respuesta: ({ mxy }) => mxy,
        tol: 0.01,
        pistas: [({ y }) => L`Multiplica cada pareja y suma: $1\cdot ${y[0]} + 2\cdot ${y[1]} + 3\cdot ${y[2]} + 4\cdot ${y[3]} + 5\cdot ${y[4]}$. Después divide entre 5.`],
        errores: [{ r: ({ mxy }) => mxy * 5, msg: 'Te falta dividir entre n = 5.' }],
        explicacion: ({ mxy }) => L`$\frac{\sum x_i y_i}{5} = ${nt(mxy)}$`
      },
      {
        tipo: 'num',
        texto: L`Calcula la covarianza: $s_{xy} = \dfrac{\sum x_i\,y_i}{n} - \bar{x}\,\bar{y}$.`,
        respuesta: ({ sxy }) => sxy,
        tol: 0.02,
        errores: [{ r: ({ mxy }) => mxy, msg: L`Falta restar el producto de las medias, $\bar{x}\,\bar{y}$.` }],
        explicacion: ({ mxy, ym, sxy }) => L`$s_{xy} = ${nt(mxy)} - 3\cdot ${nt(ym)} = ${nt(sxy)}$. Es positiva: cuando $x$ aumenta, $y$ tiende a aumentar.`
      },
      {
        tipo: 'num',
        texto: L`La varianza de $x$ es $s_x^2 = \dfrac{\sum x_i^2}{n} - \bar{x}^2$. ¿Cuánto vale?`,
        respuesta: 2,
        pistas: [L`$\sum x_i^2 = 1 + 4 + 9 + 16 + 25 = 55$`],
        errores: [
          { r: 11, msg: L`Falta restar la media al cuadrado, $\bar{x}^2 = 9$.` },
          { r: Math.SQRT2, msg: 'Esa es la desviación típica. Te piden la varianza (sin raíz).' }
        ],
        explicacion: L`$s_x^2 = \frac{55}{5} - 3^2 = 11 - 9 = 2$`
      },
      {
        tipo: 'num',
        texto: L`La pendiente de la recta de regresión es $b = \dfrac{s_{xy}}{s_x^2}$. ¿Cuánto vale?`,
        respuesta: ({ b }) => b,
        tol: 0.02,
        errores: [{ r: ({ sxy }) => 2 / sxy, msg: 'Has invertido la fracción: covarianza entre varianza.' }],
        explicacion: ({ sxy, b }) => L`$b = \frac{${nt(sxy)}}{2} = ${nt(b)}$`
      },
      {
        tipo: 'expr',
        texto: L`Escribe la recta de regresión usando $y - \bar{y} = b\,(x - \bar{x})$ y despejando $y$.`,
        prefijo: L`$y =$`,
        ayuda: 'Puedes usar decimales con punto o coma, p. ej. <code>1,6x + 4,2</code>.',
        respuesta: ({ ym, b }) => `${ym}+${b}*(x-3)`,
        tol: 0.06,
        sol: ({ ym, b }) => poly([+b.toFixed(2), +(ym - 3 * b).toFixed(2)]),
        pistas: [({ ym, b }) => L`$y - ${nt(ym)} = ${nt(b)}\,(x - 3)$. Desarrolla el paréntesis y pasa $${nt(ym)}$ al otro lado.`],
        explicacion: ({ ym, b }) => L`$y = ${poly([+b.toFixed(2), +(ym - 3 * b).toFixed(2)])}$. Con ella podemos estimar las ventas para un gasto dado.`
      }
    ]
  },

  {
    id: 'bid-concepto', tema: 'bidimensional', tipo: 'concepto', nivel: 1,
    titulo: 'Interpretar la correlación',
    enunciado: L`El coeficiente de correlación $r$ toma valores entre $-1$ y $1$.`,
    pasos: [
      {
        tipo: 'opcion',
        texto: L`Si $r = -0{,}95$, la correlación es…`,
        opciones: [
          { t: 'fuerte y negativa', ok: true, fb: 'Correcto: está muy cerca de −1. Cuando una variable aumenta, la otra disminuye.' },
          { t: 'débil y negativa', fb: L`$|r| = 0{,}95$ está muy próximo a 1: es fuerte.` },
          { t: 'fuerte y positiva', fb: 'El signo negativo indica relación inversa.' },
          { t: 'no hay relación', fb: 'Eso sería r ≈ 0.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: 'El signo del coeficiente de correlación coincide siempre con el signo de…',
        opciones: [
          { t: L`la covarianza $s_{xy}$`, ok: true, fb: L`Bien: $r = \frac{s_{xy}}{s_x s_y}$ y las desviaciones típicas son positivas.` },
          { t: L`la media $\bar{x}$`, fb: 'Las medias no influyen en el signo de r.' },
          { t: 'la varianza', fb: 'La varianza es siempre positiva (o cero).' }
        ]
      },
      {
        tipo: 'opcion',
        texto: '¿Cuándo es fiable una estimación hecha con la recta de regresión?',
        opciones: [
          { t: L`Cuando $|r|$ es próximo a 1 y el valor está dentro del rango de los datos`, ok: true, fb: 'Exacto: correlación fuerte y sin extrapolar lejos de los datos.' },
          { t: 'Siempre, si los cálculos están bien hechos', fb: 'Si la correlación es débil, la recta no describe bien los datos.' },
          { t: L`Cuando $r = 0$`, fb: 'Con r = 0 no hay relación lineal: la estimación no vale nada.' },
          { t: 'Cuando la covarianza es positiva', fb: 'El signo no indica fiabilidad; lo que importa es lo cerca que esté |r| de 1.' }
        ]
      }
    ]
  },

  /* =====================================================================
     MATRICES Y DETERMINANTES
     ===================================================================== */
  {
    id: 'mat-producto', tema: 'matrices', tipo: 'guiado', nivel: 1,
    titulo: 'Producto de matrices',
    generar() {
      const A = matR(2, 2, -4, 4), B = matR(2, 2, -4, 4);
      return { A, B, C: mulM(A, B) };
    },
    enunciado: ({ A, B }) => L`Dadas $A = ${pm(A)}$ y $B = ${pm(B)}$, calcula $A\cdot B$.`,
    pasos: [
      {
        tipo: 'num',
        texto: L`El elemento $c_{11}$ se obtiene multiplicando la fila 1 de $A$ por la columna 1 de $B$. ¿Cuánto vale?`,
        respuesta: ({ C }) => C[0][0],
        pistas: [({ A, B }) => L`$c_{11} = a_{11}\,b_{11} + a_{12}\,b_{21} = (${A[0][0]})(${B[0][0]}) + (${A[0][1]})(${B[1][0]})$`],
        errores: [
          { r: ({ A, B }) => A[0][0] * B[0][0], msg: 'Hay que sumar los productos de TODA la fila por TODA la columna: a₁₁·b₁₁ + a₁₂·b₂₁.' },
          { r: ({ A, B }) => A[0][0] * B[0][0] + A[0][1] * B[0][1], msg: 'Has multiplicado fila por fila. Es la fila 1 de A por la COLUMNA 1 de B.' }
        ],
        explicacion: ({ A, B, C }) => L`$c_{11} = (${A[0][0]})(${B[0][0]}) + (${A[0][1]})(${B[1][0]}) = ${C[0][0]}$`
      },
      {
        tipo: 'matriz',
        texto: L`Completa la matriz producto $A\cdot B$ (fila por columna en cada casilla).`,
        prefijo: L`$A\cdot B =$`,
        respuesta: ({ C }) => C,
        errores: [
          { r: ({ A, B }) => mulM(B, A), msg: 'Has calculado B·A. El producto de matrices no es conmutativo: el orden importa.' },
          { r: ({ A, B }) => A.map((f, i) => f.map((v, j) => v * B[i][j])), msg: 'Las matrices no se multiplican elemento a elemento: es fila por columna.' }
        ],
        explicacion: ({ C }) => L`$A\cdot B = ${pm(C)}$`
      }
    ]
  },

  {
    id: 'mat-sarrus', tema: 'matrices', tipo: 'guiado', nivel: 2,
    titulo: 'Determinante 3×3 (regla de Sarrus)',
    generar() {
      const M = matR(3, 3, -3, 4);
      const [[a, b, c], [d, e, f], [g, h, i]] = M;
      const pos = a * e * i + b * f * g + c * d * h;
      const neg = c * e * g + a * f * h + b * d * i;
      return { M, pos, neg, det: pos - neg };
    },
    enunciado: ({ M }) => L`Calcula el determinante de $A = ${pm(M)}$.`,
    pasos: [
      {
        tipo: 'num',
        texto: L`Regla de Sarrus. Calcula la suma de los tres productos que llevan signo $+$: $a_{11}a_{22}a_{33} + a_{12}a_{23}a_{31} + a_{13}a_{21}a_{32}$.`,
        respuesta: ({ pos }) => pos,
        pistas: [({ M: [[a, b, c], [d, e, f], [g, h, i]] }) => L`$(${a})(${e})(${i}) + (${b})(${f})(${g}) + (${c})(${d})(${h})$`],
        explicacion: ({ pos }) => L`Suma de los productos positivos: $${pos}$`
      },
      {
        tipo: 'num',
        texto: L`Calcula ahora la suma de los tres productos que llevan signo $-$ (todavía sin restar): $a_{13}a_{22}a_{31} + a_{11}a_{23}a_{32} + a_{12}a_{21}a_{33}$.`,
        respuesta: ({ neg }) => neg,
        pistas: [({ M: [[a, b, c], [d, e, f], [g, h, i]] }) => L`$(${c})(${e})(${g}) + (${a})(${f})(${h}) + (${b})(${d})(${i})$`],
        explicacion: ({ neg }) => L`Suma de los productos de la diagonal secundaria: $${neg}$`
      },
      {
        tipo: 'num',
        texto: L`¿Cuánto vale $|A|$?`,
        respuesta: ({ det }) => det,
        errores: [
          { r: ({ pos, neg }) => pos + neg, msg: 'La segunda suma se RESTA.' },
          { r: ({ pos, neg }) => neg - pos, msg: 'Lo has restado al revés: (productos con +) − (productos con −).' }
        ],
        explicacion: ({ pos, neg, det }) => L`$|A| = ${pos} - (${neg}) = ${det}$`
      },
      {
        tipo: 'opcion',
        texto: L`¿Tiene inversa la matriz $A$?`,
        opciones: ({ det }) => det !== 0 ? [
          { t: L`Sí, porque $|A| \neq 0$`, ok: true, fb: 'Correcto: una matriz cuadrada es invertible si y solo si su determinante no es 0.' },
          { t: L`No, porque $|A| \neq 0$`, fb: 'Al revés: es justamente cuando |A| = 0 cuando no existe la inversa.' },
          { t: 'No se puede saber sin calcularla', fb: 'Sí se puede: basta con mirar el determinante.' }
        ] : [
          { t: L`No, porque $|A| = 0$`, ok: true, fb: 'Correcto: si el determinante es 0, la matriz no tiene inversa.' },
          { t: 'Sí, todas las matrices cuadradas tienen inversa', fb: 'Solo las que tienen determinante distinto de 0.' },
          { t: 'No se puede saber sin calcularla', fb: 'Sí se puede: basta con mirar el determinante.' }
        ]
      }
    ]
  },

  {
    id: 'mat-inversa', tema: 'matrices', tipo: 'guiado', nivel: 2,
    titulo: 'Matriz inversa 2×2',
    generar() {
      let a, b, c, d, det;
      do { [a, b, c, d] = [R.int(-4, 5), R.int(-4, 5), R.int(-4, 5), R.int(-4, 5)]; det = a * d - b * c; } while (det === 0 || Math.abs(det) > 6);
      return { a, b, c, d, det };
    },
    enunciado: ({ a, b, c, d }) => L`Calcula la inversa de $A = ${pm([[a, b], [c, d]])}$.`,
    pasos: [
      {
        tipo: 'num',
        texto: L`Calcula el determinante $|A|$.`,
        respuesta: ({ det }) => det,
        pistas: [L`$\begin{vmatrix} a & b \\ c & d \end{vmatrix} = a\,d - b\,c$`],
        errores: [{ r: ({ a, b, c, d }) => a * d + b * c, msg: 'El producto de la diagonal secundaria se resta: a·d − b·c.' }],
        explicacion: ({ a, b, c, d, det }) => L`$|A| = (${a})(${d}) - (${b})(${c}) = ${det} \neq 0$, así que existe la inversa.`
      },
      {
        tipo: 'matriz',
        texto: L`Calcula la matriz adjunta traspuesta, $(\operatorname{Adj} A)^t$. Para una matriz $2\times2$: se intercambian los elementos de la diagonal principal y se cambia el signo de los de la secundaria.`,
        prefijo: L`$(\operatorname{Adj} A)^t =$`,
        respuesta: ({ a, b, c, d }) => [[d, -b], [-c, a]],
        errores: [
          { r: ({ a, b, c, d }) => [[d, b], [c, a]], msg: 'Falta cambiar el signo de los elementos de la diagonal secundaria.' },
          { r: ({ a, b, c, d }) => [[a, -b], [-c, d]], msg: 'Falta intercambiar los elementos de la diagonal principal.' },
          { r: ({ a, b, c, d }) => [[d, -c], [-b, a]], msg: 'Esa es la adjunta, pero falta trasponerla.' }
        ],
        explicacion: ({ a, b, c, d }) => L`$(\operatorname{Adj} A)^t = ${pm([[d, -b], [-c, a]])}$`
      },
      {
        tipo: 'matriz',
        texto: L`Divide entre el determinante: $A^{-1} = \dfrac{1}{|A|}(\operatorname{Adj} A)^t$.`,
        prefijo: L`$A^{-1} =$`,
        respuesta: ({ a, b, c, d, det }) => [[d / det, -b / det], [-c / det, a / det]],
        errores: [{ r: ({ a, b, c, d, det }) => [[d * det, -b * det], [-c * det, a * det]], msg: 'Hay que DIVIDIR entre |A|, no multiplicar.' }],
        sol: ({ a, b, c, d, det }) => pm([[fr(d, det), fr(-b, det)], [fr(-c, det), fr(a, det)]]),
        explicacion: ({ a, b, c, d, det }) => L`$A^{-1} = ${pm([[fr(d, det), fr(-b, det)], [fr(-c, det), fr(a, det)]])}$. Puedes comprobarlo: $A\cdot A^{-1} = I$.`
      }
    ]
  },

  {
    id: 'mat-concepto', tema: 'matrices', tipo: 'concepto', nivel: 2,
    titulo: 'Propiedades de matrices y determinantes',
    enunciado: 'Piensa antes de responder: estas propiedades se usan constantemente.',
    pasos: [
      {
        tipo: 'opcion',
        texto: L`Si $A$ es de dimensión $2\times3$ y $B$ es $3\times4$, la matriz $A\cdot B$ es…`,
        opciones: [
          { t: L`$2\times4$`, ok: true, fb: L`Correcto: $(2\times\mathbf{3})\cdot(\mathbf{3}\times4) = 2\times4$.` },
          { t: L`$3\times3$`, fb: 'Las dimensiones que coinciden (3 y 3) son las que «desaparecen».' },
          { t: 'No se pueden multiplicar', fb: 'Sí se pueden: las columnas de A (3) coinciden con las filas de B (3).' },
          { t: L`$4\times2$`, fb: 'El resultado tiene las filas de A y las columnas de B.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: L`Si $A$ es cuadrada de orden 3, $\det(2A)$ es igual a…`,
        opciones: [
          { t: L`$8\det A$`, ok: true, fb: L`Bien: el 2 multiplica a cada una de las 3 filas, así que sale $2^3 = 8$.` },
          { t: L`$2\det A$`, fb: 'Multiplicar UNA fila por 2 duplica el determinante, pero 2A multiplica TODAS las filas.' },
          { t: L`$6\det A$`, fb: L`No es $2\cdot 3$, sino $2^3$.` },
          { t: L`$4\det A$`, fb: L`Eso sería para orden 2: $2^2 = 4$.` }
        ]
      },
      {
        tipo: 'opcion',
        texto: 'Si dos filas de una matriz cuadrada son proporcionales, su determinante…',
        opciones: [
          { t: 'vale 0', ok: true, fb: 'Correcto: es una de las propiedades más útiles de los determinantes.' },
          { t: 'vale 1', fb: 'No: las filas proporcionales anulan el determinante.' },
          { t: 'cambia de signo', fb: 'Eso ocurre al intercambiar dos filas.' }
        ]
      }
    ]
  },

  /* =====================================================================
     INTEGRALES
     ===================================================================== */
  {
    id: 'int-primitiva', tema: 'integrales', tipo: 'guiado', nivel: 1,
    titulo: 'Primitiva de un polinomio',
    generar: () => ({ a: R.nz(-3, 3) * 3, b: R.nz(-4, 4) * 2, c: R.nz(-6, 6) }),
    enunciado: ({ a, b, c }) => L`Calcula $\displaystyle\int (${poly([a, b, c])})\,dx$.`,
    pasos: [
      {
        tipo: 'expr', modo: 'primitiva',
        texto: ({ a }) => L`Empieza por el primer término. Calcula una primitiva de $${poly([a, 0, 0])}$.`,
        respuesta: ({ a }) => polyS([a / 3, 0, 0, 0]),
        pistas: [
          L`Regla: $\displaystyle\int x^n\,dx = \frac{x^{n+1}}{n+1}$. Se suma 1 al exponente y se divide entre el nuevo exponente.`,
          ({ a }) => L`$\displaystyle\int ${a}x^2\,dx = ${a}\cdot\frac{x^3}{3}$`
        ],
        errores: [
          { r: ({ a }) => polyS([2 * a, 0]), msg: '¡Has derivado! Para integrar se SUMA 1 al exponente y se DIVIDE entre el nuevo exponente.' },
          { r: ({ a }) => polyS([a, 0, 0, 0]), msg: 'Has subido el exponente, pero falta dividir entre el nuevo exponente (3).' },
          { r: ({ a }) => polyS([a / 2, 0, 0, 0]), msg: 'Hay que dividir entre el NUEVO exponente (3), no entre el antiguo.' }
        ],
        explicacion: ({ a }) => L`$\displaystyle\int ${poly([a, 0, 0])}\,dx = ${poly([a / 3, 0, 0, 0])} + C$`
      },
      {
        tipo: 'expr', modo: 'primitiva',
        texto: L`Ahora integra la función completa. Puedes añadir $+C$ al final o no.`,
        prefijo: L`$\displaystyle\int f(x)\,dx =$`,
        respuesta: ({ a, b, c }) => polyS([a / 3, b / 2, c, 0]),
        sol: ({ a, b, c }) => poly([a / 3, b / 2, c, 0]) + ' + C',
        pistas: [L`Integra término a término. La primitiva de un número $k$ es $k\,x$.`],
        errores: [
          { r: ({ a, b }) => polyS([2 * a, b]), msg: 'Has derivado en lugar de integrar.' },
          { r: ({ a, b }) => polyS([a / 3, b / 2, 0, 0]), msg: ({ c }) => L`Falta la primitiva del término independiente: $\int ${c}\,dx = ${poly([c, 0])}$.` },
          { r: ({ a, b, c }) => polyS([a / 3, b, c, 0]), msg: L`Revisa el término en $x$: $\int b\,x\,dx = \frac{b}{2}x^2$.` }
        ],
        explicacion: ({ a, b, c }) => L`$\displaystyle\int (${poly([a, b, c])})\,dx = ${poly([a / 3, b / 2, c, 0])} + C$. La constante $C$ indica que hay infinitas primitivas.`
      }
    ]
  },

  {
    id: 'int-barrow', tema: 'integrales', tipo: 'guiado', nivel: 2,
    titulo: 'Integral definida: regla de Barrow',
    generar() {
      const a = R.nz(-2, 2) * 3, b = R.int(-3, 3) * 2, c = R.int(-5, 5);
      const l = R.int(-2, 1), u = l + R.int(1, 3);
      const F = x => evalPoly([a / 3, b / 2, c, 0], x);
      return { a, b, c, l, u, Fu: F(u), Fl: F(l) };
    },
    enunciado: ({ a, b, c, l, u }) => L`Calcula $\displaystyle\int_{${l}}^{${u}} (${poly([a, b, c])})\,dx$ aplicando la regla de Barrow.`,
    pasos: [
      {
        tipo: 'expr', modo: 'primitiva',
        texto: L`Encuentra una primitiva $F(x)$ de la función.`,
        prefijo: L`$F(x) =$`,
        respuesta: ({ a, b, c }) => polyS([a / 3, b / 2, c, 0]),
        pistas: [L`$\displaystyle\int x^n\,dx = \frac{x^{n+1}}{n+1}$, término a término.`],
        errores: [{ r: ({ a, b }) => polyS([2 * a, b]), msg: 'Has derivado en lugar de integrar.' }],
        explicacion: ({ a, b, c }) => L`$F(x) = ${poly([a / 3, b / 2, c, 0])}$ (en Barrow podemos tomar $C = 0$).`
      },
      {
        tipo: 'num',
        texto: ({ u }) => L`Calcula $F(${u})$ (con $C = 0$).`,
        respuesta: ({ Fu }) => Fu,
        explicacion: ({ u, Fu }) => L`$F(${u}) = ${Fu}$`
      },
      {
        tipo: 'num',
        texto: ({ l }) => L`Calcula $F(${l})$.`,
        respuesta: ({ Fl }) => Fl,
        pistas: ['Si el número es negativo, usa paréntesis: las potencias impares conservan el signo.'],
        explicacion: ({ l, Fl }) => L`$F(${l}) = ${Fl}$`
      },
      {
        tipo: 'num',
        texto: L`Aplica la regla de Barrow: $\displaystyle\int_a^b f(x)\,dx = F(b) - F(a)$.`,
        respuesta: ({ Fu, Fl }) => Fu - Fl,
        errores: [
          { r: ({ Fu, Fl }) => Fl - Fu, msg: 'Es F(b) − F(a): el límite superior menos el inferior.' },
          { r: ({ Fu, Fl }) => Fu + Fl, msg: 'Los valores se restan, no se suman.' }
        ],
        explicacion: ({ Fu, Fl, l, u }) => L`$\displaystyle\int_{${l}}^{${u}} f(x)\,dx = ${Fu} - (${Fl}) = ${Fu - Fl}$`
      }
    ]
  },

  {
    id: 'int-concepto', tema: 'integrales', tipo: 'concepto', nivel: 1,
    titulo: 'Primitivas e integral definida',
    enunciado: 'Repasa los conceptos clave del cálculo integral.',
    pasos: [
      {
        tipo: 'opcion',
        texto: L`Si $F$ es una primitiva de $f$, entonces…`,
        opciones: [
          { t: L`$F'(x) = f(x)$`, ok: true, fb: 'Correcto: integrar es la operación inversa de derivar.' },
          { t: L`$f'(x) = F(x)$`, fb: 'Al revés: al derivar la primitiva obtienes la función.' },
          { t: L`$F(x) = f(x)$`, fb: 'Son funciones distintas: una es la derivada de la otra.' },
          { t: L`$F''(x) = f(x)$`, fb: 'Basta con derivar una vez.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: L`$\displaystyle\int_a^a f(x)\,dx$ vale…`,
        opciones: [
          { t: L`$0$`, ok: true, fb: L`Bien: $F(a) - F(a) = 0$. No hay intervalo.` },
          { t: L`$f(a)$`, fb: L`Aplica Barrow: $F(a) - F(a)$.` },
          { t: 'Depende de la función', fb: 'Siempre vale 0, sea cual sea f.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: L`Si $f(x) < 0$ en todo el intervalo $[a, b]$, la integral $\displaystyle\int_a^b f(x)\,dx$…`,
        opciones: [
          { t: 'es negativa, y el área es su valor absoluto', ok: true, fb: 'Correcto: cuando la función está por debajo del eje, la integral da negativo.' },
          { t: 'es el área encerrada', fb: 'El área es siempre positiva; aquí la integral es negativa.' },
          { t: 'vale 0', fb: 'Solo valdría 0 si se compensaran partes positivas y negativas.' }
        ]
      }
    ]
  },

  /* =====================================================================
     PROGRAMACIÓN LINEAL
     ===================================================================== */
  {
    id: 'pl-vertices', tema: 'plineal', tipo: 'guiado', nivel: 2,
    titulo: 'Maximizar en una región factible',
    generar() {
      for (;;) {
        const S = R.int(8, 14), A = R.int(3, S - 3), B = R.int(S - A + 1, S - 1);
        const p = R.int(1, 6), q = R.int(1, 6);
        if (p === q) continue;
        const V = [[0, 0], [A, 0], [A, S - A], [S - B, B], [0, B]];
        const z = V.map(([x, y]) => p * x + q * y);
        const max = Math.max(...z);
        if (z.filter(v => v === max).length === 1) return { S, A, B, p, q, V, z, max, iMax: z.indexOf(max) };
      }
    },
    enunciado: ({ S, A, B, p, q }) => L`Maximiza $z = ${p}x + ${q}y$ sujeto a las restricciones: $$\begin{cases} x + y \le ${S} \\ x \le ${A} \\ y \le ${B} \\ x \ge 0,\ y \ge 0 \end{cases}$$ La región factible es el polígono sombreado.`,
    figura: svgRegion,
    pasos: [
      {
        tipo: 'lista', ordenada: true,
        texto: ({ S, A }) => L`Halla el vértice donde se cortan las rectas $x = ${A}$ y $x + y = ${S}$. Escribe sus coordenadas así: x; y`,
        respuesta: ({ S, A }) => [A, S - A],
        pistas: [({ S, A }) => L`Sustituye $x = ${A}$ en $x + y = ${S}$ y despeja $y$.`],
        errores: [{ r: ({ S, A }) => [S - A, A], msg: 'Has intercambiado x e y. El orden es (x, y).' }],
        explicacion: ({ S, A }) => L`Vértice $(${A},\ ${S - A})$`
      },
      {
        tipo: 'lista', ordenada: true,
        texto: ({ S, B }) => L`Halla el vértice donde se cortan $y = ${B}$ y $x + y = ${S}$.`,
        respuesta: ({ S, B }) => [S - B, B],
        pistas: [({ S, B }) => L`Sustituye $y = ${B}$ en $x + y = ${S}$.`],
        errores: [{ r: ({ S, B }) => [B, S - B], msg: 'Has intercambiado x e y. El orden es (x, y).' }],
        explicacion: ({ S, B }) => L`Vértice $(${S - B},\ ${B})$`
      },
      {
        tipo: 'opcion',
        texto: ({ p, q }) => L`Evalúa $z = ${p}x + ${q}y$ en todos los vértices de la región. ¿En cuál se alcanza el máximo?`,
        opciones: ({ V, z, iMax, p, q }) => V.map(([x, y], i) => ({
          t: L`$(${x},\ ${y})$`,
          ok: i === iMax,
          fb: i === iMax
            ? L`Correcto: $z(${x}, ${y}) = ${p}\cdot ${x} + ${q}\cdot ${y} = ${z[i]}$, el mayor valor.`
            : L`En $(${x}, ${y})$: $z = ${p}\cdot ${x} + ${q}\cdot ${y} = ${z[i]}$. ¿Es el mayor de todos? Calcula $z$ en los demás vértices.`
        })),
        explicacion: ({ V, z }) => 'Valores: ' + V.map(([x, y], i) => L`$z(${x},${y}) = ${z[i]}$`).join(' · ')
      },
      {
        tipo: 'num',
        texto: L`¿Cuál es el valor máximo de $z$?`,
        respuesta: ({ max }) => max,
        explicacion: ({ V, iMax, max }) => L`El máximo es $z = ${max}$, en el vértice $(${V[iMax][0]},\ ${V[iMax][1]})$.`
      }
    ]
  },

  {
    id: 'pl-concepto', tema: 'plineal', tipo: 'concepto', nivel: 1,
    titulo: 'Región factible y solución óptima',
    enunciado: 'Ideas clave de la programación lineal.',
    pasos: [
      {
        tipo: 'opcion',
        texto: 'La región factible es…',
        opciones: [
          { t: 'el conjunto de puntos que cumplen todas las restricciones', ok: true, fb: 'Exacto: es la intersección de todos los semiplanos.' },
          { t: 'el conjunto de puntos donde la función objetivo vale 0', fb: 'Esa es una recta de nivel, no la región factible.' },
          { t: 'el punto donde se alcanza el máximo', fb: 'Ese es el óptimo, que está dentro (en un vértice) de la región factible.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: 'Si la región factible es un polígono acotado, el máximo de la función objetivo se alcanza…',
        opciones: [
          { t: 'en un vértice (o en todo un lado, si dos vértices empatan)', ok: true, fb: 'Correcto: por eso basta con evaluar la función en los vértices.' },
          { t: 'en el centro de la región', fb: 'Al moverte en la dirección de mejora llegas siempre al borde, a un vértice.' },
          { t: 'siempre en el origen', fb: 'En el origen suele estar el mínimo cuando los coeficientes son positivos.' }
        ]
      },
      {
        tipo: 'opcion',
        texto: L`¿Cumple el punto $(2, 3)$ la restricción $2x + y \le 6$?`,
        opciones: [
          { t: L`No, porque $2\cdot 2 + 3 = 7 > 6$`, ok: true, fb: 'Bien: el punto queda fuera del semiplano.' },
          { t: L`Sí, porque $2 + 3 = 5 \le 6$`, fb: 'Te has olvidado del coeficiente 2 de la x.' },
          { t: 'Sí, porque las dos coordenadas son positivas', fb: 'Eso solo garantiza que cumple x ≥ 0 e y ≥ 0.' }
        ]
      }
    ]
  },

  /* =====================================================================
     PROBABILIDAD
     ===================================================================== */
  {
    id: 'prob-bayes', tema: 'probabilidad', tipo: 'guiado', nivel: 2,
    titulo: 'Probabilidad total y teorema de Bayes',
    generar() {
      const a = R.pick([30, 40, 45, 55, 60, 70]), dA = R.pick([2, 3, 4, 5]), dB = R.pick([1, 6, 7, 8]);
      const pA = a / 100, pB = 1 - pA, pAD = pA * dA / 100, pD = pAD + pB * dB / 100;
      return { a, dA, dB, pA, pB, pAD, pD };
    },
    enunciado: ({ a, dA, dB }) => L`Una fábrica tiene dos máquinas. La máquina $A$ produce el $${a}\,\%$ de las piezas y la máquina $B$ el resto. El $${dA}\,\%$ de las piezas de $A$ son defectuosas, y también el $${dB}\,\%$ de las de $B$. Se elige una pieza al azar. Llamamos $D$ al suceso «la pieza es defectuosa».`,
    pasos: [
      {
        tipo: 'num',
        texto: L`¿Cuál es $P(B)$?`,
        respuesta: ({ pB }) => pB,
        errores: [{ r: ({ a }) => 100 - a, msg: 'Expresa la probabilidad entre 0 y 1: divide entre 100.' }],
        explicacion: ({ pA, pB }) => L`$P(B) = 1 - ${nt(pA)} = ${nt(pB)}$`
      },
      {
        tipo: 'num',
        texto: L`Calcula $P(A \cap D) = P(A)\cdot P(D \mid A)$.`,
        respuesta: ({ pAD }) => pAD,
        pistas: [({ pA, dA }) => L`$P(A) = ${nt(pA)}$ y $P(D\mid A) = ${nt(dA / 100)}$`],
        errores: [{ r: ({ dA }) => dA / 100, msg: L`Eso es solo $P(D\mid A)$. Hay que multiplicar por $P(A)$.` }],
        explicacion: ({ pA, dA, pAD }) => L`$P(A\cap D) = ${nt(pA)}\cdot ${nt(dA / 100)} = ${nt(pAD)}$`
      },
      {
        tipo: 'num',
        texto: L`Usa el teorema de la probabilidad total para calcular $P(D)$.`,
        respuesta: ({ pD }) => pD,
        pistas: [L`$P(D) = P(A)\,P(D\mid A) + P(B)\,P(D\mid B)$`],
        errores: [{ r: ({ dA, dB }) => (dA + dB) / 100, msg: 'No basta con sumar los porcentajes: cada probabilidad condicionada se multiplica por la probabilidad de su máquina.' }],
        explicacion: ({ pA, pB, dA, dB, pD }) => L`$P(D) = ${nt(pA)}\cdot ${nt(dA / 100)} + ${nt(pB)}\cdot ${nt(dB / 100)} = ${nt(pD)}$`
      },
      {
        tipo: 'num',
        texto: L`Si la pieza es defectuosa, ¿cuál es la probabilidad de que venga de la máquina $A$? (redondea a 4 decimales)`,
        respuesta: ({ pAD, pD }) => pAD / pD,
        tol: 0.0006,
        pistas: [L`Teorema de Bayes: $P(A\mid D) = \dfrac{P(A\cap D)}{P(D)}$`],
        errores: [
          { r: ({ dA }) => dA / 100, msg: L`Eso es $P(D\mid A)$. Te piden $P(A\mid D)$: ahora la condición es que la pieza sea defectuosa.` },
          { r: ({ pAD }) => pAD, msg: L`Eso es $P(A\cap D)$. Falta dividir entre $P(D)$.` }
        ],
        explicacion: ({ pAD, pD }) => L`$P(A\mid D) = \dfrac{${nt(pAD)}}{${nt(pD)}} \approx ${nt(pAD / pD)}$`
      }
    ]
  },

  {
    id: 'prob-independientes', tema: 'probabilidad', tipo: 'guiado', nivel: 1,
    titulo: 'Sucesos independientes, unión y contrario',
    generar: () => ({ pA: R.pick([0.2, 0.3, 0.4, 0.5, 0.6]), pB: R.pick([0.1, 0.25, 0.3, 0.5, 0.7]) }),
    enunciado: ({ pA, pB }) => L`$A$ y $B$ son sucesos independientes con $P(A) = ${nt(pA)}$ y $P(B) = ${nt(pB)}$.`,
    pasos: [
      {
        tipo: 'num',
        texto: L`Calcula $P(A\cap B)$.`,
        respuesta: ({ pA, pB }) => pA * pB,
        pistas: [L`Si $A$ y $B$ son independientes, $P(A\cap B) = P(A)\cdot P(B)$.`],
        errores: [{ r: ({ pA, pB }) => pA + pB, msg: 'La intersección de sucesos independientes es un producto, no una suma.' }],
        explicacion: ({ pA, pB }) => L`$P(A\cap B) = ${nt(pA)}\cdot ${nt(pB)} = ${nt(pA * pB)}$`
      },
      {
        tipo: 'num',
        texto: L`Calcula $P(A\cup B)$.`,
        respuesta: ({ pA, pB }) => pA + pB - pA * pB,
        pistas: [L`$P(A\cup B) = P(A) + P(B) - P(A\cap B)$`],
        errores: [{ r: ({ pA, pB }) => pA + pB, msg: L`Falta restar $P(A\cap B)$: si no, la intersección se cuenta dos veces.` }],
        explicacion: ({ pA, pB }) => L`$P(A\cup B) = ${nt(pA)} + ${nt(pB)} - ${nt(pA * pB)} = ${nt(pA + pB - pA * pB)}$`
      },
      {
        tipo: 'num',
        texto: L`Calcula la probabilidad de que no ocurra ninguno de los dos: $P(\overline{A}\cap\overline{B})$.`,
        respuesta: ({ pA, pB }) => 1 - (pA + pB - pA * pB),
        pistas: [L`Leyes de De Morgan: $\overline{A}\cap\overline{B} = \overline{A\cup B}$.`],
        errores: [{ r: ({ pA, pB }) => (1 - pA) + (1 - pB), msg: 'Has sumado los contrarios. Usa De Morgan: es el contrario de la unión.' }],
        explicacion: ({ pA, pB }) => L`$P(\overline{A}\cap\overline{B}) = 1 - P(A\cup B) = ${nt(1 - (pA + pB - pA * pB))}$. También: $(1-${nt(pA)})(1-${nt(pB)})$, porque los contrarios también son independientes.`
      }
    ]
  },

  {
    id: 'prob-concepto', tema: 'probabilidad', tipo: 'concepto', nivel: 1,
    titulo: 'Incompatibles, independientes y condicionada',
    enunciado: 'Dos conceptos que se confunden a menudo: sucesos incompatibles y sucesos independientes.',
    pasos: [
      {
        tipo: 'opcion',
        texto: 'Dos sucesos son incompatibles cuando…',
        opciones: [
          { t: L`no pueden ocurrir a la vez: $P(A\cap B) = 0$`, ok: true, fb: 'Correcto.' },
          { t: L`$P(A\cap B) = P(A)\cdot P(B)$`, fb: 'Esa es la definición de sucesos independientes.' },
          { t: L`$P(A) + P(B) = 1$`, fb: 'Eso no es la definición (ocurre, por ejemplo, con un suceso y su contrario).' }
        ]
      },
      {
        tipo: 'opcion',
        texto: L`$P(A\mid B)$ significa…`,
        opciones: [
          { t: L`la probabilidad de $A$ sabiendo que ha ocurrido $B$`, ok: true, fb: L`Bien: $P(A\mid B) = \frac{P(A\cap B)}{P(B)}$.` },
          { t: L`la probabilidad de $B$ sabiendo que ha ocurrido $A$`, fb: 'Al revés: lo que va detrás de la barra es lo que ya sabemos que ha ocurrido.' },
          { t: L`la probabilidad de que ocurran $A$ y $B$`, fb: L`Eso es $P(A\cap B)$.` }
        ]
      },
      {
        tipo: 'opcion',
        texto: L`Si $A$ y $B$ son independientes, con $P(A) > 0$ y $P(B) > 0$, ¿pueden ser incompatibles?`,
        opciones: [
          { t: L`No, porque $P(A\cap B) = P(A)\,P(B) > 0$`, ok: true, fb: 'Exacto: si fueran incompatibles, la intersección valdría 0.' },
          { t: 'Sí, siempre', fb: L`Si son independientes, $P(A\cap B) = P(A)P(B) \neq 0$, así que pueden ocurrir a la vez.` },
          { t: L`Solo si $P(A) = P(B)$`, fb: 'Las probabilidades iguales no tienen nada que ver.' }
        ]
      }
    ]
  }
];
