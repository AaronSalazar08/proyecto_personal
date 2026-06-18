# REFERENCIAS

Recursos consultados para aprender Vue 3 y construir Tech Memory (IF7102 — Proyecto Personal).

---

## Framework — Vue 3

| Recurso | URL | Tipo |
|---|---|---|
| Documentación oficial de Vue 3 | https://vuejs.org/guide/introduction | Documentación oficial |
| Vue 3 Composition API (`<script setup>`, `ref`, `computed`, `watch`) | https://vuejs.org/guide/extras/composition-api-faq | Documentación oficial |
| Vue 3 — Ciclo de vida del componente (`onMounted`, `onUnmounted`) | https://vuejs.org/guide/essentials/lifecycle.html | Documentación oficial |
| Vue 3 — Props y Eventos personalizados (`defineProps`, `defineEmits`) | https://vuejs.org/guide/components/props.html | Documentación oficial |
| Vite — Guía de inicio | https://vite.dev/guide/ | Documentación oficial |
| Vitest — Guía de pruebas unitarias | https://vitest.dev/guide/ | Documentación oficial |
| @vue/test-utils — Documentación | https://test-utils.vuejs.org/guide/ | Documentación oficial |

---

## Otras referencias técnicas (MDN)

Consultadas para las partes de la app que no son específicas de Vue: persistencia local del
progreso/volumen, reproducción de audio y manejo de teclado para el panel de opciones.

| Recurso | URL |
|---|---|
| Web Storage API (`localStorage`) | https://developer.mozilla.org/es/docs/Web/API/Window/localStorage |
| HTMLMediaElement (control de audio: `play`, `pause`, `volume`, `loop`) | https://developer.mozilla.org/es/docs/Web/API/HTMLMediaElement |
| KeyboardEvent (navegación del panel de opciones con teclado) | https://developer.mozilla.org/es/docs/Web/API/KeyboardEvent |

---

## Multimedia

| Recurso | Descripción | Licencia |
|---|---|---|
| [Mixkit — Free Sound Effects](https://mixkit.co/free-sound-effects/) | Los 5 efectos de sonido del juego (voltear carta, acierto, error, puntos, fin de tiempo) | Mixkit Free License — uso libre, no requiere atribución |
| [Mixkit — Free Stock Music](https://mixkit.co/free-stock-music/) | Las 3 pistas de música de fondo (durante el juego, victoria, derrota) | Mixkit Free License — uso libre, no requiere atribución |
| [Devicon](https://devicon.dev/) | Los 21 íconos de tecnologías y asistentes de IA usados en las cartas | MIT License |
| [JetBrains Mono — Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono) | Tipografía monoespaciada de toda la interfaz | SIL Open Font License |

---

## Uso de Inteligencia Artificial

Usé **Claude (Anthropic)**, a través de Claude Code, como apoyo durante varias etapas del
desarrollo:

- Para entender conceptos de la Composition API de Vue 3 que no me quedaban claros solo con la
  documentación (reactividad con `ref`/`computed`, por qué un composable compartido necesita
  guardar su estado a nivel de módulo y no dentro de la función exportada, diferencias entre
  `watch` con `flush: 'pre'` y `flush: 'post'`).
- Para interpretar errores y advertencias del compilador/consola durante el desarrollo (por
  ejemplo, problemas de timing entre actualizar el `src` de un `<audio>` y llamar `.load()`).
- Como par de trabajo para diseñar e implementar el panel de opciones (volumen de música/efectos/
  master, historial de puntuaciones, navegación completa por teclado y mouse): se discutió el
  diseño antes de escribir código, se planificó por tareas pequeñas, y cada parte se probó con
  Vitest antes de continuar con la siguiente.
- Para revisar el código ya escrito y detectar errores de lógica antes de darlo por terminado
  (por ejemplo, que el volumen maestro no debía sobrescribir los valores guardados de música y
  efectos, sino solo atenuarlos al reproducir).

Todo el código fue revisado y comprendido por mí antes de incluirlo en el proyecto; puedo explicar
el porqué de cada parte del framework que se usó.

---

_Última actualización: entrega final, semana 15._
