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
    // jsdom does not implement HTMLMediaElement playback; AudioPlayer calls
    // .play()/.pause()/.load() on the underlying <audio> element, so stub them
    // to no-ops (play() must return a thenable, matching the real API).
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
    window.HTMLMediaElement.prototype.pause = vi.fn()
    window.HTMLMediaElement.prototype.load = vi.fn()
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
