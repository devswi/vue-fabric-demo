<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

interface Props {
  icon?: string
  rotation?: 90 | 180 | 270 | undefined
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 34,
  icon: undefined,
  rotation: undefined,
})

const cssVars = computed(() => {
  return {
    '--size': `${props.size}px`,
    width: `${props.size}px`,
    height: `${props.size}px`,
  }
})

defineEmits(['click'])
</script>

<template>
  <button border-none bg-transparent outline-none :style="cssVars" @click="$emit('click')">
    <FontAwesomeIcon v-if="props.icon" :icon="['fa', props.icon]" :rotation="props.rotation" />
    <span>
      <slot />
    </span>
  </button>
</template>
