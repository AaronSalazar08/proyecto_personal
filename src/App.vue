<script setup>
import { computed, ref } from 'vue'
import StartScreen from './components/StartScreen.vue'
import GameBoard from './components/GameBoard.vue'
import ResultScreen from './components/ResultScreen.vue'
import AudioPlayer from './components/AudioPlayer.vue'
import { LEVELS } from './levels.js'
import { useAudioSettings } from './composables/useAudioSettings.js'
import { useScoreHistory } from './composables/useScoreHistory.js'

const LEVEL_STORAGE_KEY = 'memoryGame.levelIndex'

function readSavedLevelIndex() {
  const saved = Number(localStorage.getItem(LEVEL_STORAGE_KEY))
  return Number.isInteger(saved) && saved >= 0 && saved < LEVELS.length ? saved : 0
}

function persistLevelIndex(index) {
  localStorage.setItem(LEVEL_STORAGE_KEY, String(index))
}

// ── Estado global del juego ───────────────────────────────────
// 'start' → 'game' → 'result' → 'start'
const currentScreen = ref('start')
const savedLevelIndex = ref(readSavedLevelIndex())
const levelIndex = ref(0)
const finalScore = ref(0)
const finalTime = ref(0)
const finalWon = ref(false)
const finalReason = ref('timeout')
const finalLevelIndex = ref(0)

const currentLevelConfig = computed(() => LEVELS[levelIndex.value])
const totalLevels = LEVELS.length

// ── Refs de música ────────────────────────────────────────────
const musicGame = ref(null)
const musicWin = ref(null)
const musicLose = ref(null)

const { effectiveMusicVolume } = useAudioSettings()
const { recordScore } = useScoreHistory()

function onStart(startLevelIndex) {
  levelIndex.value = startLevelIndex
  persistLevelIndex(startLevelIndex)
  savedLevelIndex.value = startLevelIndex
  currentScreen.value = 'game'
  musicGame.value?.play()
}

function onEndGame(score, time, won, reason) {
  finalScore.value = score
  finalTime.value = time
  finalWon.value = won
  finalReason.value = reason
  finalLevelIndex.value = levelIndex.value
  recordScore({ score, levelIndex: levelIndex.value, won })
  musicGame.value?.stop()
  currentScreen.value = 'result'

  if (won) {
    levelIndex.value = levelIndex.value < totalLevels - 1 ? levelIndex.value + 1 : 0
    musicWin.value?.play()
  } else {
    musicLose.value?.play()
  }
  persistLevelIndex(levelIndex.value)
  savedLevelIndex.value = levelIndex.value
}

function onNextLevel() {
  musicWin.value?.stop()
  musicLose.value?.stop()
  currentScreen.value = 'game'
  musicGame.value?.play()
}

function onRestart() {
  musicWin.value?.stop()
  musicLose.value?.stop()
  finalScore.value = 0
  finalTime.value = 0
  finalWon.value = false
  currentScreen.value = 'start'
}

function onExitToMenu() {
  musicGame.value?.stop()
  currentScreen.value = 'start'
}
</script>

<template>
  <div class="app">
    <StartScreen
      v-if="currentScreen === 'start'"
      game-title="Juego de Memoria"
      description="Encuentra todos los pares antes de que se acabe el tiempo"
      :saved-level-index="savedLevelIndex"
      @start="onStart"
    />

    <GameBoard
      v-else-if="currentScreen === 'game'"
      :level-config="currentLevelConfig"
      @end-game="onEndGame"
      @exit-to-menu="onExitToMenu"
    />

    <ResultScreen
      v-else-if="currentScreen === 'result'"
      :score="finalScore"
      :time="finalTime"
      :won="finalWon"
      :reason="finalReason"
      :level-index="finalLevelIndex"
      :total-levels="totalLevels"
      @restart="onRestart"
      @next-level="onNextLevel"
    />

    <!-- Música de fondo: siempre montada para que los refs estén disponibles -->
    <AudioPlayer ref="musicGame" src="/music/during_game.mp3" :loop="true" :volume="effectiveMusicVolume" />
    <AudioPlayer ref="musicWin"  src="/music/after_winning.mp3" :loop="true" :volume="effectiveMusicVolume" />
    <AudioPlayer ref="musicLose" src="/music/after_losing.mp3" :loop="true" :volume="effectiveMusicVolume" />
  </div>
</template>

<style>
@import './assets/main.css';

.app {
  min-height: 100vh;
}
</style>
