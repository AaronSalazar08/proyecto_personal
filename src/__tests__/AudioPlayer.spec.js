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
