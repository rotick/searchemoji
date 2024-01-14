<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
defineProps({
  top: {
    type: Number,
    default: 32
  },
  left: {
    type: Number,
    default: undefined
  },
  right: {
    type: Number,
    default: undefined
  }
})
const show = ref(false)
const wrap = ref()
onClickOutside(wrap, () => {
  show.value = false
})
function toggleShow () {
  show.value = !show.value
}
function closeDropDown () {
  show.value = false
}
</script>

<template>
  <div ref="wrap" class="relative" @click="toggleShow">
    <slot :active="show" />
    <div
      v-show="show"
      class="absolute"
      :style="{ top: `${top}px`, left: left !== undefined ? `${left}px` : undefined, right: right !== undefined ? `${right}px` : undefined }"
      @click.stop
    >
      <slot :close="closeDropDown" name="content" />
    </div>
  </div>
</template>

<style scoped></style>
