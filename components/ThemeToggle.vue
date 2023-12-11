<script setup lang="ts">
import { useColorMode } from '#imports'
const colorMode = useColorMode()
function toggleTheme () {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="ml-4 text-2xl cursor-pointer items-center relative group flex items-center" @click="toggleTheme">
    <i v-show="colorMode.value === 'system'" class="icon-[solar--display-bold]" role="img" aria-hidden="true" />
    <i v-show="colorMode.value === 'light'" class="icon-[solar--sun-bold]" role="img" aria-hidden="true" />
    <i v-show="colorMode.value === 'dark'" class="icon-[solar--moon-stars-bold]" role="img" aria-hidden="true" />
    <div role="tooltip" class="absolute top-7 right-0 whitespace-nowrap card rounded-lg p-2 text-sm color-action hidden md:group-hover:block">
      {{ colorMode.value === 'light' ? $t('darkTip') : $t('lightTip') }}
    </div>
  </div>
</template>

<style scoped></style>
