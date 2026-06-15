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

      <!-- Back face -->
      <div class="card-back">
        <span class="card-back__icon">&lt;/&gt;</span>
      </div>

      <!-- Front face -->
      <div class="card-front">
        <img :src="card.image" :alt="card.label" class="card-img" />
        <p class="card-label">&lt;{{ card.label }} /&gt;</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.card-wrapper {
  width: 100px;
  height: 100px;
  perspective: 900px;
  cursor: pointer;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.48s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-md);
}

/* Lift on hover — only for unflipped, unmatched cards */
.card-wrapper:not(.flipped):not(.matched):hover .card-inner {
  transform: translateY(-4px) scale(1.04);
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

/* Back: dark surface with subtle grid + cyan </> */
.card-back {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  background-image:
    linear-gradient(rgba(122, 162, 247, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(122, 162, 247, 0.05) 1px, transparent 1px);
  background-size: 14px 14px;
}

.card-back__icon {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-secondary);
  text-shadow: 0 0 14px rgba(125, 207, 255, 0.55);
  letter-spacing: -0.06em;
}

/* Front: neutral dark + tech logo */
.card-front {
  background: var(--color-surface);
  transform: rotateY(180deg);
  border: 1px solid var(--color-border);
  gap: 0.3rem;
  padding: 0.45rem;
}

.card-wrapper.matched .card-front {
  border-color: var(--color-success);
  box-shadow: 0 0 18px rgba(158, 206, 106, 0.4);
}

.card-img {
  width: 60%;
  height: 60%;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.card-label {
  font-size: 0.52rem;
  color: var(--color-text-muted);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* Matched label highlight */
.card-wrapper.matched .card-label {
  color: var(--color-success);
}

@media (max-width: 480px) {
  .card-wrapper {
    width: 80px;
    height: 80px;
  }

  .card-back__icon { font-size: 1.2rem; }
  .card-label      { font-size: 0.46rem; }
}
</style>
