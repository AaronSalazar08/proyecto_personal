IF7102 - Multimedios  |  I Ciclo 2026  |  UCR - SR-CIE 

## **UNIVERSIDAD DE COSTA RICA** 

Carrera de Informática Empresarial - Sedes Regionales Curso IF7102 - Multimedios  |  I Ciclo 2026 

## **PROYECTO PERSONAL** 

## **Aplicación Web Multimedia con Framework JavaScript** 

_Vue 3  |  React  |  Angular  — a elección del estudiante_ 

Modalidad:  Individual 

**Porcentaje:  25% de la nota final del curso** 

Inicio: Semana 11  |  Entrega: Semana 15 (15 Jun - 20 Jun 2026) 

## **1. descripción del Proyecto** 

El Proyecto Personal unifica los rubros de Proyecto Personal (15%) y Proyecto de investigación Personal (10%) del programa del curso, conformando un único producto con un valor total del 25% de la nota final. 

El componente de investigación consiste en aprender a utilizar un framework de JavaScript moderno de forma autónoma: Vue 3, React o Angular. El estudiante debe elegir uno, estudiarlo por su cuenta y aplicarlo para construir su aplicación multimedia. El proceso de aprendizaje queda evidenciado en el Código producido, la organización en componentes y el archivo REFERENCIAS.md con los recursos que consulto para lograrlo. 

Es responsabilidad del estudiante buscar tutoriales, leer la documentación oficial y experimentar. 

## **2. Elección del Framework** 

El estudiante elige libremente uno de los siguientes tres frameworks. La elección debe declararse en el primer commit del repositorio y no puede cambiarse después de la semana 12. 

## **Vue 3** 

Framework progresivo de JavaScript desarrollado por Evan You. Su enfoque es incremental: puede usarse de forma simple con la Options API o de forma más avanzada con la 

Proyecto Personal v3  |  IF7102 Multimedios  |  25% 

Página 1 

IF7102 - Multimedios  |  I Ciclo 2026  |  UCR - SR-CIE 

Composition API. Tiene una curva de aprendizaje muy suave, documentación excelente en español y es el framework más parecido a lo que se ha visto en el curso con HTML/CSS/JS separados. Recomendado para la mayoría de estudiantes de este curso. 

## **React** 

Librería de UI desarrollada por Meta (Facebook). Utiliza JSX, una extensión de sintaxis que mezcla HTML dentro de JavaScript, lo que requiere un cambio de mentalidad respecto a HTML tradicional. Tiene el ecosistema más grande y la mayor cantidad de recursos de aprendizaje disponibles en internet. 

## **Angular** 

Framework completo desarrollado por Google. Es el más opinado de los tres: impone una estructura de proyecto, usa TypeScript de forma obligatoria y tiene una curva de aprendizaje considerablemente más alta. No se recomienda para estudiantes sin experiencia previa en TypeScript o programación orientada a objetos. Sin embargo, es muy usado en proyectos empresariales grandes y gubernamentales. 

## **3. Requisitos Comunes a Todas las Opciones** 

|||
|---|---|
|**Requisito**|**Especificación**|
|||
|||
|**Framework**|Debe usar Vue 3, React o Angular. La elección es libre<br>pero debe mantenerse durante todo el proyecto.|
|||
|**Componentes**|La aplicación debe estructurarse en al menos 4<br>componentes reutilizables del framework elegido.|
|||
|**JSON + fetch()**|Al menos un archivo .json con datos del proyecto, cargado<br>dinámicamente. Obligatorio en todas las opciones.|
|||
|**Responsividad**|La aplicación debe verse bien en escritorio y móvil. Puede<br>usarse un framework CSS como Bootstrap o Tailwind.|
|||
|**Multimedia**|Cada opción especifica sus medios mínimos. Al menos<br>uno debe ser de producción propia o con licencia libre.|
|||
|**REFERENCIAS.md**|Lista de tutoriales, documentación oficial y cursos<br>consultados para aprender el framework y construir el<br>proyecto.|
|||
|**Repositorio**|GitHub o GitLab con al menos 5 commits que muestran<br>avance progresivo. Un único commit final no es válido.|
|||
|**Modalidad**|Trabajo estrictamente individual. No se puede compartir<br>código entre compañeros.|



## **Que debe contener el REFERENCIAS.md** 

Proyecto Personal v3  |  IF7102 Multimedios  |  25% 

Página 2 

IF7102 - Multimedios  |  I Ciclo 2026  |  UCR - SR-CIE 

Tutoriales, videos o cursos que seguiste para aprender el framework (URL + título). 

Documentación oficial consultada (Vue Docs, React Docs, Angular Docs, MDN). 

Fuentes de recursos multimedia usados (imágenes, audio, video) con su licencia. 

Si usaste IA como apoyo en algún momento, incluirlo también. 

## **4. Opciones de Proyecto** 

Elegir una opción temática Y un framework. Cualquier combinación es válida. Cada tarjeta describe qué debe hacer la aplicación y que funcionalidades del framework tendrás que aplicar para construirla. 

## **Opción 1  Portfolio Multimedia Personal** 

Sitio de presentación profesional del propio estudiante. Secciones mínimas: presentación con foto y audio de autopresentación grabado por el estudiante, galería de trabajos propios, video de introducción personal, y sección de habilidades con animaciones. El contenido debe ser auténtico. 

**Medios requeridos:** fotografía propia, audio de autopresentación (grabación propia obligatoria), video corto de introducción. 

**Funcionalidades clave con el framework:** Componentes por sección (Header, About, Gallery, Skills), props para pasar datos a componentes hijo, v-for/map para renderizar lista de habilidades y proyectos, carga de datos desde JSON con fetch. 

## **Opción 2  Infografía Interactiva Animada** 

Infografía web sobre un tema de libre elección. Debe incluir elementos SVG con animaciones CSS, interactividad al hacer clic o hover sobre secciones clave, al menos 3 clips de audio de narración que se activen por interacción, y todos los datos representados cargados desde JSON. 

**Medios requeridos:** SVG propio o con licencia libre, audio de narración por sección (mínimo 3 clips). 

**Funcionalidades clave con el framework:** Estado reactivo para controlar qué sección está activa, eventos click en elementos SVG, componente AudioPlayer reutilizable, fetch para cargar datos del JSON al montar el componente. 

## **Opción 3  Mini Documental Web Interactivo** 

Documental de una sola página sobre cualquier tema relacionado con Costa Rica. Debe incluir video de fondo o principal, narración en audio por secciones, galería fotográfica con transiciones, y aparición progresiva de elementos al hacer scroll. 

Proyecto Personal v3  |  IF7102 Multimedios  |  25% 

Página 3 

IF7102 - Multimedios  |  I Ciclo 2026  |  UCR - SR-CIE 

**Medios requeridos:** Video (producción propia o licencia libre), audio de narración, mínimo 8 fotografías con licencia documentada. 

**Funcionalidades clave con el framework:** Componentes por sección del documental, manejo del evento scroll en el ciclo de vida del componente, estado reactivo para controlar visibilidad de elementos, componente de galería reutilizable. 

## **Opción 4  Enciclopedia Temática Interactiva** 

Enciclopedia web de al menos 10 entradas sobre un tema de libre elección. Todos los datos se cargan desde JSON. La interfaz incluye búsqueda en tiempo real, filtros por categoría, imagen por entrada, y modo oscuro y claro. 

**Medios requeridos:** Imagen representativa por entrada (mínimo 10 con licencia documentada), audio descriptivo para al menos 3 entradas. 

**Funcionalidades clave con el framework:** Computed properties o useMemo para filtrado en tiempo real, estado para búsqueda y categoría activa, componente EntradaCard reutilizable, ciclo de vida para cargar JSON al iniciar, CSS variables o clase toggle para modo oscuro. 

## **Opción 5  Juego Educativo de Un Nivel** 

Minijuego educativo sobre cualquier tema. Opciones válidas: quiz con temporizador, juego de memoria con pares imagen-audio, o puzzle de arrastrar y soltar. Pantallas: inicio, juego y resultado. Datos del juego cargados desde JSON. 

**Medios requeridos:** Efectos de sonido para aciertos, errores y resultado (mínimo 3 clips), imágenes para los elementos del juego. 

**Funcionalidades clave con el framework:** Estado del juego (pantalla activa, puntuación, tiempo) con reactividad, componentes por pantalla (Start, Game, Result), eventos de teclado y mouse, carga del JSON al iniciar. 

## **Opción 6  Galería Fotográfica con Filtros Visuales** 

Galería de fotografías sobre un tema libre. Funciones mínimas: filtros CSS controlados (escala de grises, sepia, contraste, saturación), lightbox al hacer clic implementado sin librerías externas de UI, metadata desde JSON, audio ambiental con control de volumen. 

**Medios requeridos:** Mínimo 12 fotografías con licencia documentada, 1 o 2 pistas de audio ambiental. 

**Funcionalidades clave con el framework:** Estado reactivo para filtro activo y foto seleccionada en lightbox, props para pasar metadata a cada tarjeta, computed para filtrar fotos por categoría, ref para acceder al elemento audio del DOM. 

Proyecto Personal v3  |  IF7102 Multimedios  |  25% 

Página 4 

IF7102 - Multimedios  |  I Ciclo 2026  |  UCR - SR-CIE 

## **Opción 7  Landing Page de Producto o Causa Social** 

Landing page para un producto ficticio, emprendimiento o causa social costarricense. Debe incluir: hero con video de fondo, galería con navegación, sección de testimonios con audio, y formulario con validación completa sin librerías externas de UI. 

**Medios requeridos:** Video hero (producción propia o licencia libre), audio de testimonios (mínimo 2 clips), imágenes con licencia. 

**Funcionalidades clave con el framework:** Componentes por sección de la landing, estado reactivo para validación del formulario, v-model/controlled inputs, evento submit con lógica de validación, ciclo de vida para animaciones de entrada. 

## **Opción 8  Visualizador de Datos Multimedia** 

Aplicación que visualiza datos de interés público con gráficas dibujadas en Canvas o SVG. Mínimo 2 tipos de gráfica, narración en audio por sección al hacer clic, imágenes contextuales por categoría, opción para cambiar entre conjuntos de datos desde JSON. 

**Medios requeridos:** Audio de narración por categoría (mínimo 4 clips), imágenes contextuales para cada categoría. 

**Funcionalidades clave con el framework:** Ref para acceder al elemento Canvas y dibujar desde el ciclo de vida, estado para el dataset activo, computed para transformar datos antes de graficar, componente AudioNarrator reutilizable. 

## **5. Cronograma Orientativo** 

La única fecha obligatoria es la entrega final en la semana 15. La semana 12 es el limite para declarar el framework elegido. 

||||
|---|---|---|
|**Semana**|**Fecha**|**Actividad recomendada**|
||||
||||
|**11**|18 - 23 MAY|Explorar los tres frameworks. Seguir el tutorial<br>oficial de cada uno para decidir.|
||||
|**12**|25 - 30 MAY|Declarar framework elegido en el README. Crear<br>proyecto base. Primer componente funcionando.|
||||
|**13**|01 - 06 JUN|Estructura de componentes definida. JSON<br>diseñado. Recursos multimedia recopilados.|
||||
|**14**|08 - 13 JUN|Carga de datos con fetch, integración de audio y<br>video, navegación entre vistas. Funcionalidades<br>completas.|
||||
|**15**|15 - 20 JUN|Entrega final: repositorio completo, README.md y<br>REFERENCIAS.md actualizados.|



Proyecto Personal v3  |  IF7102 Multimedios  |  25% 

Página 5 

IF7102 - Multimedios  |  I Ciclo 2026  |  UCR - SR-CIE 

## **6. Criterios de Evaluación** 

El proyecto vale el 25% de la nota final. El criterio de mayor peso es el uso correcto del framework, que es el componente de investigación autónoma del proyecto. 

||||
|---|---|---|
|**Componente**|**Criterios de evaluacion**|**Porcentaje**|
||||
||||
|**Uso del framework**|Correcta estructuración en componentes, uso de<br>reactividad, props, eventos y ciclo de vida del<br>framework elegido|**25%**|
||||
|**Diseño y UX**|Composición visual, paleta de colores, tipografía,<br>usabilidad y coherencia estética en toda la<br>aplicación|**20%**|
||||
|**Multimedia**|Calidad, pertinencia y correcta integración de los<br>medios requeridos por la opción elegida|**20%**|
||||
|**Desarrollo técnico**|Estructura<br>del<br>proyecto,<br>organización<br>de<br>componentes, carga de datos desde JSON,<br>código limpio y legible|**20%**|
||||
|**REFERENCIAS.md**|Documentación del proceso de aprendizaje:<br>tutoriales, documentación oficial y recursos<br>multimedia consultados|**10%**|
||||
|**Originalidad**|Temática propia, creatividad y diferenciación<br>respecto a otros proyectos del curso|**5%**|
||||
|**TOTAL**||**100%**|
||||



## **7. Formato de Entrega** 

- Enlace al repositorio público en GitHub o GitLab entregado en Mediación Virtual antes del cierre de la semana 15. 

- El repositorio debe contener: código fuente completo, README.md con instrucciones de ejecución, capturas de pantalla y framework utilizado, y REFERENCIAS.md completo. 

- El proyecto debe poder ejecutarse con npm install y npm run dev (o equivalente según el framework). 

- No se aceptan entregas por correo, WhatsApp ni fuera de la plataforma institucional. 

## **Trabajo individual y originalidad** 

## **Este proyecto es estrictamente individual:** 

El historial de commits debe mostrar avance progresivo. Un único commit final no es válido. 

Ante detección de copia parcial o total entre proyectos se aplicará el Reglamento de Orden y Disciplina Estudiantil de la UCR. 

## **Uso de herramientas de IA** 

Proyecto Personal v3  |  IF7102 Multimedios  |  25% 

Página 6 

IF7102 - Multimedios  |  I Ciclo 2026  |  UCR - SR-CIE 

Se permite usar IA para entender conceptos, interpretar errores del compilador o explorar como hacer algo con el framework elegido. 

El Código debe ser comprendido por el estudiante. Durante cualquier consulta del docente, el estudiante debe poder explicar por qué usó cada parte del framework. 

Si usaste IA como apoyo, incluirlo en el REFERENCIAS.md. 

_Lic. Alonso Chavarria Cubero  |  Docente IF7102 Sede Regional de Guanacaste, Recinto de Liberia  |  I Ciclo 2026_ 

Proyecto Personal v3  |  IF7102 Multimedios  |  25% 

Página 7 

