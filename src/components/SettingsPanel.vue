<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAudioSettings } from '../composables/useAudioSettings.js'
import { useScoreHistory } from '../composables/useScoreHistory.js'

const props = defineProps({
  showGameControls: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'restart-level', 'go-to-menu'])

const { musicVolume, sfxVolume, masterVolume, setMusicVolume, setSfxVolume, setMasterVolume } =
  useAudioSettings()
const { topScores } = useScoreHistory()

const items = computed(() => {
  const list = [
    { type: 'slider', key: 'music', label: 'Música', volume: musicVolume, setVolume: setMusicVolume },
    { type: 'slider', key: 'sfx', label: 'Efectos', volume: sfxVolume, setVolume: setSfxVolume },
    { type: 'slider', key: 'master', label: 'Master', volume: masterVolume, setVolume: setMasterVolume },
  ]
  if (props.showGameControls) {
    list.push({ type: 'button', key: 'restart', label: 'Reiniciar nivel', action: () => emit('restart-level') })
    list.push({ type: 'button', key: 'menu', label: 'Volver al menú principal', action: () => emit('go-to-menu') })
  }
  return list
})

const focusedIndex = ref(0)
const editingIndex = ref(null)

function clampIndex(i) {
  return Math.min(items.value.length - 1, Math.max(0, i))
}

function moveFocus(delta) {
  if (editingIndex.value !== null) return
  focusedIndex.value = clampIndex(focusedIndex.value + delta)
}

function adjustSlider(delta) {
  if (editingIndex.value !== focusedIndex.value) return
  const item = items.value[focusedIndex.value]
  if (!item || item.type !== 'slider') return
  item.setVolume(item.volume.value + delta)
}

function activateFocusedItem() {
  const item = items.value[focusedIndex.value]
  if (!item) return
  if (item.type === 'button') {
    item.action()
    return
  }
  editingIndex.value = editingIndex.value === focusedIndex.value ? null : focusedIndex.value
}

function focusItem(index) {
  focusedIndex.value = index
}

function onKeydown(e) {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      e.preventDefault()
      moveFocus(-1)
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      e.preventDefault()
      moveFocus(1)
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
      e.preventDefault()
      adjustSlider(-10)
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      e.preventDefault()
      adjustSlider(10)
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      activateFocusedItem()
      break
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

defineExpose({ focusedIndex, editingIndex, items })
</script>

<template>
  <div class="settings-backdrop" @click="emit('close')">
    <div class="settings-panel" @click.stop>
      <div class="titlebar">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
        <span class="titlebar-name">opciones.cfg</span>
        <button class="settings-close" @click="emit('close')" aria-label="Cerrar opciones">✕</button>
      </div>

      <div class="settings-body">
        <div
          v-for="(item, index) in items"
          :key="item.key"
          class="settings-item"
          :class="{ focused: focusedIndex === index, editing: editingIndex === index }"
          @click="focusItem(index)"
        >
          <template v-if="item.type === 'slider'">
            <span class="settings-label">{{ item.label }}</span>
            <div class="settings-slider-row">
              <button class="settings-step" @click.stop="item.setVolume(item.volume.value - 10); focusItem(index)">−</button>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                :value="item.volume.value"
                @input="item.setVolume(Number($event.target.value)); focusItem(index)"
              />
              <button class="settings-step" @click.stop="item.setVolume(item.volume.value + 10); focusItem(index)">+</button>
              <span class="settings-value">{{ item.volume.value }}%</span>
            </div>
          </template>
          <template v-else>
            <button class="btn btn-secondary settings-action" @click.stop="item.action()">
              {{ item.label }}
            </button>
          </template>
        </div>
      </div>

      <div class="settings-scores" v-if="topScores.length">
        <p class="settings-scores-title"><span class="cmt">// </span>mejores puntuaciones de la sesión</p>
        <ol class="settings-scores-list">
          <li v-for="(entry, i) in topScores" :key="i">
            {{ entry.score }} pts — nivel {{ entry.levelIndex + 1 }} — {{ entry.won ? '✓' : '✗' }}
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 11, 18, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.settings-panel {
  width: min(420px, 92vw);
  max-height: 85vh;
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.titlebar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--color-border);
}

.dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.dot-red { background: #f7768e; }
.dot-yellow { background: #e0af68; }
.dot-green { background: #9ece6a; }

.titlebar-name {
  flex: 1;
  text-align: center;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.settings-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 0.9rem;
}

.settings-close:hover { color: var(--color-error); }

.settings-body {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.25rem;
}

.settings-item {
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: 0.6rem 0.75rem;
}

.settings-item.focused { border-color: var(--color-primary); }
.settings-item.editing { border-color: var(--color-accent); box-shadow: 0 0 14px rgba(187, 154, 247, 0.35); }

.settings-label { font-size: 0.85rem; color: var(--color-text-muted); }

.settings-slider-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.settings-slider-row input[type='range'] { flex: 1; }

.settings-step {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: var(--radius-sm);
  width: 1.6rem;
  height: 1.6rem;
  cursor: pointer;
}

.settings-value {
  min-width: 3.2ch;
  text-align: right;
  color: var(--color-warn);
  font-weight: 600;
  font-size: 0.85rem;
}

.settings-action { width: 100%; }

.settings-scores {
  border-top: 1px solid var(--color-border);
  padding: 1rem 1.25rem 1.25rem;
}

.settings-scores-title { font-size: 0.8rem; margin-bottom: 0.5rem; }
.cmt { color: var(--color-text-muted); }

.settings-scores-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.82rem;
  color: var(--color-text);
}
</style>
