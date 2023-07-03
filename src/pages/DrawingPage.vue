<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DrawingEditor from '@/components/Editor/DrawingEditor'

const canvas = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  const canvasEl = canvas.value
  if (!canvasEl) return
  // get canvas size
  const { clientWidth: width, clientHeight: height } = canvasEl
  const editor = new DrawingEditor('canvas', width, height)
})
</script>

<template>
  <div class="fill" flex flex-col>
    <div>Tools! under construction</div>
    <div my-4 flex-1 border border-blue-500 border-solid>
      <div id="canvas" ref="canvas" h-full />
    </div>
  </div>
</template>
