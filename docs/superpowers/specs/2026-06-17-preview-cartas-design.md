# Preview de cartas al inicio de la partida

## Contexto

Actualmente `GameBoard.vue` carga las cartas y arranca el timer (60s) de inmediato en `onMounted`. El usuario no tiene ninguna pista visual de dónde están las cartas antes de que el reloj empiece a correr.

## Objetivo

Antes de que arranque el contador real, mostrar brevemente cartas aleatorias del tablero (como en los juegos de memoria clásicos) para que el jugador sepa de dónde partir, sin que ese tiempo cuente contra el reloj de la partida.

## Comportamiento

- Duración total del preview: **3000ms**.
- Cada **500ms** se "destella" una carta distinta del tablero (frente visible), boca abajo el resto del tiempo: 3000 / 500 = **6 destellos**.
- Las cartas destelladas se eligen barajando el listado completo de `uniqueId` del tablero (24 cartas para 12 pares) y tomando las primeras 12, **sin repetir** dentro del mismo ciclo de preview. Como el tablero tiene 24 cartas, no todas se llegan a ver en un ciclo — es esperado.
- Si en el futuro el tablero tuviera 6 cartas o menos, la cola de preview se agota antes de completar los 6 destellos: no se repite ni se reinicia, simplemente termina el preview cuando se acaba la cola.
- Durante el preview:
  - El click sobre cualquier carta está **bloqueado** (no se puede voltear).
  - No se reproduce sonido de `cardflip` en los destellos (silencioso).
  - El HUD normal (tiempo/pares/score) se reemplaza por un banner `// memoriza...` con el mismo estilo visual "terminal" del resto de la UI.
- Al completar el preview (3000ms):
  - Se restaura el HUD normal con los valores iniciales (tiempo 1:00, pares 0/12, score 0).
  - Arranca el timer real (`startTimer()`) y se reproduce el sonido `audioTimer` — ambos se mueven desde `onMounted` a este punto (antes se disparaban inmediatamente al cargar los datos).

## Visual del destello

El flip 3D normal de `MemoryCard.vue` usa una transición CSS de 0.48s. Como cada destello del preview dura solo 0.5s (originalmente 0.25s), reusar esa animación deja la carta a mitad de giro sin asentarse, viéndose descuidado.

**Decisión**: se agrega un nuevo prop `instant` (boolean) a `MemoryCard.vue`. Cuando `instant` es `true`, se aplica una clase que pone `transition: none` en `.card-inner`, de forma que la carta salta directo a su cara frontal y vuelve atrás sin giro — un destello limpio, visualmente distinto del flip de juego normal (que sigue usando la transición de 0.48s).

## Cambios en `GameBoard.vue`

- Nuevo estado:
  - `isPreviewing` (ref boolean, default `false`)
  - `previewCardId` (ref string|null) — `uniqueId` de la carta actualmente destellando.
- Nueva función `startPreview()`:
  - Baraja los `uniqueId` de `cards.value` con `shuffleCards` (reutilizando la función existente).
  - `isPreviewing.value = true`.
  - `setInterval` cada 500ms: avanza al siguiente id de la cola y lo asigna a `previewCardId`. Al llegar a 6 destellos (o agotar la cola), limpia el intervalo, pone `previewCardId = null`, `isPreviewing.value = false`, y llama a `startTimer()` + `audioTimer.value?.play()`.
- `onMounted`: tras cargar los datos (`isLoading = false`), en vez de llamar a `startTimer()` directamente, se llama a `startPreview()`.
- `onCardFlip`: agrega guard `if (isPreviewing.value) return` al inicio (antes del guard existente de `isChecking`).
- Template:
  - `isFlipped` de cada `MemoryCard` pasa a ser `card.isFlipped || (isPreviewing && card.uniqueId === previewCardId)`.
  - Se pasa `:instant="isPreviewing"` a `MemoryCard`.
  - El `<header class="hud">` se renderiza condicionalmente: si `isPreviewing`, se muestra un banner `// memoriza...`; si no, el HUD normal actual.
- `onUnmounted`: además de `clearInterval(timerInterval)`, también limpia el intervalo del preview si sigue activo.

## Cambios en `MemoryCard.vue`

- Nuevo prop `instant: { type: Boolean, default: false }`.
- Nueva clase CSS condicional (ej. `.card-wrapper.instant .card-inner { transition: none; }`) aplicada junto a las clases existentes (`flipped`, `matched`).

## Fuera de alcance

- No se modifica la duración del timer real (60s) ni la lógica de matching de pares.
- No se agrega configuración de usuario para activar/desactivar el preview ni cambiar su duración — es fijo (3000ms / 500ms por carta) en esta iteración.
- No se toca `StartScreen.vue` ni `ResultScreen.vue`.

## Testing

- Verificar manualmente en el navegador: al iniciar partida se ven destellos de cartas distintas por ~3s con el banner "memoriza...", clicks bloqueados, y luego arranca el HUD normal y el timer.
- `src/__tests__/App.spec.js` no se ve afectado (solo monta la pantalla `start`, no llega a `GameBoard`).
