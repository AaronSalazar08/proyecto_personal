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
