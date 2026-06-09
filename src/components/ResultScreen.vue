<script setup>
const props = defineProps({
  score: {
    type: Number,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
  won: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['restart'])
</script>

<template>
  <div class="screen result-screen">
    <div class="result-content">
      <div class="result-icon">{{ won ? '🏆' : '⏰' }}</div>

      <h1 class="result-title" :class="won ? 'win' : 'lose'">
        {{ won ? '¡Lo lograste!' : '¡Se acabó el tiempo!' }}
      </h1>

      <p class="result-message">
        {{ won ? `Completaste la memoria en ${time}s` : 'No alcanzó el tiempo. ¡Inténtalo de nuevo!' }}
      </p>

      <div class="result-stats">
        <div class="stat-card">
          <span class="stat-value">{{ score }}</span>
          <span class="stat-label">Puntos</span>
        </div>
        <div class="stat-card" v-if="won">
          <span class="stat-value">{{ time }}s</span>
          <span class="stat-label">Tiempo</span>
        </div>
      </div>

      <button class="btn btn-primary" @click="emit('restart')">Jugar de nuevo</button>
    </div>
  </div>
</template>

<style scoped>
.result-screen {
  background: var(--color-bg);
}

.result-content {
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.result-icon {
  font-size: 4rem;
  line-height: 1;
}

.result-title {
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 800;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.result-title.win {
  background: linear-gradient(135deg, var(--color-accent), var(--color-secondary));
  filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.4));
}

.result-title.lose {
  background: linear-gradient(135deg, var(--color-error), #f97316);
}

.result-message {
  color: var(--color-text-muted);
  font-size: 1.05rem;
  text-align: center;
}

.result-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 110px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-accent);
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}
</style>
