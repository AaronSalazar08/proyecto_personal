<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SettingsPanel from './SettingsPanel.vue'

const props = defineProps({
  gameTitle: { type: String, default: 'Juego de Memoria' },
  description: { type: String, default: 'Encuentra todos los pares' },
  savedLevelIndex: { type: Number, default: 0 },
})
const emit = defineEmits(['start'])

const showSettings = ref(false)

function onKeydown(e) {
  if (e.key === 'Tab') {
    e.preventDefault()
    showSettings.value = !showSettings.value
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

function startFromSaved() {
  emit('start', props.savedLevelIndex)
}

function startFromBeginning() {
  emit('start', 0)
}
</script>

<template>
  <div class="screen start-screen">
    <div class="terminal-window">
      <button class="settings-gear" @click="showSettings = true" aria-label="Abrir opciones">⚙</button>

      <!-- Window chrome -->
      <div class="titlebar">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
        <span class="titlebar-name">tech_memory.exe</span>
      </div>

      <!-- Body -->
      <div class="start-content">

        <div class="title-row">
          <span class="prompt">$</span>
          <h1 class="start-title">Tech Memory<span class="cursor">▋</span></h1>
        </div>

        <p class="start-desc">
          <span class="cmt">// </span>{{ description }}
        </p>

        <div class="code-block">
          <p class="code-line">
            <span class="kw">const</span>
            <span class="fn"> instrucciones</span>
            <span class="op"> = </span>
            <span class="br">[</span>
          </p>
          <ul class="code-list">
            <li>
              <span class="str">"Voltea dos cartas por turno"</span><span class="op">,</span>
            </li>
            <li>
              <span class="str">"Encuentra todos los pares iguales"</span><span class="op">,</span>
            </li>
            <li>
              <span class="str">"¡Completa el tablero antes de que se acabe el tiempo!"</span>
            </li>
          </ul>
          <p class="code-line">
            <span class="br">]</span><span class="op">;</span>
          </p>
        </div>

        <div class="start-actions" v-if="savedLevelIndex > 0">
          <button class="btn btn-primary start-btn" @click="startFromSaved">
            <span class="prompt-green">$</span> run ./juego --continue (nivel {{ savedLevelIndex + 1 }})
          </button>
          <button class="btn btn-secondary start-btn" @click="startFromBeginning">
            <span class="prompt-green">$</span> run ./juego --restart
          </button>
        </div>

        <button v-else class="btn btn-primary start-btn" @click="startFromBeginning">
          <span class="prompt-green">$</span> run ./juego
        </button>

      </div>
    </div>

    <SettingsPanel v-if="showSettings" :show-game-controls="false" @close="showSettings = false" />
  </div>
</template>

<style scoped>
.start-screen { background: transparent; }

/* ── Terminal window ───────────────────────────── */
.terminal-window {
  position: relative;
  max-width: 520px;
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

.settings-gear {
  position: absolute;
  top: 0.65rem;
  right: 0.85rem;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  z-index: 2;
}

.settings-gear:hover { color: var(--color-primary); }

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
.start-content {
  padding: 2rem 2rem 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
}

/* Title row */
.title-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.prompt {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-success);
  line-height: 1;
}

.start-title {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 800;
  color: var(--color-text);
  line-height: 1;
  letter-spacing: -0.02em;
}

.cursor {
  color: var(--color-primary);
  animation: blink 1.1s step-end infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* Description */
.start-desc {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.cmt { color: var(--color-text-muted); }

/* Code block */
.code-block {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
}

.code-line {
  font-size: 0.85rem;
  line-height: 1.8;
}

.code-list {
  list-style: none;
  padding-left: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.code-list li { font-size: 0.85rem; }

/* Syntax colours */
.kw { color: var(--color-accent); }
.fn { color: var(--color-primary); }
.op { color: var(--color-text-muted); }
.br { color: var(--color-warn); }
.str{ color: var(--color-success); }

/* Button */
.start-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.25rem;
}

.start-btn {
  align-self: center;
  margin-top: 0.25rem;
  font-size: 1rem;
  padding: 0.7rem 2.5rem;
}

.start-actions .start-btn {
  margin-top: 0;
  font-size: 0.9rem;
  padding: 0.65rem 2rem;
}

.prompt-green { color: var(--color-success); }
</style>
