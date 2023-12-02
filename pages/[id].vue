<script setup lang="ts">
import Footer from '~/components/Footer.vue'
</script>

<template>
  <header class="h-20 px-6 z-10 sticky top-0 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
    <div class="flex justify-between items-center h-full max-w-[680px] mx-auto">
      <NuxtLink class="flex items-center w-[256px]" to="/" title="SearchEmoji">
        <img src="/logo.png" class="w-11 h-11 mr-3" alt="SearchEmoji">
        <Logo class="text-2xl color-title mt-0.5" />
        <h1 class="w-0 overflow-hidden">Search for Emoji, Click to Copy</h1>
      </NuxtLink>
      <ToolBar />
    </div>
  </header>
  <Detail />
  <Footer />
</template>

<style scoped></style>
