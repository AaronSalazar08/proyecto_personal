import { ref, computed } from 'vue'

const history = ref([])

function recordScore({ score, levelIndex, won }) {
  history.value.push({ score, levelIndex, won, timestamp: Date.now() })
}

const topScores = computed(() => [...history.value].sort((a, b) => b.score - a.score).slice(0, 10))

export function useScoreHistory() {
  return { history, topScores, recordScore }
}
