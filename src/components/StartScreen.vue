<script setup>
defineProps({
  gameTitle: {
    type: String,
    default: 'Juego de Memoria',
  },
  description: {
    type: String,
    default: 'Encuentra todos los pares',
  },
})

const emit = defineEmits(['start'])
</script>

<template>
  <div class="screen start-screen">
    <div class="start-content">
      <h1 class="start-title">{{ gameTitle }}</h1>
      <p class="start-desc">{{ description }}</p>

      <div class="start-rules">
        <h2>¿Cómo jugar?</h2>
        <ul>
          <li>Voltea dos cartas por turno</li>
          <li>Encuentra todos los pares iguales</li>
          <li>¡Completa el tablero en el menor tiempo posible!</li>
        </ul>
      </div>

      <button class="btn btn-primary" @click="emit('start')">Jugar</button>
    </div>
  </div>
</template>

<style scoped>
.start-screen {
  background: var(--color-bg);
}

.start-content {
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.start-title {
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.start-desc {
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

.start-rules {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 1.25rem 1.75rem;
  width: 100%;
  text-align: left;
  border: 1px solid var(--color-border);
}

.start-rules h2 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--color-secondary);
}

.start-rules ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.start-rules li::before {
  content: '→ ';
  color: var(--color-primary);
  font-weight: 700;
}

.btn {
  font-size: 1.1rem;
  padding: 0.85rem 3rem;
}
</style>
