# Panel de Opciones (teclado + mouse) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a settings panel (music/sfx/master volume sliders + session score history, plus in-level restart/exit-to-menu buttons) that is fully operable by keyboard (arrows, WASD, Enter, Space, Tab) and by mouse.

**Architecture:** Two new singleton composables (`useAudioSettings`, `useScoreHistory`) hold shared reactive state. A new `SettingsPanel.vue` component renders the navigable list of sliders/buttons and owns the keyboard-navigation state machine (`focusedIndex`/`editingIndex`). `StartScreen.vue` and `GameBoard.vue` each mount their own `SettingsPanel` instance behind a gear icon + `Tab` key toggle. `AudioPlayer.vue` gets a reactive volume watcher so live-playing loops respond immediately to slider changes.

**Tech Stack:** Vue 3 (`<script setup>`, Composition API), Vitest + @vue/test-utils + jsdom (existing project setup, no new dependencies).

## Global Constraints

- No new npm dependencies (no Pinia, no UI library) — composables only, per approved design.
- Volume values: integers 0-100, step 10, persisted to `localStorage` (keys: `memoryGame.musicVolume`, `memoryGame.sfxVolume`, `memoryGame.masterVolume`).
- Score history: in-memory only, never persisted, capped to top 10 in the displayed view (`topScores`), the raw `history` array is uncapped.
- No wrap-around in keyboard navigation between items.
- No confirmation dialogs for "restart level" / "go to menu" — actions execute immediately.
- `Tab` toggles the whole panel open/closed; this listener lives in the parent component (`StartScreen`/`GameBoard`), never inside `SettingsPanel.vue` itself.
- Follow existing code style: Spanish for in-app copy/comments where the rest of the codebase already uses Spanish (HUD labels, screen titles), JetBrains Mono / Tokyo Night CSS variables already defined in `src/assets/main.css`.

---

## File Structure

- Create: `src/composables/useAudioSettings.js` — volume state + localStorage persistence + effective-volume computeds.
- Create: `src/composables/useScoreHistory.js` — in-memory score log + top-10 computed.
- Create: `src/components/SettingsPanel.vue` — the navigable panel (sliders, buttons, score list, keyboard handling).
- Modify: `src/components/AudioPlayer.vue` — reactive volume watch.
- Modify: `src/components/StartScreen.vue` — gear icon, `Tab` listener, mounts `SettingsPanel`.
- Modify: `src/components/GameBoard.vue` — gear icon, `Tab` listener, mounts `SettingsPanel`, pause-on-open logic, restart/exit-to-menu handlers, wires `effectiveSfxVolume` into effect `AudioPlayer`s.
- Modify: `src/App.vue` — wires `effectiveMusicVolume` into music `AudioPlayer`s, calls `recordScore`, handles `exit-to-menu`.
- Create: `src/__tests__/useAudioSettings.spec.js`
- Create: `src/__tests__/useScoreHistory.spec.js`
- Create: `src/__tests__/AudioPlayer.spec.js`
- Create: `src/__tests__/SettingsPanel.spec.js`
- Create: `src/__tests__/GameBoard.spec.js`

---

### Task 1: `useAudioSettings` composable

**Files:**
- Create: `src/composables/useAudioSettings.js`
- Test: `src/__tests__/useAudioSettings.spec.js`

**Interfaces:**
- Produces: `useAudioSettings()` returning `{ musicVolume, sfxVolume, masterVolume, effectiveMusicVolume, effectiveSfxVolume, setMusicVolume(v), setSfxVolume(v), setMasterVolume(v) }`. `musicVolume`/`sfxVolume`/`masterVolume` are `Ref<number>` (0-100). `effectiveMusicVolume`/`effectiveSfxVolume` are `ComputedRef<number>` (0-1). Setters clamp to `[0,100]` and persist to `localStorage`.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/useAudioSettings.spec.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useAudioSettings', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  it('defaults every volume to 100 when localStorage is empty', async () => {
    const { useAudioSettings } = await import('../composables/useAudioSettings.js')
    const { musicVolume, sfxVolume, masterVolume } = useAudioSettings()
    expect(musicVolume.value).toBe(100)
    expect(sfxVolume.value).toBe(100)
    expect(masterVolume.value).toBe(100)
  })

  it('reads initial values from localStorage when present', async () => {
    localStorage.setItem('memoryGame.musicVolume', '40')
    localStorage.setItem('memoryGame.sfxVolume', '70')
    localStorage.setItem('memoryGame.masterVolume', '50')
    const { useAudioSettings } = await import('../composables/useAudioSettings.js')
    const { musicVolume, sfxVolume, masterVolume } = useAudioSettings()
    expect(musicVolume.value).toBe(40)
    expect(sfxVolume.value).toBe(70)
    expect(masterVolume.value).toBe(50)
  })

  it('clamps setMusicVolume to the 0-100 range', async () => {
    const { useAudioSettings } = await import('../composables/useAudioSettings.js')
    const { musicVolume, setMusicVolume } = useAudioSettings()
    setMusicVolume(150)
    expect(musicVolume.value).toBe(100)
    setMusicVolume(-20)
    expect(musicVolume.value).toBe(0)
  })

  it('persists every setter call to localStorage', async () => {
    const { useAudioSettings } = await import('../composables/useAudioSettings.js')
    const { setMusicVolume, setSfxVolume, setMasterVolume } = useAudioSettings()
    setMusicVolume(30)
    setSfxVolume(60)
    setMasterVolume(80)
    expect(localStorage.getItem('memoryGame.musicVolume')).toBe('30')
    expect(localStorage.getItem('memoryGame.sfxVolume')).toBe('60')
    expect(localStorage.getItem('memoryGame.masterVolume')).toBe('80')
  })

  it('computes effective volumes as music/sfx attenuated by master', async () => {
    const { useAudioSettings } = await import('../composables/useAudioSettings.js')
    const { setMusicVolume, setSfxVolume, setMasterVolume, effectiveMusicVolume, effectiveSfxVolume } =
      useAudioSettings()
    setMusicVolume(50)
    setSfxVolume(80)
    setMasterVolume(50)
    expect(effectiveMusicVolume.value).toBeCloseTo(0.25)
    expect(effectiveSfxVolume.value).toBeCloseTo(0.4)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/useAudioSettings.spec.js`
Expected: FAIL — `Cannot find module '../composables/useAudioSettings.js'`

- [ ] **Step 3: Implement `useAudioSettings.js`**

Create `src/composables/useAudioSettings.js`:

```js
import { ref, computed } from 'vue'

const STORAGE_KEYS = {
  music: 'memoryGame.musicVolume',
  sfx: 'memoryGame.sfxVolume',
  master: 'memoryGame.masterVolume',
}

function readStoredVolume(key) {
  const saved = Number(localStorage.getItem(key))
  return Number.isInteger(saved) && saved >= 0 && saved <= 100 ? saved : 100
}

function clampVolume(v) {
  return Math.min(100, Math.max(0, v))
}

const musicVolume = ref(readStoredVolume(STORAGE_KEYS.music))
const sfxVolume = ref(readStoredVolume(STORAGE_KEYS.sfx))
const masterVolume = ref(readStoredVolume(STORAGE_KEYS.master))

function setMusicVolume(v) {
  musicVolume.value = clampVolume(v)
  localStorage.setItem(STORAGE_KEYS.music, String(musicVolume.value))
}

function setSfxVolume(v) {
  sfxVolume.value = clampVolume(v)
  localStorage.setItem(STORAGE_KEYS.sfx, String(sfxVolume.value))
}

function setMasterVolume(v) {
  masterVolume.value = clampVolume(v)
  localStorage.setItem(STORAGE_KEYS.master, String(masterVolume.value))
}

const effectiveMusicVolume = computed(() => (musicVolume.value / 100) * (masterVolume.value / 100))
const effectiveSfxVolume = computed(() => (sfxVolume.value / 100) * (masterVolume.value / 100))

export function useAudioSettings() {
  return {
    musicVolume,
    sfxVolume,
    masterVolume,
    effectiveMusicVolume,
    effectiveSfxVolume,
    setMusicVolume,
    setSfxVolume,
    setMasterVolume,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/useAudioSettings.spec.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/composables/useAudioSettings.js src/__tests__/useAudioSettings.spec.js
git commit -m "feat: add useAudioSettings composable for music/sfx/master volume"
```

---

### Task 2: `useScoreHistory` composable

**Files:**
- Create: `src/composables/useScoreHistory.js`
- Test: `src/__tests__/useScoreHistory.spec.js`

**Interfaces:**
- Produces: `useScoreHistory()` returning `{ history, topScores, recordScore({ score, levelIndex, won }) }`. `history` is `Ref<Array<{score, levelIndex, won, timestamp}>>` (uncapped, in insertion order). `topScores` is `ComputedRef` of `history` sorted descending by `score`, sliced to the first 10.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/useScoreHistory.spec.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { useScoreHistory } from '../composables/useScoreHistory.js'

describe('useScoreHistory', () => {
  beforeEach(() => {
    useScoreHistory().history.value = []
  })

  it('records an entry with the given score, levelIndex and won flag', () => {
    const { history, recordScore } = useScoreHistory()
    recordScore({ score: 50, levelIndex: 2, won: true })
    expect(history.value).toHaveLength(1)
    expect(history.value[0]).toMatchObject({ score: 50, levelIndex: 2, won: true })
    expect(typeof history.value[0].timestamp).toBe('number')
  })

  it('keeps every recorded entry in history, uncapped', () => {
    const { history, recordScore } = useScoreHistory()
    for (let i = 0; i < 15; i++) recordScore({ score: i, levelIndex: 0, won: false })
    expect(history.value).toHaveLength(15)
  })

  it('sorts topScores descending by score', () => {
    const { recordScore, topScores } = useScoreHistory()
    recordScore({ score: 10, levelIndex: 0, won: true })
    recordScore({ score: 90, levelIndex: 1, won: true })
    recordScore({ score: 50, levelIndex: 2, won: false })
    expect(topScores.value.map((e) => e.score)).toEqual([90, 50, 10])
  })

  it('caps topScores to the first 10 entries', () => {
    const { recordScore, topScores } = useScoreHistory()
    for (let i = 0; i < 15; i++) recordScore({ score: i, levelIndex: 0, won: false })
    expect(topScores.value).toHaveLength(10)
    expect(topScores.value[0].score).toBe(14)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/useScoreHistory.spec.js`
Expected: FAIL — `Cannot find module '../composables/useScoreHistory.js'`

- [ ] **Step 3: Implement `useScoreHistory.js`**

Create `src/composables/useScoreHistory.js`:

```js
import { ref, computed } from 'vue'

const history = ref([])

function recordScore({ score, levelIndex, won }) {
  history.value.push({ score, levelIndex, won, timestamp: Date.now() })
}

const topScores = computed(() => [...history.value].sort((a, b) => b.score - a.score).slice(0, 10))

export function useScoreHistory() {
  return { history, topScores, recordScore }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/useScoreHistory.spec.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/composables/useScoreHistory.js src/__tests__/useScoreHistory.spec.js
git commit -m "feat: add useScoreHistory composable for session score tracking"
```

---

### Task 3: Reactive volume in `AudioPlayer.vue`

**Files:**
- Modify: `src/components/AudioPlayer.vue:26-34` (after the existing `src` watch)
- Test: `src/__tests__/AudioPlayer.spec.js`

**Interfaces:**
- Consumes: none new (uses existing `props.volume`).
- Produces: no API change — `audioRef.value.volume` now updates immediately when `props.volume` changes, even while the element is already playing a loop.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/AudioPlayer.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AudioPlayer from '../components/AudioPlayer.vue'

describe('AudioPlayer', () => {
  it('updates the underlying audio element volume reactively when the prop changes', async () => {
    const wrapper = mount(AudioPlayer, { props: { src: '/audio/test.mp3', volume: 1 } })
    const audioEl = wrapper.find('audio').element
    await wrapper.setProps({ volume: 0.3 })
    expect(audioEl.volume).toBeCloseTo(0.3)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/AudioPlayer.spec.js`
Expected: FAIL — `audioEl.volume` is still `1` (no watcher updates it post-mount)

- [ ] **Step 3: Add the reactive watch**

In `src/components/AudioPlayer.vue`, after the existing `watch(() => props.src, ...)` block (currently lines 26-34), add:

```js
watch(
  () => props.volume,
  (newVolume) => {
    if (audioRef.value) audioRef.value.volume = newVolume
  },
)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/AudioPlayer.spec.js`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/AudioPlayer.vue src/__tests__/AudioPlayer.spec.js
git commit -m "fix: make AudioPlayer volume prop reactive for already-playing loops"
```

---

### Task 4: `SettingsPanel.vue` component

**Files:**
- Create: `src/components/SettingsPanel.vue`
- Test: `src/__tests__/SettingsPanel.spec.js`

**Interfaces:**
- Consumes: `useAudioSettings()` from Task 1 (`musicVolume`, `sfxVolume`, `masterVolume`, `setMusicVolume`, `setSfxVolume`, `setMasterVolume`), `useScoreHistory()` from Task 2 (`topScores`).
- Produces: `<SettingsPanel :show-game-controls="Boolean" />`, emits `close`, `restart-level`, `go-to-menu`. Exposes (via `defineExpose`, for testability) `focusedIndex` (`Ref<number>`), `editingIndex` (`Ref<number|null>`), `items` (`ComputedRef<Array<{type: 'slider'|'button', key, label, ...}>>`).

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/SettingsPanel.spec.js`:

```js
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsPanel from '../components/SettingsPanel.vue'
import { useAudioSettings } from '../composables/useAudioSettings.js'
import { useScoreHistory } from '../composables/useScoreHistory.js'

function pressKey(key) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }))
}

describe('SettingsPanel', () => {
  let wrapper

  beforeEach(() => {
    const { setMusicVolume, setSfxVolume, setMasterVolume } = useAudioSettings()
    setMusicVolume(100)
    setSfxVolume(100)
    setMasterVolume(100)
    useScoreHistory().history.value = []
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('starts with focus on the first item and nothing in edit mode', () => {
    wrapper = mount(SettingsPanel, { props: { showGameControls: false } })
    expect(wrapper.vm.focusedIndex).toBe(0)
    expect(wrapper.vm.editingIndex).toBe(null)
  })

  it('moves focus with ArrowDown/ArrowUp without entering edit mode', () => {
    wrapper = mount(SettingsPanel, { props: { showGameControls: false } })
    pressKey('ArrowDown')
    expect(wrapper.vm.focusedIndex).toBe(1)
    expect(wrapper.vm.editingIndex).toBe(null)
    pressKey('ArrowUp')
    expect(wrapper.vm.focusedIndex).toBe(0)
  })

  it('does not wrap around past the last or first item', () => {
    wrapper = mount(SettingsPanel, { props: { showGameControls: false } })
    pressKey('ArrowUp')
    expect(wrapper.vm.focusedIndex).toBe(0)
    pressKey('ArrowDown')
    pressKey('ArrowDown')
    pressKey('ArrowDown')
    expect(wrapper.vm.focusedIndex).toBe(2)
  })

  it('toggles edit mode on the focused slider with Enter, and Space works the same way', () => {
    wrapper = mount(SettingsPanel, { props: { showGameControls: false } })
    pressKey('Enter')
    expect(wrapper.vm.editingIndex).toBe(0)
    pressKey(' ')
    expect(wrapper.vm.editingIndex).toBe(null)
  })

  it('only adjusts the slider value with ArrowLeft/ArrowRight while in edit mode', () => {
    wrapper = mount(SettingsPanel, { props: { showGameControls: false } })
    pressKey('ArrowLeft')
    expect(wrapper.vm.items[0].volume.value).toBe(100)
    pressKey('Enter')
    pressKey('ArrowLeft')
    expect(wrapper.vm.items[0].volume.value).toBe(90)
    pressKey('ArrowRight')
    pressKey('ArrowRight')
    expect(wrapper.vm.items[0].volume.value).toBe(100)
  })

  it('supports WASD as an alternative to arrow keys', () => {
    wrapper = mount(SettingsPanel, { props: { showGameControls: false } })
    pressKey('s')
    expect(wrapper.vm.focusedIndex).toBe(1)
    pressKey(' ')
    pressKey('a')
    expect(wrapper.vm.items[1].volume.value).toBe(90)
  })

  it('does not include restart/menu buttons when showGameControls is false', () => {
    wrapper = mount(SettingsPanel, { props: { showGameControls: false } })
    expect(wrapper.vm.items).toHaveLength(3)
    expect(wrapper.vm.items.every((item) => item.type === 'slider')).toBe(true)
  })

  it('includes restart/menu buttons when showGameControls is true, and Enter on a button emits immediately', () => {
    wrapper = mount(SettingsPanel, { props: { showGameControls: true } })
    expect(wrapper.vm.items).toHaveLength(5)
    pressKey('ArrowDown')
    pressKey('ArrowDown')
    pressKey('ArrowDown')
    expect(wrapper.vm.focusedIndex).toBe(3)
    pressKey('Enter')
    expect(wrapper.emitted('restart-level')).toHaveLength(1)
    expect(wrapper.vm.editingIndex).toBe(null)
  })

  it('emits close when the close button is clicked', async () => {
    wrapper = mount(SettingsPanel, { props: { showGameControls: false } })
    await wrapper.find('.settings-close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/SettingsPanel.spec.js`
Expected: FAIL — `Cannot find module '../components/SettingsPanel.vue'`

- [ ] **Step 3: Implement `SettingsPanel.vue`**

Create `src/components/SettingsPanel.vue`:

```vue
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/SettingsPanel.spec.js`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/SettingsPanel.vue src/__tests__/SettingsPanel.spec.js
git commit -m "feat: add SettingsPanel component with keyboard and mouse navigation"
```

---

### Task 5: Integrate `SettingsPanel` into `StartScreen.vue`

**Files:**
- Modify: `src/components/StartScreen.vue`
- Test: `src/__tests__/StartScreen.spec.js`

**Interfaces:**
- Consumes: `SettingsPanel` from Task 4 with `show-game-controls="false"`.
- Produces: no new emits — `StartScreen` keeps emitting `start` exactly as before.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/StartScreen.spec.js`:

```js
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StartScreen from '../components/StartScreen.vue'

describe('StartScreen', () => {
  let wrapper

  afterEach(() => wrapper?.unmount())

  it('does not show the settings panel initially', () => {
    wrapper = mount(StartScreen)
    expect(wrapper.findComponent({ name: 'SettingsPanel' }).exists()).toBe(false)
  })

  it('opens the settings panel when the gear icon is clicked', async () => {
    wrapper = mount(StartScreen)
    await wrapper.find('.settings-gear').trigger('click')
    expect(wrapper.findComponent({ name: 'SettingsPanel' }).exists()).toBe(true)
  })

  it('toggles the settings panel open and closed with the Tab key', async () => {
    wrapper = mount(StartScreen)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'SettingsPanel' }).exists()).toBe(true)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'SettingsPanel' }).exists()).toBe(false)
  })

  it('closes the settings panel when SettingsPanel emits close', async () => {
    wrapper = mount(StartScreen)
    await wrapper.find('.settings-gear').trigger('click')
    await wrapper.findComponent({ name: 'SettingsPanel' }).vm.$emit('close')
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'SettingsPanel' }).exists()).toBe(false)
  })
})
```

`SettingsPanel.vue` (Task 4) does not declare a `name` option, which `<script setup>` infers from the filename automatically in Vue 3 + the project's `@vitejs/plugin-vue` setup, so `findComponent({ name: 'SettingsPanel' })` resolves correctly.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/StartScreen.spec.js`
Expected: FAIL — gear icon `.settings-gear` not found

- [ ] **Step 3: Update `StartScreen.vue`**

In `src/components/StartScreen.vue`, replace the `<script setup>` block (lines 1-16):

```vue
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
```

Then, inside the `<div class="terminal-window">`, right after the opening tag (before `<div class="titlebar">`), add the gear icon:

```html
<button class="settings-gear" @click="showSettings = true" aria-label="Abrir opciones">⚙</button>
```

And right before the closing `</template>` tag (after `</div>` that closes `.terminal-window`'s parent `.screen.start-screen`), add:

```html
<SettingsPanel v-if="showSettings" :show-game-controls="false" @close="showSettings = false" />
```

So the end of the template becomes:

```html
      </div>
    </div>

    <SettingsPanel v-if="showSettings" :show-game-controls="false" @close="showSettings = false" />
  </div>
</template>
```

Finally, add gear icon styling inside the `<style scoped>` block:

```css
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

.terminal-window { position: relative; }
```

(`.terminal-window` already exists in the stylesheet — add `position: relative;` to its existing rule rather than duplicating the selector.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/StartScreen.spec.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Run the full suite to check nothing else broke**

Run: `npx vitest run src/__tests__/App.spec.js`
Expected: PASS (`App.spec.js` only mounts the `start` screen, unaffected by internals)

- [ ] **Step 6: Commit**

```bash
git add src/components/StartScreen.vue src/__tests__/StartScreen.spec.js
git commit -m "feat: add settings panel access to StartScreen via gear icon and Tab key"
```

---

### Task 6: Integrate `SettingsPanel` into `GameBoard.vue` (pause, restart, exit)

**Files:**
- Modify: `src/components/GameBoard.vue`
- Test: `src/__tests__/GameBoard.spec.js`

**Interfaces:**
- Consumes: `SettingsPanel` from Task 4 with `show-game-controls="true"`; `useAudioSettings().effectiveSfxVolume` from Task 1.
- Produces: `GameBoard` now also emits `exit-to-menu` (no payload) in addition to the existing `end-game`.

This task mounts the real `GameBoard.vue`, which fetches `/data/cards.json` in `onMounted`. Tests must stub `global.fetch`.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/GameBoard.spec.js`:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GameBoard from '../components/GameBoard.vue'

const FAKE_DATA = {
  pool: [
    { id: 1, image: '/images/a.png', label: 'A' },
    { id: 2, image: '/images/b.png', label: 'B' },
  ],
  sounds: {
    correct: '/audio/correct.mp3',
    error: '/audio/error.mp3',
    cardflip: '/audio/cardflip.mp3',
    points: '/audio/points.mp3',
    timer: '/audio/timer.mp3',
    timeup: '/audio/timeup.mp3',
    winning: '/audio/winning.mp3',
  },
}

const LEVEL_CONFIG = { pairs: 2, totalTime: 60, previewDuration: 100, previewFlashInterval: 50, failLimit: null }

function pressKey(key) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }))
}

describe('GameBoard settings panel', () => {
  let wrapper

  beforeEach(() => {
    vi.useFakeTimers()
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(FAKE_DATA) })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  async function mountBoard() {
    wrapper = mount(GameBoard, { props: { levelConfig: LEVEL_CONFIG } })
    await vi.runOnlyPendingTimersAsync()
    await wrapper.vm.$nextTick()
    return wrapper
  }

  it('does not show the settings panel initially', async () => {
    await mountBoard()
    expect(wrapper.findComponent({ name: 'SettingsPanel' }).exists()).toBe(false)
  })

  it('opens the settings panel with the gear icon and pauses the timer while open', async () => {
    await mountBoard()
    await vi.advanceTimersByTimeAsync(LEVEL_CONFIG.previewDuration + 50) // let preview finish, timer starts
    await wrapper.find('.settings-gear').trigger('click')
    const timeBefore = wrapper.vm.timeLeft
    await vi.advanceTimersByTimeAsync(3000)
    expect(wrapper.vm.timeLeft).toBe(timeBefore)
  })

  it('resumes the timer after closing the settings panel', async () => {
    await mountBoard()
    await vi.advanceTimersByTimeAsync(LEVEL_CONFIG.previewDuration + 50)
    await wrapper.find('.settings-gear').trigger('click')
    await wrapper.findComponent({ name: 'SettingsPanel' }).vm.$emit('close')
    const timeBefore = wrapper.vm.timeLeft
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.vm.timeLeft).toBe(timeBefore - 1)
  })

  it('emits exit-to-menu without emitting end-game when go-to-menu fires', async () => {
    await mountBoard()
    await wrapper.find('.settings-gear').trigger('click')
    await wrapper.findComponent({ name: 'SettingsPanel' }).vm.$emit('go-to-menu')
    expect(wrapper.emitted('exit-to-menu')).toHaveLength(1)
    expect(wrapper.emitted('end-game')).toBeUndefined()
  })

  it('reshuffles the board and resets score/fails when restart-level fires', async () => {
    await mountBoard()
    await vi.advanceTimersByTimeAsync(LEVEL_CONFIG.previewDuration + 50)
    wrapper.vm.score = 30
    await wrapper.find('.settings-gear').trigger('click')
    await wrapper.findComponent({ name: 'SettingsPanel' }).vm.$emit('restart-level')
    expect(wrapper.vm.score).toBe(0)
    expect(wrapper.vm.matchedPairs).toBe(0)
    expect(wrapper.findComponent({ name: 'SettingsPanel' }).exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/GameBoard.spec.js`
Expected: FAIL — `.settings-gear` not found / `exit-to-menu` never emitted

- [ ] **Step 3: Update `GameBoard.vue`**

In `src/components/GameBoard.vue`, update the imports (line 1-4):

```js
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import MemoryCard from './MemoryCard.vue'
import AudioPlayer from './AudioPlayer.vue'
import SettingsPanel from './SettingsPanel.vue'
import { useAudioSettings } from '../composables/useAudioSettings.js'
```

Update emits (line 13):

```js
const emit = defineEmits(['end-game', 'exit-to-menu'])
```

After the `const FAIL_LIMIT = props.levelConfig.failLimit` line (line 27), add:

```js
const { effectiveSfxVolume } = useAudioSettings()
const showSettings = ref(false)
```

Update `onCardFlip`'s guard (line 141) from:

```js
  if (isPreviewing.value || isChecking.value) return
```

to:

```js
  if (isPreviewing.value || isChecking.value || showSettings.value) return
```

After the existing `onUnmounted` block (lines 114-117), add a new keydown handler, pause/resume watcher, and the restart/exit handlers:

```js
function onKeydown(e) {
  if (e.key === 'Tab') {
    e.preventDefault()
    showSettings.value = !showSettings.value
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

watch(showSettings, (open) => {
  if (open) {
    clearInterval(timerInterval)
    clearInterval(previewInterval)
    audioTimer.value?.stop()
  } else if (!isLoading.value && matchedPairs.value < totalPairs.value && timeLeft.value > 0) {
    if (isPreviewing.value) {
      startPreview()
    } else {
      startTimer()
      audioTimer.value?.play()
    }
  }
})

function restartCurrentLevel() {
  showSettings.value = false
  clearInterval(timerInterval)
  clearInterval(previewInterval)
  audioTimer.value?.stop()

  const selected = selectRandomPairs(lastLoadedPool, props.levelConfig.pairs)
  totalPairs.value = selected.length
  cards.value = shuffleCards(buildCardPairs(selected))
  matchedPairs.value = 0
  score.value = 0
  failCount.value = 0
  flippedCards.value = []
  isChecking.value = false
  timeLeft.value = props.levelConfig.totalTime

  startPreview()
}

function exitToMenu() {
  showSettings.value = false
  clearInterval(timerInterval)
  clearInterval(previewInterval)
  audioTimer.value?.stop()
  emit('exit-to-menu')
}
```

`restartCurrentLevel` needs the originally-fetched `pool` to pick a fresh random selection. Add a module-level-in-component variable to remember it: right after `const cards = ref([])` (line 16), add:

```js
let lastLoadedPool = []
```

Then in the existing `onMounted` (around line 97-112), inside the `try` block right after `const data = await res.json()`, add one line to capture it:

```js
    const data = await res.json()
    soundPaths.value = data.sounds
    lastLoadedPool = data.pool
    const selected = selectRandomPairs(data.pool, props.levelConfig.pairs)
```

Update the 7 effect `AudioPlayer` tags (lines 250-256) to bind `:volume="effectiveSfxVolume"`:

```html
    <AudioPlayer ref="audioCorrect" :src="soundPaths.correct" :volume="effectiveSfxVolume" />
    <AudioPlayer ref="audioError" :src="soundPaths.error" :volume="effectiveSfxVolume" />
    <AudioPlayer ref="audioCardflip" :src="soundPaths.cardflip" :volume="effectiveSfxVolume" />
    <AudioPlayer ref="audioPoints" :src="soundPaths.points" :volume="effectiveSfxVolume" />
    <AudioPlayer ref="audioTimer" :src="soundPaths.timer" :loop="true" :volume="effectiveSfxVolume" />
    <AudioPlayer ref="audioTimeup" :src="soundPaths.timeup" :volume="effectiveSfxVolume" />
    <AudioPlayer ref="audioWinning" :src="soundPaths.winning" :volume="effectiveSfxVolume" />
```

Add the gear icon inside `<div class="game-board">`, right before the `<header>` HUD block:

```html
    <button class="settings-gear" @click="showSettings = true" aria-label="Abrir opciones">⚙</button>
```

Add the panel right before the closing `</div>` of `.game-board` (after the last `<AudioPlayer ref="audioWinning" ...>` line):

```html
    <SettingsPanel
      v-if="showSettings"
      :show-game-controls="true"
      @close="showSettings = false"
      @restart-level="restartCurrentLevel"
      @go-to-menu="exitToMenu"
    />
```

Add gear icon styling to the `<style scoped>` block (the `.game-board` rule already has `position` unset — add `position: relative;` to it, and add a new rule):

```css
.game-board { position: relative; }

.settings-gear {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 2;
}

.settings-gear:hover { color: var(--color-primary); }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/GameBoard.spec.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Run the full suite to check nothing else broke**

Run: `npx vitest run`
Expected: PASS (all test files: `App.spec.js`, `useAudioSettings.spec.js`, `useScoreHistory.spec.js`, `AudioPlayer.spec.js`, `SettingsPanel.spec.js`, `StartScreen.spec.js`, `GameBoard.spec.js`)

- [ ] **Step 6: Commit**

```bash
git add src/components/GameBoard.vue src/__tests__/GameBoard.spec.js
git commit -m "feat: add settings panel to GameBoard with pause, restart and exit-to-menu"
```

---

### Task 7: Wire music volume, score recording and exit-to-menu into `App.vue`

**Files:**
- Modify: `src/App.vue`
- Test: `src/__tests__/App.spec.js` (extend the existing file)

**Interfaces:**
- Consumes: `useAudioSettings().effectiveMusicVolume` (Task 1), `useScoreHistory().recordScore` (Task 2), `GameBoard`'s `exit-to-menu` event (Task 6).
- Produces: no new public interface — internal wiring only.

- [ ] **Step 1: Write the failing test**

Replace `src/__tests__/App.spec.js` entirely with:

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { useScoreHistory } from '../composables/useScoreHistory.js'

describe('App', () => {
  afterEach(() => {
    useScoreHistory().history.value = []
  })

  it('mounts renders properly', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Tech Memory')
  })

  it('returns to the start screen without recording a score when GameBoard emits exit-to-menu', async () => {
    const wrapper = mount(App)
    wrapper.vm.currentScreen = 'game'
    await wrapper.vm.$nextTick()
    const gameBoard = wrapper.findComponent({ name: 'GameBoard' })
    await gameBoard.vm.$emit('exit-to-menu')
    expect(wrapper.vm.currentScreen).toBe('start')
    expect(useScoreHistory().history.value).toHaveLength(0)
  })

  it('records a score in useScoreHistory when GameBoard emits end-game', async () => {
    const wrapper = mount(App)
    wrapper.vm.currentScreen = 'game'
    await wrapper.vm.$nextTick()
    const gameBoard = wrapper.findComponent({ name: 'GameBoard' })
    await gameBoard.vm.$emit('end-game', 40, 30, true, 'win')
    expect(useScoreHistory().history.value).toHaveLength(1)
    expect(useScoreHistory().history.value[0]).toMatchObject({ score: 40, won: true })
  })
})
```

The original test asserted `wrapper.text()).toContain('You did it!')`, which does not match any current copy in `StartScreen.vue` (its actual title is "Tech Memory" per `src/components/StartScreen.vue:35`) — this was already a stale assertion before this feature; the rewrite fixes it as part of touching this file.

Accessing `wrapper.vm.currentScreen` and mutating it directly requires `App.vue`'s `<script setup>` refs to be exposed to the test via Vue's automatic dev-mode exposure (Vue Test Utils can read/write top-level `<script setup>` bindings directly in test mode) — this already works for the existing codebase's patterns (no `defineExpose` needed in `App.vue` for this).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/App.spec.js`
Expected: FAIL — `exit-to-menu` handler doesn't exist yet, `recordScore` never called

- [ ] **Step 3: Update `App.vue`**

In `src/App.vue`, update the imports (lines 1-7):

```js
<script setup>
import { computed, ref } from 'vue'
import StartScreen from './components/StartScreen.vue'
import GameBoard from './components/GameBoard.vue'
import ResultScreen from './components/ResultScreen.vue'
import AudioPlayer from './components/AudioPlayer.vue'
import { LEVELS } from './levels.js'
import { useAudioSettings } from './composables/useAudioSettings.js'
import { useScoreHistory } from './composables/useScoreHistory.js'
```

After the `const musicLose = ref(null)` line (line 37), add:

```js
const { effectiveMusicVolume } = useAudioSettings()
const { recordScore } = useScoreHistory()
```

Inside `onEndGame` (lines 47-64), right after `finalLevelIndex.value = levelIndex.value` (line 52), add:

```js
  recordScore({ score, levelIndex: levelIndex.value, won })
```

After the existing `onRestart` function (lines 73-80), add:

```js
function onExitToMenu() {
  musicGame.value?.stop()
  currentScreen.value = 'start'
}
```

In the template, update the `<GameBoard>` tag (lines 93-97) to listen for the new event:

```html
    <GameBoard
      v-else-if="currentScreen === 'game'"
      :level-config="currentLevelConfig"
      @end-game="onEndGame"
      @exit-to-menu="onExitToMenu"
    />
```

Update the three music `<AudioPlayer>` tags (lines 112-114) to pass the effective volume:

```html
    <AudioPlayer ref="musicGame" src="/music/during_game.mp3" :loop="true" :volume="effectiveMusicVolume" />
    <AudioPlayer ref="musicWin"  src="/music/after_winning.mp3" :loop="true" :volume="effectiveMusicVolume" />
    <AudioPlayer ref="musicLose" src="/music/after_losing.mp3" :loop="true" :volume="effectiveMusicVolume" />
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/App.spec.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Run the full suite**

Run: `npx vitest run`
Expected: PASS (every test file in the project)

- [ ] **Step 6: Commit**

```bash
git add src/App.vue src/__tests__/App.spec.js
git commit -m "feat: wire music volume, score history and exit-to-menu in App.vue"
```

---

### Task 8: Manual verification in the browser

**Files:** none (manual QA pass, no code changes expected unless a bug is found)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify StartScreen settings panel**

Open the app. Click the ⚙ icon — panel opens showing Música/Efectos/Master sliders (no score history yet, no restart/menu buttons). Press `Tab` — panel closes. Press `Tab` again — panel reopens. Click the backdrop outside the panel — it closes. Click ✕ — it closes.

- [ ] **Step 3: Verify keyboard navigation and editing in the panel**

With the panel open: press `↓` twice to move focus to "Master" (no value changes while moving). Press `Enter` — the item gets a distinct highlight (edit mode). Press `→` three times — value goes 100 → 90 → ... wait, it's already 100, so pressing `→` should have no visible effect (clamped); press `←` three times instead and confirm it drops to 70 and the music actually gets quieter live if currently playing. Press `Enter` again to exit edit mode, confirm `←`/`→` no longer change the value. Repeat using `W`/`S`/`A`/`D` and `Space` instead of arrows/Enter — same behavior.

- [ ] **Step 4: Verify mouse controls**

Drag the "Efectos" slider with the mouse — value updates immediately, and the next card-flip sound reflects the new volume. Click the `−`/`+` buttons next to "Música" — value steps by 10 each click.

- [ ] **Step 5: Verify in-level panel**

Start a game. Open the panel with ⚙ or `Tab` — confirm the countdown timer visibly stops (the displayed time freezes) and the timer tick sound stops. Confirm clicking a card while the panel is open does nothing. Close the panel — confirm the timer resumes from where it was frozen, not reset.

- [ ] **Step 6: Verify "Reiniciar nivel"**

Flip a couple of cards to get a non-zero score, open the panel, click/Enter "Reiniciar nivel". Confirm: the panel closes, the score resets to 0, the board reshuffles, and the card-preview flashes play again from the start.

- [ ] **Step 7: Verify "Volver al menú principal"**

Mid-level, open the panel, trigger "Volver al menú principal". Confirm: you land back on `StartScreen` directly (no `ResultScreen` shown), and the "continue" button on `StartScreen` still offers whatever level was saved before this attempt (not the level you just abandoned, unless they're the same).

- [ ] **Step 8: Verify score history accumulates**

Play and finish 2-3 levels (mix of wins/losses). Open the settings panel (from `StartScreen` or in-level) and confirm the "mejores puntuaciones" list shows entries sorted by score descending. Refresh the page and confirm the list is now empty (session-only), while the volume sliders kept their last values (persisted).

- [ ] **Step 9: Report results**

If any check in Steps 2-8 fails, fix the underlying code (not the test) and re-run the relevant automated test file, then redo the manual check. If everything passes, the feature is done.
