<script setup>
const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
  isFlipped: {
    type: Boolean,
    default: false,
  },
  isMatched: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['flip'])

function handleClick() {
  if (!props.isFlipped && !props.isMatched) {
    emit('flip', props.card)
  }
}
</script>

<template>
  <div
    class="card-wrapper"
    :class="{ flipped: isFlipped || isMatched, matched: isMatched }"
    @click="handleClick"
    role="button"
    :aria-label="`Carta ${card.label}`"
    :aria-pressed="isFlipped || isMatched"
  >
    <div class="card-inner">
      <!-- Cara posterior (visible por defecto) -->
      <div class="card-back">
        <span class="card-back__icon">?</span>
      </div>

      <!-- Cara frontal (visible al voltear) -->
      <div class="card-front">
        <img :src="card.image" :alt="card.label" class="card-img" />
        <p class="card-label">{{ card.label }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-wrapper {
  width: 120px;
  height: 120px;
  perspective: 800px;
  cursor: pointer;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
  border-radius: var(--radius-md);
}

.card-wrapper.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-back,
.card-front {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-card);
}

.card-back {
  background: var(--color-primary);
}

.card-back__icon {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}

.card-front {
  background: var(--color-surface);
  transform: rotateY(180deg);
  border: 2px solid var(--color-border);
  gap: 0.4rem;
  padding: 0.5rem;
}

.card-wrapper.matched .card-front {
  border-color: var(--color-success);
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.5);
}

.card-img {
  width: 70%;
  height: 70%;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.card-label {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

@media (max-width: 480px) {
  .card-wrapper {
    width: 90px;
    height: 90px;
  }
}
</style>
