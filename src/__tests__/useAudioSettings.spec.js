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
