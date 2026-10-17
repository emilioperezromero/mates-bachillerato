/* =========================================================================
   APUNTES (en LaTeX)
   -------------------------------------------------------------------------
   Pega tu LaTeX entre las comillas invertidas de String.raw`...`.
   Se entienden: \section, \subsection, itemize, enumerate, tabular, center,
   \textbf, \emph, \href, fórmulas ($...$, $$...$$, \[...\], align...) y
   los entornos: definicion, teorema, propiedad, ejemplo, observacion,
   nota, importante, demostracion, ejercicio, solucion (con título
   opcional entre corchetes).
   Si pegas un documento entero, solo se usa lo que hay entre
   \begin{document} y \end{document}.

   Dos precauciones:
     1. No uses comillas invertidas (`) dentro del texto: usa "comillas".
     2. No escribas un dólar pegado a una llave abierta: separa "$ {".

   Opcional: pdf: 'apuntes/derivadas.pdf' añade un botón para descargar
   tu PDF (guárdalo en una carpeta "apuntes" junto a index.html).
   ========================================================================= */

window.APUNTES = {

  limites: {
    pdf: '',
    latex: String.raw`
\section{Idea de límite}

Decimos que $\lim_{x\to a} f(x) = L$ si los valores de $f(x)$ se acercan tanto como queramos a $L$ cuando $x$ se acerca a $a$ (sin llegar a valer $a$).

\begin{definicion}[Límites laterales]
El límite existe si y solo si existen los dos límites laterales y coinciden:
$$\lim_{x\to a} f(x) = L \iff \lim_{x\to a^-} f(x) = \lim_{x\to a^+} f(x) = L$$
\end{definicion}

\section{Cálculo de límites}

El primer paso es siempre \textbf{sustituir}. Si obtenemos un número, ese es el límite. Si aparece una \emph{indeterminación}, hay que transformar la expresión.

\subsection{Indeterminaciones}
Las siete indeterminaciones son:
$$\frac{0}{0},\quad \frac{\infty}{\infty},\quad \infty-\infty,\quad 0\cdot\infty,\quad 1^{\infty},\quad 0^0,\quad \infty^0$$

\begin{importante}
$\frac{\infty}{\infty}$ \textbf{no} vale 1, y $\infty - \infty$ \textbf{no} vale 0. Son indeterminaciones: el resultado puede ser cualquiera.
\end{importante}

\subsection{Indeterminación 0/0 con polinomios}
Si numerador y denominador se anulan en $x=a$, ambos son divisibles entre $(x-a)$. Se factorizan (Ruffini) y se simplifica.

\begin{ejemplo}
$$\lim_{x\to 2}\frac{x^2-5x+6}{x-2} = \lim_{x\to 2}\frac{(x-2)(x-3)}{x-2} = \lim_{x\to 2}(x-3) = -1$$
\end{ejemplo}

\subsection{Límites en el infinito de cocientes de polinomios}
Se divide entre la mayor potencia de $x$. Comparando los grados del numerador ($p$) y del denominador ($q$):
\begin{itemize}
  \item Si $p < q$, el límite es $0$.
  \item Si $p = q$, el límite es el cociente de los coeficientes principales.
  \item Si $p > q$, el límite es $\pm\infty$ (según los signos).
\end{itemize}

\begin{ejemplo}
$$\lim_{x\to+\infty}\frac{3x^2-x+1}{2x^2+5} = \frac{3}{2}$$
\end{ejemplo}

\section{Continuidad}

\begin{definicion}
$f$ es continua en $x=a$ si se cumplen las tres condiciones:
\begin{enumerate}
  \item Existe $f(a)$.
  \item Existe $\lim_{x\to a} f(x)$.
  \item Ambos coinciden: $\lim_{x\to a} f(x) = f(a)$.
\end{enumerate}
\end{definicion}

\subsection{Tipos de discontinuidad}
\begin{tabular}{l|l}
Tipo & Qué ocurre \\
\hline
Evitable & El límite existe (finito) pero no coincide con $f(a)$ o $f(a)$ no existe \\
Salto finito & Los límites laterales son finitos pero distintos \\
Salto infinito & Algún límite lateral es infinito (asíntota vertical) \\
\end{tabular}

\begin{teorema}[de Bolzano]
Si $f$ es continua en $[a,b]$ y $f(a)$ y $f(b)$ tienen distinto signo, existe al menos un $c\in(a,b)$ con $f(c)=0$.
\end{teorema}
`
  },

  derivadas: {
    pdf: '',
    latex: String.raw`
\section{Tasa de variación y derivada}

La \textbf{tasa de variación media} de $f$ en $[a, b]$ es la pendiente de la recta secante:
$$TVM_{[a,b]} = \frac{f(b)-f(a)}{b-a}$$

\begin{definicion}
La \textbf{derivada} de $f$ en $x=a$ es el límite de las tasas de variación media cuando el intervalo se hace cada vez más pequeño:
$$f'(a) = \lim_{h\to 0}\frac{f(a+h)-f(a)}{h}$$
\end{definicion}

\begin{observacion}
Geométricamente, $f'(a)$ es la \textbf{pendiente de la recta tangente} a la gráfica en el punto $(a, f(a))$.
\end{observacion}

\section{Reglas de derivación}

\begin{tabular}{c|c}
Función & Derivada \\
\hline
$k$ (constante) & $0$ \\
$x^n$ & $n\,x^{n-1}$ \\
$\sqrt{x}$ & $\dfrac{1}{2\sqrt{x}}$ \\
$e^x$ & $e^x$ \\
$\ln x$ & $\dfrac{1}{x}$ \\
$\sen x$ & $\cos x$ \\
$\cos x$ & $-\sen x$ \\
\end{tabular}

\subsection{Operaciones}
\begin{align*}
(f \pm g)' &= f' \pm g' \\
(k\,f)' &= k\,f' \\
(f\cdot g)' &= f'\,g + f\,g' \\
\left(\frac{f}{g}\right)' &= \frac{f'\,g - f\,g'}{g^2}
\end{align*}

\subsection{Regla de la cadena}
\begin{regla}
Para derivar una composición se deriva la función «de fuera» (dejando dentro lo mismo) y se multiplica por la derivada de la función «de dentro»:
$$\big(f(u(x))\big)' = f'(u(x))\cdot u'(x)$$
\end{regla}

\begin{ejemplo}
$$\big((3x+1)^5\big)' = 5\,(3x+1)^4\cdot 3 = 15\,(3x+1)^4$$
\end{ejemplo}

\begin{cuidado}
El error más frecuente es olvidar multiplicar por la derivada de dentro, $u'(x)$.
\end{cuidado}

\section{Recta tangente}

La recta tangente a $f$ en $x = a$ es:
$$y - f(a) = f'(a)\,(x - a)$$

\begin{ejemplo}
Tangente a $f(x)=x^2$ en $x=3$: $f(3)=9$, $f'(x)=2x$, $f'(3)=6$.
$$y - 9 = 6(x-3) \quad\Longrightarrow\quad y = 6x - 9$$
\end{ejemplo}

\section{Monotonía y extremos}
\begin{itemize}
  \item Si $f'(x) > 0$ en un intervalo, $f$ es \textbf{creciente}.
  \item Si $f'(x) < 0$ en un intervalo, $f$ es \textbf{decreciente}.
  \item Si $f'(a)=0$ y $f''(a)>0$, hay un \textbf{mínimo} relativo en $x=a$.
  \item Si $f'(a)=0$ y $f''(a)<0$, hay un \textbf{máximo} relativo en $x=a$.
\end{itemize}
`
  },

  trigonometria: {
    pdf: '',
    latex: String.raw`
\section{Medida de ángulos}

Un \textbf{radián} es el ángulo cuyo arco mide lo mismo que el radio. Como la circunferencia completa mide $2\pi r$:
$$360^\circ = 2\pi \text{ rad} \qquad\Longleftrightarrow\qquad 180^\circ = \pi \text{ rad}$$

\begin{regla}
De grados a radianes se multiplica por $\dfrac{\pi}{180}$; de radianes a grados, por $\dfrac{180}{\pi}$.
\end{regla}

\begin{ejemplo}
$150^\circ = 150\cdot\dfrac{\pi}{180} = \dfrac{5\pi}{6}$ rad.
\end{ejemplo}

\section{Razones trigonométricas}

En la circunferencia goniométrica (radio 1), un ángulo $\alpha$ determina un punto $P=(\cos\alpha, \sen\alpha)$, y
$$\tg\alpha = \frac{\sen\alpha}{\cos\alpha}$$

\begin{propiedad}[Relación fundamental]
$$\sen^2\alpha + \cos^2\alpha = 1$$
Dividiendo entre $\cos^2\alpha$ se obtiene también $1 + \tg^2\alpha = \dfrac{1}{\cos^2\alpha}$.
\end{propiedad}

\subsection{Signos por cuadrantes}
\begin{tabular}{c|c|c|c}
Cuadrante & $\sen$ & $\cos$ & $\tg$ \\
\hline
1.º & $+$ & $+$ & $+$ \\
2.º & $+$ & $-$ & $-$ \\
3.º & $-$ & $-$ & $+$ \\
4.º & $-$ & $+$ & $-$ \\
\end{tabular}

\begin{ejemplo}
Si $\sen\alpha = \frac{3}{5}$ y $\alpha$ está en el 2.º cuadrante:
$$\cos^2\alpha = 1 - \frac{9}{25} = \frac{16}{25} \;\Rightarrow\; \cos\alpha = -\frac{4}{5}, \qquad \tg\alpha = \frac{3/5}{-4/5} = -\frac{3}{4}$$
\end{ejemplo}

\section{Ángulos relacionados}
\begin{itemize}
  \item Suplementarios: $\sen(180^\circ-\alpha)=\sen\alpha$, \; $\cos(180^\circ-\alpha)=-\cos\alpha$.
  \item Complementarios: $\sen(90^\circ-\alpha)=\cos\alpha$, \; $\cos(90^\circ-\alpha)=\sen\alpha$.
  \item Opuestos: $\sen(-\alpha)=-\sen\alpha$, \; $\cos(-\alpha)=\cos\alpha$.
\end{itemize}

\section{Resolución de triángulos}
\begin{teorema}[del seno]
$$\frac{a}{\sen A} = \frac{b}{\sen B} = \frac{c}{\sen C}$$
\end{teorema}
\begin{teorema}[del coseno]
$$a^2 = b^2 + c^2 - 2bc\cos A$$
Si $A = 90^\circ$, se obtiene el teorema de Pitágoras.
\end{teorema}
`
  },

  financiera: {
    pdf: '',
    latex: String.raw`
\section{Porcentajes e índices de variación}

\begin{definicion}
El \textbf{índice de variación} es el número por el que se multiplica una cantidad para obtener la cantidad final:
\begin{itemize}
  \item Aumento del $r\,\%$: \; $I = 1 + \dfrac{r}{100}$
  \item Disminución del $r\,\%$: \; $I = 1 - \dfrac{r}{100}$
\end{itemize}
\end{definicion}

\begin{propiedad}[Porcentajes encadenados]
El índice de variación total es el \textbf{producto} de los índices.
\end{propiedad}

\begin{ejemplo}
Un precio sube un $20\,\%$ y luego baja un $20\,\%$: $I = 1{,}2\cdot 0{,}8 = 0{,}96$. ¡El precio final es un $4\,\%$ menor que el inicial!
\end{ejemplo}

\section{Interés simple}
Los intereses se calculan siempre sobre el capital inicial $C_0$:
$$I = C_0\cdot i\cdot t, \qquad C_f = C_0\,(1 + i\,t)$$
donde $i$ es el tipo de interés en tanto por uno y $t$ el tiempo (en las mismas unidades).

\section{Interés compuesto}
Los intereses de cada periodo se suman al capital y generan nuevos intereses:
$$C_f = C_0\,(1+i)^t$$

\begin{observacion}
Si el interés anual nominal es $r\,\%$ y se capitaliza $n$ veces al año (mensual: $n=12$; trimestral: $n=4$):
$$C_f = C_0\left(1+\frac{r}{100\,n}\right)^{n\,t}$$
\end{observacion}

\begin{definicion}[TAE]
La \textbf{tasa anual equivalente} es el interés anual que, con capitalización anual, produce el mismo resultado:
$$TAE = \left(1+\frac{r}{100\,n}\right)^{n} - 1$$
Sirve para comparar productos financieros con distintas frecuencias de capitalización.
\end{definicion}
`
  },

  bidimensional: {
    pdf: '',
    latex: String.raw`
\section{Variables bidimensionales}

Estudiamos dos variables $(x, y)$ a la vez sobre cada individuo. Los datos se representan en una \textbf{nube de puntos} (diagrama de dispersión).

\section{Parámetros}

Medias y varianzas de cada variable:
$$\bar{x} = \frac{\sum x_i}{n},\qquad s_x^2 = \frac{\sum x_i^2}{n} - \bar{x}^2$$

\begin{definicion}[Covarianza]
$$s_{xy} = \frac{\sum x_i\,y_i}{n} - \bar{x}\,\bar{y}$$
Si $s_{xy} > 0$ la relación es directa; si $s_{xy} < 0$, inversa.
\end{definicion}

\begin{definicion}[Coeficiente de correlación de Pearson]
$$r = \frac{s_{xy}}{s_x\, s_y}, \qquad -1 \le r \le 1$$
\end{definicion}

\begin{itemize}
  \item $r$ próximo a $1$: correlación fuerte y positiva.
  \item $r$ próximo a $-1$: correlación fuerte y negativa.
  \item $r$ próximo a $0$: no hay relación lineal.
\end{itemize}

\section{Recta de regresión}

La recta de regresión de $y$ sobre $x$ sirve para estimar $y$ a partir de $x$:
$$y - \bar{y} = \frac{s_{xy}}{s_x^2}\,(x - \bar{x})$$

\begin{observacion}
Las estimaciones son fiables si $|r|$ es próximo a 1 y el valor de $x$ está dentro del rango de los datos (no conviene extrapolar).
\end{observacion}

\begin{ejemplo}
Si $\bar{x}=3$, $\bar{y}=8$, $s_{xy}=4$ y $s_x^2=2$:
$$y - 8 = 2(x-3) \;\Rightarrow\; y = 2x + 2$$
Para $x = 4$ estimamos $y = 10$.
\end{ejemplo}
`
  },

  matrices: {
    pdf: '',
    latex: String.raw`
\section{Matrices}

Una matriz de dimensión $m\times n$ es una tabla de números con $m$ filas y $n$ columnas. El elemento de la fila $i$ y la columna $j$ se escribe $a_{ij}$.

\subsection{Producto de matrices}
Se puede multiplicar $A_{m\times n}\cdot B_{n\times p}$ solo si el número de columnas de $A$ coincide con el de filas de $B$. El resultado es $m\times p$, y
$$c_{ij} = a_{i1}b_{1j} + a_{i2}b_{2j} + \dots + a_{in}b_{nj}$$
(fila $i$ de $A$ por columna $j$ de $B$).

\begin{importante}
El producto de matrices \textbf{no es conmutativo}: en general, $A\cdot B \neq B\cdot A$.
\end{importante}

\begin{ejemplo}
$$\begin{pmatrix} 1 & 2 \\ 0 & 3\end{pmatrix}\begin{pmatrix} 4 & 1 \\ -1 & 2\end{pmatrix} = \begin{pmatrix} 1\cdot4+2\cdot(-1) & 1\cdot1+2\cdot2 \\ 0\cdot4+3\cdot(-1) & 0\cdot1+3\cdot2\end{pmatrix} = \begin{pmatrix} 2 & 5 \\ -3 & 6\end{pmatrix}$$
\end{ejemplo}

\section{Determinantes}

\subsection{Orden 2}
$$\begin{vmatrix} a & b \\ c & d \end{vmatrix} = a\,d - b\,c$$

\subsection{Orden 3: regla de Sarrus}
$$|A| = a_{11}a_{22}a_{33} + a_{12}a_{23}a_{31} + a_{13}a_{21}a_{32} - a_{13}a_{22}a_{31} - a_{11}a_{23}a_{32} - a_{12}a_{21}a_{33}$$

\subsection{Propiedades}
\begin{itemize}
  \item Si una fila (o columna) es de ceros, o dos filas son iguales o proporcionales, $|A| = 0$.
  \item Si se intercambian dos filas, el determinante cambia de signo.
  \item Si se multiplica una fila por $k$, el determinante queda multiplicado por $k$. Por eso, si $A$ es de orden $n$: $|k\,A| = k^n|A|$.
  \item $|A\cdot B| = |A|\cdot|B|$ \; y \; $|A^t| = |A|$.
\end{itemize}

\section{Matriz inversa}

\begin{teorema}
Una matriz cuadrada $A$ tiene inversa si y solo si $|A|\neq 0$. En ese caso:
$$A^{-1} = \frac{1}{|A|}\,(\operatorname{Adj} A)^t$$
\end{teorema}

\begin{ejemplo}[Orden 2]
$$A = \begin{pmatrix} a & b \\ c & d\end{pmatrix} \;\Longrightarrow\; A^{-1} = \frac{1}{ad-bc}\begin{pmatrix} d & -b \\ -c & a\end{pmatrix}$$
\end{ejemplo}
`
  },

  integrales: {
    pdf: '',
    latex: String.raw`
\section{Primitivas}

\begin{definicion}
$F$ es una \textbf{primitiva} de $f$ si $F'(x) = f(x)$. El conjunto de todas las primitivas es la \textbf{integral indefinida}:
$$\int f(x)\,dx = F(x) + C$$
\end{definicion}

\section{Integrales inmediatas}

\begin{tabular}{c|c}
Función & Primitiva \\
\hline
$k$ & $k\,x$ \\
$x^n$ \; ($n\neq -1$) & $\dfrac{x^{n+1}}{n+1}$ \\
$\dfrac{1}{x}$ & $\ln|x|$ \\
$e^x$ & $e^x$ \\
$\cos x$ & $\sen x$ \\
$\sen x$ & $-\cos x$ \\
\end{tabular}

\begin{propiedad}[Linealidad]
$$\int \big(a\,f(x) + b\,g(x)\big)\,dx = a\int f(x)\,dx + b\int g(x)\,dx$$
\end{propiedad}

\begin{ejemplo}
$$\int (6x^2 - 4x + 5)\,dx = 2x^3 - 2x^2 + 5x + C$$
\end{ejemplo}

\begin{cuidado}
Para integrar una potencia se \textbf{suma} 1 al exponente y se \textbf{divide} entre el nuevo exponente. ¡No confundir con derivar!
\end{cuidado}

\section{Integral definida}

\begin{teorema}[Regla de Barrow]
Si $f$ es continua en $[a,b]$ y $F$ es una primitiva de $f$:
$$\int_a^b f(x)\,dx = \Big[F(x)\Big]_a^b = F(b) - F(a)$$
\end{teorema}

\begin{ejemplo}
$$\int_1^3 2x\,dx = \Big[x^2\Big]_1^3 = 9 - 1 = 8$$
\end{ejemplo}

\section{Cálculo de áreas}
\begin{itemize}
  \item Si $f(x)\ge 0$ en $[a,b]$, el área entre la curva y el eje $OX$ es $\int_a^b f(x)\,dx$.
  \item Si $f(x) < 0$, la integral es negativa y el área es su valor absoluto.
  \item Si $f$ cambia de signo, se calculan por separado las integrales entre los cortes con el eje y se suman sus valores absolutos.
\end{itemize}
`
  },

  plineal: {
    pdf: '',
    latex: String.raw`
\section{Planteamiento}

Un problema de programación lineal consiste en \textbf{maximizar o minimizar} una función lineal
$$z = a\,x + b\,y \qquad \text{(función objetivo)}$$
sujeta a unas \textbf{restricciones} que son inecuaciones lineales.

\section{Región factible}

\begin{definicion}
La \textbf{región factible} es el conjunto de puntos del plano que cumplen todas las restricciones a la vez.
\end{definicion}

Para dibujarla:
\begin{enumerate}
  \item Se dibuja la recta asociada a cada inecuación (cambiando $\le$ por $=$).
  \item Se elige un punto de prueba (por ejemplo, el origen) para saber qué semiplano cumple la inecuación.
  \item La región factible es la intersección de todos los semiplanos.
\end{enumerate}

\section{Solución óptima}

\begin{teorema}[Teorema fundamental]
Si la región factible es acotada, la función objetivo alcanza su máximo y su mínimo en algún \textbf{vértice}. Si los alcanza en dos vértices, también los alcanza en todos los puntos del lado que los une.
\end{teorema}

\subsection{Método de los vértices}
\begin{enumerate}
  \item Calcula los vértices resolviendo los sistemas formados por las rectas que se cortan.
  \item Evalúa $z$ en cada vértice.
  \item El mayor valor es el máximo y el menor, el mínimo.
\end{enumerate}

\begin{ejemplo}
Maximizar $z = 3x + 2y$ con $x+y\le 6$, $x\le 4$, $x,y\ge 0$. Vértices: $(0,0)$, $(4,0)$, $(4,2)$ y $(0,6)$.
$$z(0,0)=0,\quad z(4,0)=12,\quad z(4,2)=16,\quad z(0,6)=12$$
El máximo es $z=16$ en $(4,2)$.
\end{ejemplo}
`
  },

  probabilidad: {
    pdf: '',
    latex: String.raw`
\section{Sucesos y regla de Laplace}

Si todos los resultados de un experimento son igualmente probables:
$$P(A) = \frac{\text{casos favorables}}{\text{casos posibles}}$$

\subsection{Propiedades}
\begin{itemize}
  \item $P(\overline{A}) = 1 - P(A)$
  \item $P(A\cup B) = P(A) + P(B) - P(A\cap B)$
  \item Leyes de De Morgan: $\overline{A\cup B} = \overline{A}\cap\overline{B}$ \; y \; $\overline{A\cap B} = \overline{A}\cup\overline{B}$
\end{itemize}

\begin{definicion}[Sucesos incompatibles]
$A$ y $B$ son incompatibles si no pueden ocurrir a la vez: $A\cap B=\emptyset$, es decir, $P(A\cap B)=0$.
\end{definicion}

\section{Probabilidad condicionada}

\begin{definicion}
La probabilidad de $A$ sabiendo que ha ocurrido $B$ es:
$$P(A\mid B) = \frac{P(A\cap B)}{P(B)}$$
\end{definicion}

\begin{definicion}[Sucesos independientes]
$A$ y $B$ son independientes si $P(A\cap B) = P(A)\cdot P(B)$, o lo que es lo mismo, $P(A\mid B) = P(A)$.
\end{definicion}

\begin{importante}
No confundas \textbf{incompatibles} con \textbf{independientes}. Si dos sucesos con probabilidad positiva son independientes, no pueden ser incompatibles.
\end{importante}

\section{Probabilidad total y teorema de Bayes}

Si $A_1, A_2, \dots, A_n$ forman un sistema completo de sucesos:

\begin{teorema}[de la probabilidad total]
$$P(B) = P(A_1)\,P(B\mid A_1) + P(A_2)\,P(B\mid A_2) + \dots + P(A_n)\,P(B\mid A_n)$$
\end{teorema}

\begin{teorema}[de Bayes]
$$P(A_i\mid B) = \frac{P(A_i)\,P(B\mid A_i)}{P(B)}$$
\end{teorema}

\begin{observacion}
Un \textbf{diagrama de árbol} ayuda mucho: se multiplican las probabilidades a lo largo de cada rama y se suman las ramas que llevan al suceso que nos interesa.
\end{observacion}

\begin{ejemplo}
La máquina $A$ hace el $60\,\%$ de las piezas (con un $2\,\%$ defectuosas) y la $B$ el $40\,\%$ (con un $5\,\%$ defectuosas).
$$P(D) = 0{,}6\cdot 0{,}02 + 0{,}4\cdot 0{,}05 = 0{,}032, \qquad P(A\mid D) = \frac{0{,}012}{0{,}032} = 0{,}375$$
\end{ejemplo}
`
  }
};
