/* =========================================================================
   CURSOS Y TEMAS
   - TEMAS: cada tema tiene un identificador (la clave), título, bloque y resumen.
   - CURSOS: cada curso indica qué temas incluye (por su identificador).
   Un mismo tema puede aparecer en varios cursos: comparte apuntes,
   vídeos y ejercicios.
   ========================================================================= */

window.TEMAS = {
  limites: {
    titulo: 'Límites y continuidad',
    bloque: 'Análisis',
    resumen: 'Cálculo de límites, indeterminaciones y estudio de la continuidad.'
  },
  derivadas: {
    titulo: 'Derivadas',
    bloque: 'Análisis',
    resumen: 'Tasa de variación, reglas de derivación, regla de la cadena y recta tangente.'
  },
  trigonometria: {
    titulo: 'Trigonometría',
    bloque: 'Geometría',
    resumen: 'Radianes, razones trigonométricas, relaciones entre ellas y signos por cuadrantes.'
  },
  financiera: {
    titulo: 'Matemática financiera',
    bloque: 'Números y Álgebra',
    resumen: 'Porcentajes encadenados, interés simple y compuesto, TAE.'
  },
  bidimensional: {
    titulo: 'Estadística bidimensional',
    bloque: 'Estadística y Probabilidad',
    resumen: 'Covarianza, correlación y recta de regresión.'
  },
  matrices: {
    titulo: 'Matrices y determinantes',
    bloque: 'Números y Álgebra',
    resumen: 'Operaciones con matrices, determinantes y matriz inversa.'
  },
  integrales: {
    titulo: 'Integrales',
    bloque: 'Análisis',
    resumen: 'Primitivas, integrales inmediatas y regla de Barrow.'
  },
  plineal: {
    titulo: 'Programación lineal',
    bloque: 'Números y Álgebra',
    resumen: 'Región factible, vértices y optimización de una función objetivo.'
  },
  probabilidad: {
    titulo: 'Probabilidad',
    bloque: 'Estadística y Probabilidad',
    resumen: 'Sucesos, probabilidad condicionada, probabilidad total y teorema de Bayes.'
  }
};

window.CURSOS = {
  '1c': {
    nivel: '1º Bachillerato',
    modalidad: 'Ciencias',
    asignatura: 'Matemáticas I',
    temas: ['limites', 'derivadas', 'trigonometria', 'bidimensional']
  },
  '1s': {
    nivel: '1º Bachillerato',
    modalidad: 'Ciencias Sociales',
    asignatura: 'Matemáticas Aplicadas a las CCSS I',
    temas: ['financiera', 'limites', 'derivadas', 'bidimensional']
  },
  '2c': {
    nivel: '2º Bachillerato',
    modalidad: 'Ciencias',
    asignatura: 'Matemáticas II',
    temas: ['matrices', 'integrales', 'probabilidad']
  },
  '2s': {
    nivel: '2º Bachillerato',
    modalidad: 'Ciencias Sociales',
    asignatura: 'Matemáticas Aplicadas a las CCSS II',
    temas: ['matrices', 'plineal', 'integrales', 'probabilidad']
  }
};
