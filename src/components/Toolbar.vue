<script setup lang="ts">
import { inject } from 'vue'
import Editor from '@/core'

const editor = inject<Editor>('editor')
</script>

<template>
  <div toolbar border-x-1 border-x-slate-200 border-x-solid>
    <div flex items-center space-x-2>
      <div @click="editor?.undo">undo</div>
      <div @click="editor?.redo">redo</div>
    </div>
    <div flex items-center space-x-2>
      <div @click="editor?.toggleDragMode">select</div>
      <div @click="editor?.rectangle">rectangle</div>
      <div>oval</div>
      <div>triangle</div>
      <div>ploygin</div>
    </div>
  </div>
</template>
