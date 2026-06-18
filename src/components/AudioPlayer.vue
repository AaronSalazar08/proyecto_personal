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
// flush: 'post' garantiza que Vue ya escribió el nuevo src en el DOM
// antes de llamar .load(). Con 'pre' (default) el src aún es "" cuando
// el watch dispara, y el audio no carga correctamente en replays.
watch(
  () => props.src,
  (newSrc) => {
    if (audioRef.value && newSrc) {
      audioRef.value.load()
    }
  },
  { flush: 'post' },
)

watch(
  () => props.volume,
  (newVolume) => {
    if (audioRef.value) audioRef.value.volume = newVolume
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
