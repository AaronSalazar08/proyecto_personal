<script setup>
import { ref } from 'vue'
import StartScreen from './components/StartScreen.vue'
import GameBoard from './components/GameBoard.vue'
import ResultScreen from './components/ResultScreen.vue'

// ── Estado global del juego ───────────────────────────────────
// 'start' → 'game' → 'result' → 'start'
const currentScreen = ref('start')
const finalScore = ref(0)
const finalTime = ref(0)

function onStart() {
  currentScreen.value = 'game'
}

function onEndGame(score, time) {
  finalScore.value = score
  finalTime.value = time
  currentScreen.value = 'result'
}

function onRestart() {
  finalScore.value = 0
  finalTime.value = 0
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
      @restart="onRestart"
    />
  </div>
</template>

<style>
@import './assets/main.css';

.app {
  min-height: 100vh;
}
</style>
