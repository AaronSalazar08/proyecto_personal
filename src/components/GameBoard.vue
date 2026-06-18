<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import MemoryCard from './MemoryCard.vue'
import AudioPlayer from './AudioPlayer.vue'

const props = defineProps({
  levelConfig: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['end-game'])

// ── Estado del juego ─────────────────────────────────────────
const cards = ref([])
const flippedCards = ref([])
const matchedPairs = ref(0)
const totalPairs = ref(0)
const score = ref(0)
const timeLeft = ref(props.levelConfig.totalTime)
const isChecking = ref(false)
const isLoading = ref(true)
const isPreviewing = ref(false)
const previewCardId = ref(null)
const failCount = ref(0)
const FAIL_LIMIT = props.levelConfig.failLimit

// ── Refs de audio ─────────────────────────────────────────────
const audioCorrect = ref(null)
const audioError = ref(null)
const audioTimer = ref(null)
const audioTimeup = ref(null)
const audioWinning = ref(null)
const audioCardflip = ref(null)
const audioPoints = ref(null)
const soundPaths = ref({
  correct: '',
  error: '',
  timer: '',
  timeup: '',
  winning: '',
  cardflip: '',
  points: '',
})

// ── Preview previo al inicio ────────────────────────────────────
const PREVIEW_DURATION = props.levelConfig.previewDuration
const PREVIEW_FLASH_INTERVAL = props.levelConfig.previewFlashInterval
let previewInterval = null

function startPreview() {
  const queue = shuffleCards(cards.value.map((c) => c.uniqueId))
  const flashCount = Math.min(queue.length, PREVIEW_DURATION / PREVIEW_FLASH_INTERVAL)
  isPreviewing.value = true

  let i = 0
  previewInterval = setInterval(() => {
    if (i >= flashCount) {
      clearInterval(previewInterval)
      previewCardId.value = null
      isPreviewing.value = false
      startTimer()
      audioTimer.value?.play()
      return
    }
    previewCardId.value = queue[i]
    i++
  }, PREVIEW_FLASH_INTERVAL)
}

// ── Timer ──────────────────────────────────────────────────────
const TOTAL_TIME = props.levelConfig.totalTime
let timerInterval = null

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timerInterval)
      audioTimer.value?.stop()
      audioTimeup.value?.play()
      setTimeout(() => emit('end-game', score.value, TOTAL_TIME, false, 'timeout'), 800)
    }
  }, 1000)
}

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const isUrgent = computed(() => timeLeft.value <= 10)

// ── Carga de datos ─────────────────────────────────────────────
onMounted(async () => {
  try {
    const res = await fetch('/data/cards.json')
    const data = await res.json()
    soundPaths.value = data.sounds
    const selected = selectRandomPairs(data.pool, props.levelConfig.pairs)
    totalPairs.value = selected.length
    cards.value = shuffleCards(buildCardPairs(selected))
  } finally {
    isLoading.value = false
    // nextTick garantiza que el watch de AudioPlayer ya disparó .load()
    // antes de llamar .play(), evitando que el src aún esté vacío
    await nextTick()
    startPreview()
  }
})

onUnmounted(() => {
  clearInterval(timerInterval)
  clearInterval(previewInterval)
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

function selectRandomPairs(pool, count) {
  return shuffleCards(pool).slice(0, count)
}

function onCardFlip(card) {
  if (isPreviewing.value || isChecking.value) return

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
      setTimeout(() => emit('end-game', score.value, timeTaken, true, 'win'), 800)
    }
  } else {
    failCount.value++
    audioError.value?.play()
    setTimeout(() => {
      first.isFlipped = false
      second.isFlipped = false
      flippedCards.value = []
      isChecking.value = false

      if (FAIL_LIMIT != null && failCount.value >= FAIL_LIMIT) {
        clearInterval(timerInterval)
        audioTimer.value?.stop()
        audioTimeup.value?.play()
        const timeTaken = TOTAL_TIME - timeLeft.value
        setTimeout(() => emit('end-game', score.value, timeTaken, false, 'fails'), 800)
      }
    }, 1000)
  }
}
</script>

<template>
  <div class="game-board">
    <!-- HUD -->
    <header class="hud" v-if="!isPreviewing">
      <div class="hud-item">
        <span class="hud-key">tiempo</span>
        <span class="hud-op">=</span>
        <span class="hud-val" :class="{ urgent: isUrgent }">{{ formattedTime }}</span>
      </div>
      <span class="hud-sep">//</span>
      <div class="hud-item">
        <span class="hud-key">pares</span>
        <span class="hud-op">=</span>
        <span class="hud-val">{{ matchedPairs }}/{{ totalPairs }}</span>
      </div>
      <span class="hud-sep">//</span>
      <div class="hud-item">
        <span class="hud-key">score</span>
        <span class="hud-op">=</span>
        <span class="hud-val">{{ score }}</span>
      </div>
      <template v-if="FAIL_LIMIT != null">
        <span class="hud-sep">//</span>
        <div class="hud-item">
          <span class="hud-key">fallos</span>
          <span class="hud-op">=</span>
          <span class="hud-val" :class="{ urgent: failCount >= FAIL_LIMIT - 1 }">{{ failCount }}/{{ FAIL_LIMIT }}</span>
        </div>
      </template>
    </header>

    <header class="hud hud-preview" v-else>
      <span class="hud-key">// memoriza...</span>
    </header>

    <!-- Tablero -->
    <main class="board-grid" v-if="!isLoading">
      <MemoryCard
        v-for="card in cards"
        :key="card.uniqueId"
        :card="card"
        :is-flipped="card.isFlipped || (isPreviewing && card.uniqueId === previewCardId)"
        :is-matched="card.isMatched"
        :instant="isPreviewing"
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
  align-items: center;
  gap: 0.9rem;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 0.6rem 1.5rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  font-size: 0.88rem;
}

.hud-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.hud-key { color: var(--color-primary); }

.hud-preview {
  justify-content: center;
  font-size: 0.95rem;
}

.hud-op { color: var(--color-text-muted); }

.hud-val {
  color: var(--color-warn);
  font-weight: 700;
  min-width: 3ch;
}

.hud-val.urgent {
  color: var(--color-error);
  animation: pulse 0.6s ease-in-out infinite alternate;
  text-shadow: 0 0 8px rgba(247, 118, 142, 0.6);
}

.hud-sep {
  color: var(--color-text-muted);
  opacity: 0.4;
  font-size: 0.78rem;
}

@keyframes pulse {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.45;
  }
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(6, 100px);
  gap: 0.85rem;
}

.loading-text {
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

@media (max-width: 700px) {
  .board-grid {
    grid-template-columns: repeat(4, 80px);
    gap: 0.6rem;
  }
}

@media (max-width: 420px) {
  .board-grid {
    grid-template-columns: repeat(3, 80px);
    gap: 0.5rem;
  }

  .hud {
    gap: 1.25rem;
    padding: 0.6rem 1.25rem;
  }
}
</style>
