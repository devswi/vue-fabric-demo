<script setup lang="ts">
import { useDark } from '@vueuse/core'

useDark()
</script>

<template>
  <section class="common-section">
    <header class="common-header">
      <h1 mr-8 font-bold>Fabric</h1>
      <nav flex space-x-4>
        <RouterLink link to="/">Home</RouterLink>
        <RouterLink link to="/drawer">Drawer</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </section>
</template>
