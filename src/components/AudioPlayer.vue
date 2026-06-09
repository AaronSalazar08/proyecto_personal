<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  volume: {
    type: Number,
    default: 1,
  },
  loop: {
    type: Boolean,
    default: false,
  },
})

const audioRef = ref(null)

// El elemento <audio> del navegador no recarga automáticamente al cambiar el src.
// Es necesario llamar .load() explícitamente para que el nuevo archivo esté listo.
watch(
  () => props.src,
  (newSrc) => {
    if (audioRef.value && newSrc) {
      audioRef.value.load()
    }
  },
)

function play() {
  if (!audioRef.value || !props.src) return
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
  <audio ref="audioRef" :src="props.src" :loop="props.loop" preload="auto" />
</template>
