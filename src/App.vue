<script setup>
import { ref } from 'vue'
import StartScreen from './components/StartScreen.vue'
import GameBoard from './components/GameBoard.vue'
import ResultScreen from './components/ResultScreen.vue'
import AudioPlayer from './components/AudioPlayer.vue'

// ── Estado global del juego ───────────────────────────────────
// 'start' → 'game' → 'result' → 'start'
const currentScreen = ref('start')
const finalScore = ref(0)
const finalTime = ref(0)
const finalWon = ref(false)

// ── Refs de música ────────────────────────────────────────────
const musicGame = ref(null)
const musicWin = ref(null)
const musicLose = ref(null)

function onStart() {
  currentScreen.value = 'game'
  musicGame.value?.play()
}

function onEndGame(score, time, won) {
  finalScore.value = score
  finalTime.value = time
  finalWon.value = won
  musicGame.value?.stop()
  currentScreen.value = 'result'
  if (won) {
    musicWin.value?.play()
  } else {
    musicLose.value?.play()
  }
}

function onRestart() {
  musicWin.value?.stop()
  musicLose.value?.stop()
  finalScore.value = 0
  finalTime.value = 0
  finalWon.value = false
  currentScreen.value = 'start'
}
</script>

<template>
  <div class="app">
    <StartScreen
      v-if="currentScreen === 'start'"
      game-title="Juego de Memoria"
      description="Encuentra todos los pares antes de que se acabe el tiempo"
      @start="onStart"
    />

    <GameBoard
      v-else-if="currentScreen === 'game'"
      @end-game="onEndGame"
    />

    <ResultScreen
      v-else-if="currentScreen === 'result'"
      :score="finalScore"
      :time="finalTime"
      :won="finalWon"
      @restart="onRestart"
    />

    <!-- Música de fondo: siempre montada para que los refs estén disponibles -->
    <AudioPlayer ref="musicGame" src="/music/during_game.mp3" :loop="true" />
    <AudioPlayer ref="musicWin"  src="/music/after_winning.mp3" :loop="true" />
    <AudioPlayer ref="musicLose" src="/music/after_losing.mp3" :loop="true" />
  </div>
</template>

<style>
@import './assets/main.css';

.app {
  min-height: 100vh;
}
</style>
