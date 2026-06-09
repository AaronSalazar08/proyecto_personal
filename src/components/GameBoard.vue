<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import MemoryCard from './MemoryCard.vue'
import AudioPlayer from './AudioPlayer.vue'

const emit = defineEmits(['end-game'])

// ── Estado del juego ─────────────────────────────────────────
const cards = ref([])
const flippedCards = ref([])
const matchedPairs = ref(0)
const totalPairs = ref(0)
const score = ref(0)
const timeLeft = ref(30)
const isChecking = ref(false)
const isLoading = ref(true)

// ── Refs de audio ─────────────────────────────────────────────
const audioCorrect = ref(null)
const audioError = ref(null)
const audioTimer = ref(null)
const audioTimeup = ref(null)
const audioWinning = ref(null)
const audioCardflip = ref(null)
const audioPoints = ref(null)
const soundPaths = ref({ correct: '', error: '', timer: '', timeup: '', winning: '', cardflip: '', points: '' })

// ── Timer ──────────────────────────────────────────────────────
const TOTAL_TIME = 30
let timerInterval = null

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timerInterval)
      audioTimer.value?.stop()
      audioTimeup.value?.play()
      setTimeout(() => emit('end-game', score.value, TOTAL_TIME, false), 800)
    }
  }, 1000)
}

const formattedTime = computed(() => {
  const s = timeLeft.value.toString().padStart(2, '0')
  return `0:${s}`
})

const isUrgent = computed(() => timeLeft.value <= 10)

// ── Carga de datos ─────────────────────────────────────────────
onMounted(async () => {
  try {
    const res = await fetch('/data/cards.json')
    const data = await res.json()
    soundPaths.value = data.sounds
    totalPairs.value = data.pairs.length
    cards.value = shuffleCards(buildCardPairs(data.pairs))
  } finally {
    isLoading.value = false
    startTimer()
    // nextTick garantiza que el watch de AudioPlayer ya disparó .load()
    // antes de llamar .play(), evitando que el src aún esté vacío
    await nextTick()
    audioTimer.value?.play()
  }
})

onUnmounted(() => {
  clearInterval(timerInterval)
})

// ── Lógica de cartas ───────────────────────────────────────────
function buildCardPairs(pairs) {
  return pairs.flatMap((pair) => [
    { ...pair, uniqueId: `${pair.id}-a`, isFlipped: false, isMatched: false },
    { ...pair, uniqueId: `${pair.id}-b`, isFlipped: false, isMatched: false },
  ])
}

function shuffleCards(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function onCardFlip(card) {
  if (isChecking.value) return

  const target = cards.value.find((c) => c.uniqueId === card.uniqueId)
  if (!target || target.isFlipped || target.isMatched) return

  audioCardflip.value?.play()
  target.isFlipped = true
  flippedCards.value = [...flippedCards.value, target]

  if (flippedCards.value.length === 2) {
    isChecking.value = true
    checkForMatch()
  }
}

function checkForMatch() {
  const [first, second] = flippedCards.value

  if (first.id === second.id) {
    first.isMatched = true
    second.isMatched = true
    matchedPairs.value++
    score.value += 10
    audioPoints.value?.play()

    audioCorrect.value?.play()
    flippedCards.value = []
    isChecking.value = false

    if (matchedPairs.value === totalPairs.value) {
      clearInterval(timerInterval)
      audioTimer.value?.stop()
      audioWinning.value?.play()
      const timeTaken = TOTAL_TIME - timeLeft.value
      setTimeout(() => emit('end-game', score.value, timeTaken, true), 800)
    }
  } else {
    audioError.value?.play()
    setTimeout(() => {
      first.isFlipped = false
      second.isFlipped = false
      flippedCards.value = []
      isChecking.value = false
    }, 1000)
  }
}
</script>

<template>
  <div class="game-board">
    <!-- HUD -->
    <header class="hud">
      <div class="hud-item">
        <span class="hud-label">Tiempo</span>
        <span class="hud-value" :class="{ urgent: isUrgent }">{{ formattedTime }}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">Pares</span>
        <span class="hud-value">{{ matchedPairs }} / {{ totalPairs }}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">Puntos</span>
        <span class="hud-value">{{ score }}</span>
      </div>
    </header>

    <!-- Tablero -->
    <main class="board-grid" v-if="!isLoading">
      <MemoryCard
        v-for="card in cards"
        :key="card.uniqueId"
        :card="card"
        :is-flipped="card.isFlipped"
        :is-matched="card.isMatched"
        @flip="onCardFlip"
      />
    </main>

    <p v-else class="loading-text">Cargando...</p>

    <!-- Audio effects: siempre montados para que los refs estén disponibles inmediatamente.
         El src se actualiza reactivamente cuando carga el JSON. -->
    <AudioPlayer ref="audioCorrect" :src="soundPaths.correct" />
    <AudioPlayer ref="audioError" :src="soundPaths.error" />
    <AudioPlayer ref="audioCardflip" :src="soundPaths.cardflip" />
    <AudioPlayer ref="audioPoints" :src="soundPaths.points" />
    <AudioPlayer ref="audioTimer" :src="soundPaths.timer" :loop="true" />
    <AudioPlayer ref="audioTimeup" :src="soundPaths.timeup" />
    <AudioPlayer ref="audioWinning" :src="soundPaths.winning" />
  </div>
</template>

<style scoped>
.game-board {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem 1rem;
}

.hud {
  display: flex;
  gap: 2rem;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 0.75rem 2rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
}

.hud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.hud-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

.hud-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
}

.hud-value.urgent {
  color: var(--color-error);
  animation: pulse 0.6s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 1; }
  to   { opacity: 0.5; }
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(4, 120px);
  gap: 1rem;
}

.loading-text {
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

@media (max-width: 560px) {
  .board-grid {
    grid-template-columns: repeat(3, 90px);
    gap: 0.75rem;
  }

  .hud {
    gap: 1.25rem;
    padding: 0.6rem 1.25rem;
  }
}
</style>
