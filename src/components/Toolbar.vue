<script setup lang="ts">
import { inject } from 'vue'
import Editor from '@/core'
import FancyButton from '@/components/Button.vue'

const editor = inject<Editor>('editor')
</script>

<template>
  <div toolbar border-x-1 border-x-slate-200 border-x-solid>
    <div flex items-center space-x-1>
      <FancyButton icon="reply" @click="editor?.undo()" />
      <FancyButton icon="share" @click="editor?.redo()" />
    </div>
    <div flex items-center space-x-1>
      <FancyButton icon="arrow-pointer" />
      <FancyButton icon="square" @click="editor?.rectangle()" />
      <FancyButton icon="circle" @click="editor?.oval()" />
      <FancyButton icon="play" :rotation="270" @click="editor?.triangle()" />
      <!-- <FancyButton icon="draw-polygon" @click="editor?.oval()" /> -->
    </div>
  </div>
</template>
