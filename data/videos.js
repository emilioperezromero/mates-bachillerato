/* =========================================================================
   VÍDEOS
   -------------------------------------------------------------------------
   Para añadir un vídeo de YouTube, pega en "youtube" el enlace completo
   (https://www.youtube.com/watch?v=XXXXXXXXXXX o https://youtu.be/XXXXXXXXXXX)
   o solo su identificador de 11 caracteres.
   Si "youtube" está vacío, se muestra la tarjeta "Vídeo próximamente" con un
   botón para buscar el tema en YouTube (usa el texto de "busqueda").
   ========================================================================= */

window.VIDEOS = [
  // Límites y continuidad
  { tema: 'limites', titulo: 'Límites: idea intuitiva y límites laterales', duracion: '', youtube: '', busqueda: 'límites laterales bachillerato', descripcion: 'Qué significa que una función tenga límite en un punto.' },
  { tema: 'limites', titulo: 'Indeterminaciones 0/0 e ∞/∞', duracion: '', youtube: '', busqueda: 'indeterminación 0/0 infinito entre infinito límites', descripcion: 'Cómo resolver las indeterminaciones más frecuentes.' },
  { tema: 'limites', titulo: 'Continuidad y tipos de discontinuidad', duracion: '', youtube: '', busqueda: 'continuidad tipos de discontinuidad bachillerato', descripcion: 'Las tres condiciones de continuidad y cómo clasificar las discontinuidades.' },

  // Derivadas
  { tema: 'derivadas', titulo: 'Concepto de derivada', duracion: '', youtube: '', busqueda: 'concepto de derivada pendiente recta tangente', descripcion: 'De la tasa de variación media a la derivada.' },
  { tema: 'derivadas', titulo: 'Reglas de derivación y regla de la cadena', duracion: '', youtube: '', busqueda: 'regla de la cadena derivadas bachillerato', descripcion: 'Cómo derivar funciones compuestas sin olvidar la derivada de dentro.' },
  { tema: 'derivadas', titulo: 'Recta tangente a una curva', duracion: '', youtube: '', busqueda: 'recta tangente a una curva en un punto derivada', descripcion: 'Ecuación de la recta tangente paso a paso.' },

  // Trigonometría
  { tema: 'trigonometria', titulo: 'Radianes y circunferencia goniométrica', duracion: '', youtube: '', busqueda: 'radianes circunferencia goniométrica', descripcion: 'Cómo pasar de grados a radianes y por qué.' },
  { tema: 'trigonometria', titulo: 'Razones trigonométricas de cualquier ángulo', duracion: '', youtube: '', busqueda: 'razones trigonométricas cuadrantes signos', descripcion: 'Relación fundamental y signos en cada cuadrante.' },

  // Matemática financiera
  { tema: 'financiera', titulo: 'Porcentajes encadenados', duracion: '', youtube: '', busqueda: 'índice de variación porcentajes encadenados', descripcion: 'Por qué los porcentajes no se suman.' },
  { tema: 'financiera', titulo: 'Interés simple y compuesto', duracion: '', youtube: '', busqueda: 'interés compuesto 1 bachillerato ciencias sociales', descripcion: 'Diferencias entre ambos y cómo calcular el capital final.' },

  // Estadística bidimensional
  { tema: 'bidimensional', titulo: 'Covarianza y correlación', duracion: '', youtube: '', busqueda: 'covarianza coeficiente de correlación bachillerato', descripcion: 'Cómo medir la relación entre dos variables.' },
  { tema: 'bidimensional', titulo: 'Recta de regresión', duracion: '', youtube: '', busqueda: 'recta de regresión bachillerato ejercicio', descripcion: 'Cálculo de la recta y estimaciones.' },

  // Matrices y determinantes
  { tema: 'matrices', titulo: 'Operaciones con matrices', duracion: '', youtube: '', busqueda: 'producto de matrices 2 bachillerato', descripcion: 'Suma, producto por un número y producto de matrices.' },
  { tema: 'matrices', titulo: 'Determinantes y regla de Sarrus', duracion: '', youtube: '', busqueda: 'regla de sarrus determinante 3x3', descripcion: 'Cálculo de determinantes de orden 2 y 3.' },
  { tema: 'matrices', titulo: 'Matriz inversa', duracion: '', youtube: '', busqueda: 'matriz inversa por adjuntos 2 bachillerato', descripcion: 'Cálculo de la inversa mediante la matriz adjunta.' },

  // Integrales
  { tema: 'integrales', titulo: 'Primitivas e integrales inmediatas', duracion: '', youtube: '', busqueda: 'integrales inmediatas 2 bachillerato', descripcion: 'La integral como operación inversa de la derivada.' },
  { tema: 'integrales', titulo: 'Integral definida y regla de Barrow', duracion: '', youtube: '', busqueda: 'regla de barrow integral definida', descripcion: 'Cálculo de integrales definidas y áreas.' },

  // Programación lineal
  { tema: 'plineal', titulo: 'Región factible', duracion: '', youtube: '', busqueda: 'región factible programación lineal', descripcion: 'Cómo dibujar el conjunto de soluciones de un sistema de inecuaciones.' },
  { tema: 'plineal', titulo: 'Problemas de programación lineal', duracion: '', youtube: '', busqueda: 'problema programación lineal 2 bachillerato ciencias sociales', descripcion: 'Planteamiento y resolución por el método de los vértices.' },

  // Probabilidad
  { tema: 'probabilidad', titulo: 'Probabilidad condicionada', duracion: '', youtube: '', busqueda: 'probabilidad condicionada bachillerato', descripcion: 'Sucesos dependientes e independientes.' },
  { tema: 'probabilidad', titulo: 'Probabilidad total y teorema de Bayes', duracion: '', youtube: '', busqueda: 'teorema de bayes probabilidad total diagrama de árbol', descripcion: 'Resolución con diagramas de árbol.' }
];
