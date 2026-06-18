import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { useScoreHistory } from '../composables/useScoreHistory.js'

describe('App', () => {
  beforeEach(() => {
    // jsdom does not implement HTMLMediaElement playback; AudioPlayer calls
    // .play()/.pause()/.load() on the underlying <audio> element, so stub them
    // to no-ops (play() must return a thenable, matching the real API).
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
    window.HTMLMediaElement.prototype.pause = vi.fn()
    window.HTMLMediaElement.prototype.load = vi.fn()
  })

  afterEach(() => {
    useScoreHistory().history.value = []
    vi.restoreAllMocks()
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
