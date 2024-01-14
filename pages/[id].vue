<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { locale } = useI18n()
const localePath = useLocalePath()
const rtl = computed(() => ['ar', 'he'].includes(locale.value))
const keyword = ref((route.query.q as string) || '')
const isMobile = ref(false)
const isMac = ref(false)
onMounted(() => {
  isMac.value = window.navigator.userAgent.toLowerCase().includes('macintosh')
  isMobile.value = window.innerWidth <= 768
})
function search () {
  router.push({ path: localePath('/'), query: { q: keyword.value || undefined } })
}
</script>

<template>
  <header class="h-20 px-6 z-10 sticky top-0 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
    <div class="flex justify-between items-center h-full max-w-[680px] mx-auto">
      <NuxtLink class="flex items-center w-[256px]" to="/" title="SearchEmoji">
        <img src="/logo.png" class="w-11 h-11 mr-3" alt="SearchEmoji">
        <Logo class="text-2xl color-title mt-0.5" />
        <h1 class="w-0 h-0 overflow-hidden">Search for Emoji, Click to Copy</h1>
      </NuxtLink>
      <ToolBar />
    </div>
  </header>
  <div class="items-center card rounded-2xl max-w-[680px] mt-6 mx-4 md:mx-auto h-9 md:h-10 flex flex-grow">
    <input
      ref="searchInputRef"
      v-model="keyword"
      type="search"
      enterkeyhint="search"
      class="bg-transparent flex-grow outline-none px-3 color-title min-w-0"
      :class="rtl ? 'text-right' : ''"
      :placeholder="`${$t('placeholder')}${isMobile ? '' : '(' + (isMac ? '⌘' : 'Ctrl') + '+ K)'}`"
      @keyup.enter="search"
    >
    <button class="bg-zinc-200/80 dark:bg-zinc-700/80 h-full w-12 rounded-r-2xl flex justify-center items-center" aria-label="Search" @click="search">
      <i class="icon-[solar--magnifer-linear] text-lg md:text-2xl color-secondary shrink-0" role="img" aria-hidden="true" />
    </button>
  </div>
  <Detail />
  <Footer />
</template>

<style scoped></style>
