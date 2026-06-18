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
