<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { DrawingEditor } from '@/components/Editor'
import IconUndo from '@/components/icons/IconUndo.vue'
import IconRedo from '@/components/icons/IconRedo.vue'

const canvas = ref<HTMLDivElement | null>(null)
const editor = ref<DrawingEditor | null>(null)

onMounted(async () => {
  const canvasEl = canvas.value
  if (!canvasEl) return
  // get canvas size
  const { clientWidth: width, clientHeight: height } = canvasEl
  editor.value = new DrawingEditor('canvas', width, height)
  editor.value.setBackgroundImage(
    'https://plus.unsplash.com/premium_photo-1670895802275-ed748ced4309?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
  )
})
</script>

<template>
  <div class="fill" flex flex-col>
    <div flex items-center>
      <div>
        <ElButton text @click="editor?.undo()">
          <IconUndo />
        </ElButton>
        <ElButton text @click="editor?.redo()">
          <IconRedo />
        </ElButton>
      </div>
    </div>
    <div flex-1>
      <div id="canvas" ref="canvas" h-full />
    </div>
  </div>
</template>
