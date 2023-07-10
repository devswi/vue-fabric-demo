<script setup lang="ts">
import { onMounted, ref, provide } from 'vue'
import Editor from '@/core'
import Toolbar from '@/components/Toolbar.vue'

const editor = ref<Editor>()

onMounted(async () => {
  // get canvas size
  editor.value = new Editor('canvas')
  // 创建工作区
  // editor.value.createWorkspace({
  //   width: 900,
  //   height: 1200,
  // })
  // editor.value.createWorkspace(
  //   'https://plus.unsplash.com/premium_photo-1670895802275-ed748ced4309?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
  // )
  editor.value.createWorkspace(
    'https://images.unsplash.com/photo-1682686581776-b6ebee7c150e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3571&q=80',
  )
})

provide('editor', editor)
</script>

<template>
  <div class="fill" flex>
    <div sidebar>Preview</div>
    <div flex flex-auto flex-col>
      <Toolbar />
      <div id="workspace" workspace>
        <div relative>
          <div inner-shadow />
          <div id="canvas" />
        </div>
      </div>
    </div>
    <div sidebar>Layer</div>
  </div>
</template>
