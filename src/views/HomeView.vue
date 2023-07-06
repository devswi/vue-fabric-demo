<script setup lang="ts">
import { useDark } from '@vueuse/core'

useDark()
</script>

<template>
  <section>
    <main>
      <RouterView />
    </main>
  </section>
</template>
