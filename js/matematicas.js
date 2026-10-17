/* =========================================================================
   Motor matemático de la práctica guiada
   - Interpreta lo que escribe el alumno (3x^2 - 2x, 1/2, sqrt(x), sen(x)...)
   - Lo convierte a LaTeX para la vista previa
   - Comprueba si es equivalente a la respuesta correcta
   ========================================================================= */
const Mates = (() => {
  const FUNCS = {
    sqrt: Math.sqrt, raiz: Math.sqrt, sen: Math.sin, sin: Math.sin, cos: Math.cos, tan: Math.tan, tg: Math.tan,
    ln: Math.log, log: Math.log10, exp: Math.exp, abs: Math.abs,
    arcsen: Math.asin, arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan, arctg: Math.atan
  };
  const NOMBRES = Object.keys(FUNCS).concat(['pi']).sort((a, b) => b.length - a.length);
  const TEX_FUNC = {
    sen: '\\operatorname{sen}', sin: '\\operatorname{sen}', cos: '\\cos', tan: '\\operatorname{tg}', tg: '\\operatorname{tg}',
    ln: '\\ln', log: '\\log', exp: '\\exp', arcsen: '\\operatorname{arcsen}', arcsin: '\\operatorname{arcsen}',
    arccos: '\\arccos', arctan: '\\operatorname{arctg}', arctg: '\\operatorname{arctg}'
  };

  function normalizar(s) {
    return String(s)
      .replace(/[−–—]/g, '-').replace(/[×·⋅∙]/g, '*').replace(/÷|:/g, '/')
      .replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/²/g, '^2').replace(/³/g, '^3')
      .replace(/\*\*/g, '^').replace(/[[{]/g, '(').replace(/[\]}]/g, ')');
  }

  function tokenizar(src) {
    const s = normalizar(src);
    const t = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.,]/.test(c)) {
        let j = i;
        while (j < s.length && /[0-9.,]/.test(s[j])) j++;
        const bruto = s.slice(i, j);
        const limpio = bruto.replace(',', '.');
        if (/[.,].*[.,]/.test(bruto) || limpio === '.') throw new Error(`El número «${bruto}» está mal escrito`);
        t.push({ tipo: 'num', valor: parseFloat(limpio) });
        i = j;
        continue;
      }
      if (/[a-zA-ZñÑ]/.test(c)) {
        const resto = s.slice(i).toLowerCase();
        const nombre = NOMBRES.find(n => resto.startsWith(n));
        if (nombre === 'pi') { t.push({ tipo: 'const', nombre: 'pi' }); i += 2; continue; }
        if (nombre) { t.push({ tipo: 'func', nombre }); i += nombre.length; continue; }
        if (c === 'e') { t.push({ tipo: 'const', nombre: 'e' }); i++; continue; }
        t.push({ tipo: 'var', nombre: c });
        i++;
        continue;
      }
      if ('+-*/^()'.includes(c)) { t.push({ tipo: 'op', valor: c }); i++; continue; }
      if (c === '=') throw new Error('Escribe solo el resultado, sin el signo «=»');
      throw new Error(`No entiendo el símbolo «${c}»`);
    }
    return t;
  }

  function parse(src) {
    const t = tokenizar(src);
    if (!t.length) throw new Error('No has escrito nada');
    let p = 0;
    const peek = () => t[p];
    const esOp = v => peek() && peek().tipo === 'op' && peek().valor === v;
    const empiezaFactor = k => k && (k.tipo !== 'op' || k.valor === '(');

    function cerrar() {
      const k = t[p++];
      if (!k || k.valor !== ')') throw new Error('Falta cerrar un paréntesis');
    }
    function expr() {
      let n = term();
      while (esOp('+') || esOp('-')) {
        const op = t[p++].valor;
        n = { tipo: 'bin', op, a: n, b: term() };
      }
      return n;
    }
    function term() {
      let n = unario();
      for (;;) {
        if (esOp('*') || esOp('/')) {
          const op = t[p++].valor;
          n = { tipo: 'bin', op, a: n, b: unario() };
        } else if (empiezaFactor(peek())) {
          n = { tipo: 'bin', op: '*', a: n, b: potencia(), implicito: true };
        } else break;
      }
      return n;
    }
    function unario() {
      if (esOp('-')) { p++; return { tipo: 'neg', a: unario() }; }
      if (esOp('+')) { p++; return unario(); }
      return potencia();
    }
    function potencia() {
      const base = primario();
      if (esOp('^')) { p++; return { tipo: 'bin', op: '^', a: base, b: unario() }; }
      return base;
    }
    function primario() {
      const k = t[p++];
      if (!k) throw new Error('La expresión está incompleta');
      if (k.tipo === 'num') return { tipo: 'num', valor: k.valor };
      if (k.tipo === 'var') return { tipo: 'var', nombre: k.nombre };
      if (k.tipo === 'const') return { tipo: 'const', nombre: k.nombre };
      if (k.tipo === 'func') {
        let exp = null;
        if (esOp('^')) { p++; exp = primario(); }
        let arg;
        if (esOp('(')) { p++; arg = expr(); cerrar(); } else arg = potencia();
        let n = { tipo: 'func', nombre: k.nombre, a: arg };
        if (exp) n = { tipo: 'bin', op: '^', a: n, b: exp };
        return n;
      }
      if (k.valor === '(') { const n = expr(); cerrar(); return { tipo: 'paren', a: n }; }
      if (k.valor === ')') throw new Error('Sobra un paréntesis de cierre');
      throw new Error(`Falta algo antes de «${k.valor}»`);
    }

    const arbol = expr();
    if (p < t.length) {
      const k = t[p];
      throw new Error(k.valor === ')' ? 'Sobra un paréntesis de cierre' : `Sobra algo al final: «${k.valor || k.nombre}»`);
    }
    return arbol;
  }

  function variables(n, set = new Set()) {
    if (n.tipo === 'var') set.add(n.nombre);
    if (n.a) variables(n.a, set);
    if (n.b) variables(n.b, set);
    return set;
  }

  function evaluar(n, env) {
    switch (n.tipo) {
      case 'num': return n.valor;
      case 'var': return env[n.nombre];
      case 'const': return n.nombre === 'pi' ? Math.PI : Math.E;
      case 'paren': return evaluar(n.a, env);
      case 'neg': return -evaluar(n.a, env);
      case 'func': return FUNCS[n.nombre](evaluar(n.a, env));
      case 'bin': {
        const a = evaluar(n.a, env), b = evaluar(n.b, env);
        switch (n.op) {
          case '+': return a + b;
          case '-': return a - b;
          case '*': return a * b;
          case '/': return a / b;
          case '^': return Math.pow(a, b);
        }
      }
    }
    return NaN;
  }

  /* ---- Conversión a LaTeX (vista previa y soluciones) ---- */
  const sinParen = n => (n.tipo === 'paren' ? n.a : n);
  const izquierda = n => (n.tipo === 'bin' ? izquierda(n.a) : n.tipo === 'neg' ? n : n);
  function aTex(n) {
    switch (n.tipo) {
      case 'num': return String(+n.valor.toPrecision(12)).replace('.', '{,}');
      case 'var': return n.nombre;
      case 'const': return n.nombre === 'pi' ? '\\pi ' : 'e';
      case 'paren': return '\\left(' + aTex(n.a) + '\\right)';
      case 'neg': return '-' + aTex(n.a);
      case 'func':
        if (n.nombre === 'sqrt' || n.nombre === 'raiz') return '\\sqrt{' + aTex(sinParen(n.a)) + '}';
        if (n.nombre === 'abs') return '\\left|' + aTex(sinParen(n.a)) + '\\right|';
        return TEX_FUNC[n.nombre] + '\\left(' + aTex(sinParen(n.a)) + '\\right)';
      case 'bin': {
        if (n.op === '/') return '\\dfrac{' + aTex(sinParen(n.a)) + '}{' + aTex(sinParen(n.b)) + '}';
        if (n.op === '^') {
          const base = ['bin', 'neg', 'func'].includes(n.a.tipo) || (n.a.tipo === 'num' && n.a.valor < 0)
            ? '\\left(' + aTex(n.a) + '\\right)' : aTex(n.a);
          return '{' + base + '}^{' + aTex(sinParen(n.b)) + '}';
        }
        if (n.op === '*') {
          const izq = izquierda(n.b);
          const punto = izq.tipo === 'num' || izq.tipo === 'neg';
          return aTex(n.a) + (punto ? ' \\cdot ' : '\\,') + aTex(n.b);
        }
        return aTex(n.a) + ' ' + n.op + ' ' + aTex(n.b);
      }
    }
    return '';
  }
  const tex = src => limpiarTex(aTex(parse(src)));
  const limpiarTex = s => s.replace(/\+\s*-/g, '- ').replace(/-\s*-/g, '+ ');

  /* Número bonito en LaTeX: entero, fracción sencilla, múltiplo de π o decimal */
  function numTex(v) {
    if (!isFinite(v)) return '\\text{—}';
    const r = Math.round(v);
    if (Math.abs(v - r) < 1e-9) return String(r);
    for (let d = 2; d <= 12; d++) {
      const n = v * d;
      if (Math.abs(n - Math.round(n)) < 1e-9 && Math.abs(n) < 500) {
        const N = Math.round(n);
        return (N < 0 ? '-' : '') + `\\dfrac{${Math.abs(N)}}{${d}}`;
      }
    }
    const q = v / Math.PI;
    for (let d = 1; d <= 12; d++) {
      const n = q * d;
      if (Math.abs(n - Math.round(n)) < 1e-9 && Math.abs(n) < 50) {
        const N = Math.round(n);
        const num = (Math.abs(N) === 1 ? '' : Math.abs(N)) + '\\pi';
        return (N < 0 ? '-' : '') + (d === 1 ? num : `\\dfrac{${num}}{${d}}`);
      }
    }
    return String(Math.round(v * 10000) / 10000).replace('.', '{,}');
  }

  /* ---- Comprobación ---- */
  function compilar(src, vars) {
    const arbol = parse(src);
    for (const v of variables(arbol)) {
      if (!vars.includes(v)) {
        throw new Error(vars.length
          ? `La letra «${v}» no debería aparecer aquí (usa ${vars.join(', ')})`
          : `Aquí la respuesta es un número: no uses la letra «${v}»`);
      }
    }
    return arbol;
  }

  function numero(src) {
    if (typeof src === 'number') return src;
    const s = String(src).replace(/^\s*[a-zA-Z][a-zA-Z0-9_]*\s*=\s*/, '');
    const v = evaluar(compilar(s, []), {});
    if (!isFinite(v)) throw new Error('El resultado no es un número (¿divides entre 0?)');
    return v;
  }

  function igualNum(a, b, tol) {
    if (tol != null) return Math.abs(a - b) <= tol + 1e-9;
    return Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));
  }

  /* Dos expresiones son equivalentes si coinciden en muchos puntos al azar.
     modo 'primitiva': basta con que la diferencia sea constante (+C). */
  function equivalentes(entrada, esperado, vars, modo, tol) {
    let src = String(entrada);
    if (modo === 'primitiva') src = src.replace(/[+-]\s*[CKk]\s*$/, '');
    const ta = compilar(src, vars);
    const tb = parse(String(esperado));
    let validos = 0;
    const difs = [];
    for (let i = 0; i < 60 && validos < 10; i++) {
      const env = {};
      vars.forEach(v => {
        let x = Math.round((Math.random() * 6 - 3) * 1000) / 1000;
        if (i % 2) x = Math.abs(x) + 0.13;
        env[v] = x;
      });
      const b = evaluar(tb, env);
      if (!isFinite(b)) continue;
      const a = evaluar(ta, env);
      if (!isFinite(a)) return false;
      validos++;
      const escala = Math.max(1, Math.abs(a), Math.abs(b));
      if (modo === 'primitiva') difs.push([a - b, escala]);
      else if (tol != null ? Math.abs(a - b) > tol : Math.abs(a - b) > 1e-7 * escala) return false;
    }
    if (validos < 3) return false;
    if (modo === 'primitiva') return difs.every(([d, e]) => Math.abs(d - difs[0][0]) <= 1e-7 * e);
    return true;
  }

  /* Separa una lista de números: «2; -3», «x=2, x=-3», «(1, 4)» */
  function lista(src, n) {
    let s = String(src).trim().replace(/^\(|\)$/g, '').replace(/\s+y\s+/g, ';');
    let partes;
    if (s.includes(';')) partes = s.split(';');
    else if (s.split(',').length === n) partes = s.split(',');
    else partes = [s];
    return partes.map(x => x.trim()).filter(Boolean).map(numero);
  }

  function comprobar(paso, respuesta, entrada) {
    const tipo = paso.tipo || 'num';
    switch (tipo) {
      case 'num':
        return igualNum(numero(entrada), numero(respuesta), paso.tol);
      case 'expr':
        return equivalentes(entrada, respuesta, paso.vars || ['x'], paso.modo, paso.tol);
      case 'lista': {
        const esp = respuesta.map(numero);
        const dada = lista(entrada, esp.length);
        if (dada.length !== esp.length) return false;
        if (paso.ordenada) return dada.every((v, i) => igualNum(v, esp[i], paso.tol));
        const a = [...dada].sort((x, y) => x - y), b = [...esp].sort((x, y) => x - y);
        return a.every((v, i) => igualNum(v, b[i], paso.tol));
      }
      case 'matriz':
        return respuesta.every((fila, i) => fila.every((v, j) => igualNum(numero(entrada[i][j]), numero(v), paso.tol)));
    }
    return false;
  }

  return { parse, tex, numTex, numero, comprobar, lista, limpiarTex };
})();
