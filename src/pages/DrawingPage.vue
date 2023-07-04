<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DrawingEditor from '@/components/Editor/DrawingEditor'
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
    <div my-4 flex-1 border border-blue-500 border-solid>
      <div id="canvas" ref="canvas" h-full />
    </div>
  </div>
</template>
