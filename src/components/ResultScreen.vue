<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: { type: Number, required: true },
  time:  { type: Number, required: true },
  won:   { type: Boolean, required: true },
  reason: { type: String, default: 'timeout' },
  levelIndex: { type: Number, default: 0 },
  totalLevels: { type: Number, default: 1 },
})
const emit = defineEmits(['restart', 'next-level'])

const isLastLevel = computed(() => props.levelIndex === props.totalLevels - 1)

const title = computed(() => {
  if (props.won) return isLastLevel.value ? '¡Juego completado!' : '¡Lo lograste!'
  return props.reason === 'fails' ? '¡Demasiados fallos!' : '¡Se acabó el tiempo!'
})

const exitCode = computed(() => {
  if (props.won) return '0 (OK)'
  return props.reason === 'fails' ? '1 (TOO_MANY_FAILS)' : '1 (TIMEOUT)'
})
</script>

<template>
  <div class="screen result-screen">
    <div class="terminal-window">

      <!-- Window chrome -->
      <div class="titlebar">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
        <span class="titlebar-name">resultado.log</span>
      </div>

      <div class="result-content">

        <!-- Status pill -->
        <div class="status-pill" :class="won ? 'pill-ok' : 'pill-err'">
          {{ won ? '[SUCCESS]' : '[ERROR]' }}
        </div>

        <!-- Heading — solid color + text-shadow glow, no background-clip -->
        <h1 class="result-title" :class="won ? 'title-win' : 'title-lose'">
          {{ title }}
        </h1>

        <!-- Terminal output block -->
        <div class="output-block">
          <p class="out-line">
            <span class="out-key">exit_code</span>
            <span class="out-op">:</span>
            <span :class="won ? 'out-ok' : 'out-err'">{{ exitCode }}</span>
          </p>
          <p class="out-line">
            <span class="out-key">nivel&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span class="out-op">:</span>
            <span class="out-val">{{ levelIndex + 1 }}/{{ totalLevels }}</span>
          </p>
          <p class="out-line" v-if="won">
            <span class="out-key">tiempo&nbsp;&nbsp;&nbsp;</span>
            <span class="out-op">:</span>
            <span class="out-val">{{ time }}s</span>
          </p>
          <p class="out-line">
            <span class="out-key">puntos&nbsp;&nbsp;&nbsp;</span>
            <span class="out-op">:</span>
            <span class="out-val">{{ score }}</span>
          </p>
        </div>

        <button
          v-if="won && isLastLevel"
          class="btn btn-primary result-btn"
          @click="emit('restart')"
        >
          <span class="prompt-green">$</span> run ./juego --restart
        </button>

        <button v-else class="btn btn-primary result-btn" @click="emit('next-level')">
          <span class="prompt-green">$</span> run ./juego {{ won ? '--next-level' : '--retry' }}
        </button>

      </div>
    </div>
  </div>
</template>

<style scoped>
.result-screen { background: transparent; }

/* ── Terminal window ──────────────────────────── */
.terminal-window {
  max-width: 460px;
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(122, 162, 247, 0.08),
    0 0 60px rgba(122, 162, 247, 0.1),
    var(--shadow-card);
}

/* ── Titlebar ──────────────────────────────────── */
.titlebar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--color-border);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-red    { background: #f7768e; }
.dot-yellow { background: #e0af68; }
.dot-green  { background: #9ece6a; }

.titlebar-name {
  flex: 1;
  text-align: center;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

/* ── Content ───────────────────────────────────── */
.result-content {
  padding: 2rem 2rem 2.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
}

/* ── Status pill ────────────────────────────────── */
.status-pill {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 0.28rem 0.85rem;
  border-radius: var(--radius-sm);
}

.pill-ok {
  background: rgba(158, 206, 106, 0.15);
  color: var(--color-success);
  border: 1px solid rgba(158, 206, 106, 0.35);
}

.pill-err {
  background: rgba(247, 118, 142, 0.15);
  color: var(--color-error);
  border: 1px solid rgba(247, 118, 142, 0.35);
}

/* ── Title: solid colour + glow (no background-clip) ── */
.result-title {
  font-size: clamp(1.75rem, 6vw, 2.75rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  /* No transparent fill, no background-clip — just solid colour */
}

.title-win {
  color: var(--color-success);
  text-shadow:
    0 0 18px rgba(158, 206, 106, 0.65),
    0 0 42px rgba(158, 206, 106, 0.25);
}

.title-lose {
  color: var(--color-error);
  text-shadow:
    0 0 18px rgba(247, 118, 142, 0.65),
    0 0 42px rgba(247, 118, 142, 0.25);
}

/* ── Output block ───────────────────────────────── */
.output-block {
  width: 100%;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.9rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  text-align: left;
}

.out-line {
  display: flex;
  gap: 0.55rem;
  font-size: 0.875rem;
  align-items: baseline;
}

.out-key { color: var(--color-primary); white-space: pre; }
.out-op  { color: var(--color-text-muted); }
.out-val { color: var(--color-warn); font-weight: 600; }
.out-ok  { color: var(--color-success); font-weight: 600; }
.out-err { color: var(--color-error);   font-weight: 600; }

/* ── Button ─────────────────────────────────────── */
.result-btn { font-size: 0.92rem; padding: 0.7rem 2rem; }

.prompt-green { color: var(--color-success); }
</style>
