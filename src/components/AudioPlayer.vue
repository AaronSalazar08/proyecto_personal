<script setup>
import { ref } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  volume: {
    type: Number,
    default: 1,
  },
})

const audioRef = ref(null)

function play() {
  if (!audioRef.value) return
  audioRef.value.volume = props.volume
  audioRef.value.currentTime = 0
  audioRef.value.play().catch(() => {})
}

function stop() {
  if (!audioRef.value) return
  audioRef.value.pause()
  audioRef.value.currentTime = 0
}

defineExpose({ play, stop })
</script>

<template>
  <audio ref="audioRef" :src="props.src" preload="auto" />
</template>
