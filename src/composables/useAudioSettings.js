import { ref, computed } from 'vue'

const STORAGE_KEYS = {
  music: 'memoryGame.musicVolume',
  sfx: 'memoryGame.sfxVolume',
  master: 'memoryGame.masterVolume',
}

function readStoredVolume(key) {
  const item = localStorage.getItem(key)
  if (item === null) return 100
  const saved = Number(item)
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
