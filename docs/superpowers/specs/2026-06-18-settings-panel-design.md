# Panel de opciones (volumen, master, historial de puntuaciones) navegable por teclado y mouse

## Contexto

Hoy no existe ninguna forma de ajustar el volumen de la música ni de los efectos de sonido, ni de ver un historial de puntuaciones. Tampoco hay ninguna interacción del juego controlable por teclado: todo es click con mouse (`StartScreen.vue`, `GameBoard.vue` vía `MemoryCard`, `ResultScreen.vue`).

Cada `AudioPlayer.vue` recibe un prop `volume` (default `1`) que solo se aplica dentro de `play()`; no hay ningún control de usuario sobre ese valor, y los componentes padre (`App.vue`, `GameBoard.vue`) no lo pasan explícitamente hoy (usan el default 1).

## Objetivo

Agregar un panel de opciones accesible por teclado (flechas / WASD / Enter / Space / Tab) y por mouse, con:
- Barra de volumen de música.
- Barra de volumen de efectos de sonido.
- Barra de volumen "master" que atenúa a las dos anteriores.
- Historial de las mejores puntuaciones de la sesión del navegador (top 10, se pierde al refrescar la página).

Dentro de un nivel (`GameBoard.vue`), el mismo panel agrega dos botones adicionales:
- Reiniciar nivel.
- Volver al menú principal.

## Estado compartido (composables)

### `src/composables/useAudioSettings.js`

Estado singleton a nivel de módulo (un solo `ref` compartido por todos los componentes que importen el composable):

```js
musicVolume  // ref<number>, 0-100, paso 10, persistido en localStorage ('memoryGame.musicVolume')
sfxVolume    // ref<number>, 0-100, paso 10, persistido en localStorage ('memoryGame.sfxVolume')
masterVolume // ref<number>, 0-100, paso 10, persistido en localStorage ('memoryGame.masterVolume')

effectiveMusicVolume // computed: (musicVolume/100) * (masterVolume/100), rango 0-1
effectiveSfxVolume   // computed: (sfxVolume/100) * (masterVolume/100), rango 0-1
```

- Valor inicial si no hay nada en localStorage: `100` para los tres.
- `setMusicVolume(v)`, `setSfxVolume(v)`, `setMasterVolume(v)`: clampean a `[0, 100]`, redondean al múltiplo de 10 más cercano si vienen de teclado (±10 por paso), y persisten en localStorage en cada cambio.
- El master es un atenuador independiente: no mueve las posiciones de las barras de música/efectos, solo multiplica el volumen final. Así "bajar todo" (master a 0) no resetea las preferencias individuales del usuario.

### `src/composables/useScoreHistory.js`

Estado singleton en memoria (sin localStorage — se reinicia en cada carga de página):

```js
history    // ref<Array<{ score, levelIndex, won, timestamp }>>
topScores  // computed: copia de history ordenada desc por score, primeros 10

function recordScore({ score, levelIndex, won }) // agrega entrada con timestamp = Date.now()
```

Se llama a `recordScore` desde `App.vue` dentro de `onEndGame`, en cada partida que termina en victoria o derrota (no cuando se sale al menú voluntariamente, ver más abajo).

## Cambios en `AudioPlayer.vue`

Hoy `props.volume` solo se aplica dentro de `play()`. Para que un loop que ya está sonando (música de fondo, tick del timer) reaccione en vivo al mover una barra, se agrega:

```js
watch(() => props.volume, (v) => {
  if (audioRef.value) audioRef.value.volume = v
})
```

`play()` sigue asignando el volumen también, para cubrir el caso de que empiece a sonar después de un cambio.

## Componente `SettingsPanel.vue` (nuevo)

```js
props: { showGameControls: { type: Boolean, default: false } }
emits: ['close', 'restart-level', 'go-to-menu']
```

Montado siempre con `v-if` desde el padre (solo existe en el DOM mientras está abierto). Esto permite que registre sus listeners de teclado en `onMounted` y los limpie en `onUnmounted` sin necesidad de un flag adicional.

### Items navegables (orden fijo)

1. Slider "Música" → `useAudioSettings().musicVolume`
2. Slider "Efectos" → `sfxVolume`
3. Slider "Master" → `masterVolume`
4. *(solo si `showGameControls`)* Botón "Reiniciar nivel" → `emit('restart-level')`
5. *(solo si `showGameControls`)* Botón "Volver al menú principal" → `emit('go-to-menu')`

Debajo de los items, una sección de solo lectura con `topScores` (no participa de la navegación por teclado): lista ordenada con score, nivel y resultado (✓/✗) de cada entrada.

### Estado interno

- `focusedIndex` (ref number, default `0`): índice del item con foco.
- `editingIndex` (ref number|null, default `null`): índice del slider actualmente en "modo edición" (ajustable con izquierda/derecha). `null` = modo navegación.

### Modelo de teclado

Un único listener `keydown` en `window`, registrado en `onMounted` / removido en `onUnmounted`. Cada tecla manejada llama `e.preventDefault()`.

| Tecla | Condición | Efecto |
|---|---|---|
| `ArrowUp`, `w`, `W` | `editingIndex === null` | `focusedIndex = clamp(focusedIndex - 1, 0, items.length - 1)` (sin wrap-around) |
| `ArrowDown`, `s`, `S` | `editingIndex === null` | `focusedIndex = clamp(focusedIndex + 1, 0, items.length - 1)` |
| `Enter`, `' '` (Space) | item enfocado es slider | toggle: si `editingIndex !== focusedIndex` → `editingIndex = focusedIndex`; si ya estaba → `editingIndex = null` |
| `Enter`, `' '` (Space) | item enfocado es botón | ejecuta de inmediato el `emit` correspondiente (sin modo edición) |
| `ArrowRight`, `d`, `D` | `editingIndex === focusedIndex` (es un slider) | `setXVolume(valor + 10)` |
| `ArrowLeft`, `a`, `A` | `editingIndex === focusedIndex` (es un slider) | `setXVolume(valor - 10)` |
| `Tab` | — | manejado en el componente padre (ver abajo), no en `SettingsPanel` |

`Tab` se ignora explícitamente dentro de `SettingsPanel` para evitar doble-toggle: el listener de `Tab` vive en el padre (`StartScreen`/`GameBoard`) porque debe funcionar también cuando el panel está cerrado.

### Mouse

- Cada slider es un `<input type="range" min="0" max="100" step="10">` nativo, arrastrable directamente — el concepto de "modo edición" es exclusivo de teclado, el mouse siempre ajusta el valor directo vía evento `input`.
- Botones `−` / `+` junto a cada slider para clicks discretos de ±10 (mismo paso que teclado).
- Botón `✕` en la cabecera del panel y backdrop semitransparente clickeable: ambos emiten `close`.
- Click en un item (slider o botón) también actualiza `focusedIndex` a ese item (consistencia visual del foco), pero no activa `editingIndex` — eso solo ocurre vía `Enter`/`Space`.

### Estilos / feedback visual

- Item con foco (`focusedIndex`): borde/resaltado visible (reutilizando paleta Tokyo Night existente, ej. `var(--color-primary)`).
- Slider en modo edición (`editingIndex === focusedIndex`): un resaltado adicional distinto (ej. `var(--color-accent)` o glow) para diferenciarlo de "solo enfocado".
- Mismo estilo "terminal" (`terminal-window`, `titlebar` con dots) que `StartScreen.vue` / `ResultScreen.vue` para consistencia visual.

## Integración en `StartScreen.vue`

- Ícono ⚙ fijo (ej. esquina superior derecha del `terminal-window` o de la pantalla) con `@click="showSettings = true"`.
- `const showSettings = ref(false)`.
- Listener `Tab` en `window` (registrado en `onMounted`/removido en `onUnmounted` del propio `StartScreen`): `e.preventDefault(); showSettings.value = !showSettings.value`.
- `<SettingsPanel v-if="showSettings" :show-game-controls="false" @close="showSettings = false" />`.

## Integración en `GameBoard.vue`

Mismo patrón (ícono ⚙, `showSettings` ref, listener `Tab` en `window`), con `:show-game-controls="true"`.

### Pausa mientras el panel está abierto

- `watch(showSettings, (open) => { ... })`:
  - Al abrir (`open === true`): `clearInterval(timerInterval)` (sin tocar `timeLeft`, para poder reanudar exacto), `audioTimer.value?.pause()`-equivalente — como `AudioPlayer` no expone `pause()` (solo `play`/`stop`), se usa `audioTimer.value?.stop()` al abrir y se vuelve a llamar `audioTimer.value?.play()` al cerrar. Es aceptable que el tick de audio se reinicie desde el principio al cerrar el panel (no es crítico para la jugabilidad).
  - Al cerrar (`open === false`): si la partida no terminó (`matchedPairs.value < totalPairs.value` y `timeLeft.value > 0`), se vuelve a llamar `startTimer()` y `audioTimer.value?.play()`.
- `onCardFlip`: agrega guard `if (showSettings.value) return` al inicio (mismo patrón que `isPreviewing`/`isChecking`).
- Si el panel se abre durante el preview (`isPreviewing === true`), el preview también debe pausarse: se aplica el mismo patrón de `clearInterval(previewInterval)` al abrir y reanudar al cerrar. (Caso borde poco común pero el guard de `onCardFlip` ya cubre que no se pueda interactuar mientras tanto.)

### Evento `restart-level`

Nueva función interna `restartCurrentLevel()` que repite la lógica relevante de `onMounted` (recarga `cards.value` con un nuevo `selectRandomPairs` + `shuffleCards`, resetea `matchedPairs`, `score`, `timeLeft`, `failCount`, `flippedCards`, detiene `timerInterval`/`previewInterval` activos) y vuelve a llamar `startPreview()`. Se invoca desde `@restart-level="restartCurrentLevel"` y cierra el panel (`showSettings.value = false`) antes de reiniciar.

### Evento `go-to-menu`

Salida voluntaria: **no** se considera fin de partida.
- No se emite `end-game` (no se llama a `recordScore`, no se actualiza `finalScore`/`finalWon`/etc., no se modifica el nivel guardado en `App.vue`).
- `GameBoard.vue` emite un nuevo evento `emit('exit-to-menu')`.
- `App.vue` escucha `@exit-to-menu="onExitToMenu"`: detiene `musicGame.value?.stop()` y pone `currentScreen.value = 'start'`, sin tocar `levelIndex`/`savedLevelIndex` (el progreso para "continuar" se mantiene intacto, ya que esa lógica solo cambia al ganar/perder en `onEndGame`).

## Cambios en `App.vue`

- Importa `useAudioSettings` y pasa `:volume="effectiveMusicVolume"` a los 3 `AudioPlayer` de música (`musicGame`, `musicWin`, `musicLose`).
- Dentro de `onEndGame(score, time, won, reason)`, después de actualizar el estado existente, llama a `useScoreHistory().recordScore({ score, levelIndex: levelIndex.value, won })`.
- Nuevo handler `onExitToMenu()` (ver arriba) conectado a `@exit-to-menu` en el `<GameBoard>`.
- `App.vue` no renderiza `SettingsPanel` directamente: el panel vive dentro de `StartScreen.vue` y `GameBoard.vue`, cada uno con su propia instancia.

## Cambios en `GameBoard.vue` (audio efectos)

Pasa `:volume="effectiveSfxVolume"` (de `useAudioSettings`) a los 7 `AudioPlayer` de efectos: `audioCorrect`, `audioError`, `audioTimer`, `audioTimeup`, `audioWinning`, `audioCardflip`, `audioPoints`.

## Fuera de alcance

- `ResultScreen.vue` no recibe el ícono de opciones ni el panel en esta iteración (no fue solicitado).
- No se agrega confirmación ("¿Estás seguro?") al reiniciar nivel o volver al menú — se ejecuta de inmediato.
- No hay wrap-around en la navegación con flechas/WASD entre items (al llegar al último item, `ArrowDown`/`S` no hace nada; mismo en el primero con `ArrowUp`/`W`).
- El historial de puntuaciones no se persiste entre recargas de página (a propósito, es "de la sesión").
- No se agrega soporte de gamepad/controles físicos, solo teclado y mouse.

## Testing

- **Unitarios** (`src/composables/__tests__/`):
  - `useAudioSettings`: clamping a `[0,100]`, multiplicación correcta para `effectiveMusicVolume`/`effectiveSfxVolume`, persistencia/lectura de `localStorage`.
  - `useScoreHistory`: orden descendente correcto, límite de 10 en `topScores`, `history` cruda sin límite.
- **Componente** (`SettingsPanel.spec.js`):
  - Navegación con `ArrowUp`/`ArrowDown` y `W`/`S` respeta los límites (sin wrap).
  - `Enter`/`Space` activa y desactiva `editingIndex` en un slider.
  - `ArrowLeft`/`ArrowRight` y `A`/`D` solo cambian el valor cuando `editingIndex` coincide con el item.
  - `Enter`/`Space` en un botón emite el evento correspondiente sin afectar `editingIndex`.
  - Con `showGameControls=false` los botones de nivel no aparecen en la lista de items navegables.
- **Manual en navegador**:
  - Abrir/cerrar el panel con `Tab` y con el ícono ⚙/✕/backdrop, desde `StartScreen` y desde dentro de un nivel.
  - Confirmar que mover la barra de música/efectos durante una partida cambia el volumen del audio que ya está sonando (loop de música, tick del timer).
  - Confirmar que abrir el panel durante una partida pausa el timer visualmente (el número no avanza) y que al cerrar continúa desde donde quedó.
  - Confirmar que "Reiniciar nivel" relanza el preview de cartas del mismo nivel actual.
  - Confirmar que "Volver al menú principal" regresa a `StartScreen` sin mostrar `ResultScreen` y que el botón "continuar" en `StartScreen` sigue ofreciendo el nivel guardado previo (no el nivel que se estaba jugando al salir).
  - Confirmar que el historial de puntuaciones acumula entradas de varias partidas (ganadas y perdidas) dentro de la misma sesión, y que se vacía al refrescar la página.
