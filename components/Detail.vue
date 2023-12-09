<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
const props = defineProps({
  emoji: {
    type: [Object],
    default: null
  }
})
const route = useRoute()
const { locale, t } = useI18n()
const id = route.params.id
const { data, error, execute } = useFetch(`/api/emoji/${id}`, { query: { locale: locale.value }, immediate: process.server })
if (props.emoji) {
  data.value = props.emoji
} else {
  execute()
}
const title = computed(() => t('seo.detailTitle', { emoji: data.value.e, name: data.value.t }))
const description = computed(() =>
  t('seo.detailDescription', {
    emoji: data.value.e,
    name: data.value.t,
    version: data.value.v,
    group: data.value.g,
    code: `U+${data.value.c.replace(/ /g, ' U+')}`,
    oName: data.value.n
  })
)
useHead({
  title,
  meta: [{ name: 'description', content: description }]
})
const source = computed(() => data.value.e)
const { copy, copied } = useClipboard({ source })
function handleCopy (e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
    const selection = document.getSelection()
    if (!selection?.toString()) {
      copy(source.value)
    }
  }
}
let isMac = false
onMounted(() => {
  document.addEventListener('keydown', handleCopy)
  isMac = window.navigator.userAgent.toLowerCase().includes('macintosh')
})
onUnmounted(() => {
  document.removeEventListener('keydown', handleCopy)
})
const platform = [
  {
    name: 'Apple',
    imgPath: 'apple'
  },
  {
    name: 'Google',
    imgPath: 'google'
  },
  {
    name: 'Facebook',
    imgPath: 'facebook'
  },
  {
    name: 'X / Twitter',
    imgPath: 'x'
  },
  {
    name: 'Microsoft',
    imgPath: 'microsoft'
  },
  {
    name: 'Samsung',
    imgPath: 'samsung'
  },
  {
    name: 'Whatsapp',
    imgPath: 'whatsapp'
  }
]
</script>

<template>
  <div class="max-w-[680px] mx-auto my-8 px-4">
    <div v-if="error" class="text-rose-500 card p-6 mb-6 rounded-2xl">
      {{ error }}
      <button class="border border-rose-500 px-2 rounded-full" onclick="window.location.reload()">{{ $t('refresh') }}</button>
    </div>
    <main v-if="data">
      <div class="flex justify-center items-center mx-auto">
        <h2 class="text-[128px]">{{ data.e }}</h2>
      </div>
      <div>
        <h3 class="font-bold text-2xl color-title text-center">{{ data.t }}</h3>
        <button
          class="px-6 h-12 rounded-2xl bg-rose-500 text-white flex items-center mx-auto my-6 md:tooltip"
          :data-tip="`${isMac ? '⌘' : 'Ctrl'} + C`"
          @click="copy(source)"
        >
          <i
            class="text-xl mr-2"
            :class="copied ? 'icon-[material-symbols--check-circle] text-success' : 'icon-[material-symbols--content-copy-outline]'"
            aria-hidden="true"
            role="img"
          />
          {{ $t('copyBtn') }}
        </button>
        <div class="flex justify-between border-t border-b border-main py-2">
          <span class="shrink-0 mr-4">{{ $t('unicodeName') }}</span> <span>{{ data.n }}</span>
        </div>
        <div class="flex justify-between border-b border-main py-2">
          <span class="shrink-0 mr-4 my-0.5">{{ $t('searchKeyword') }}</span>
          <div class="flex items-center flex-wrap justify-end">
            <span v-for="k in data.k[locale]" :key="k" class="card color-action rounded-xl px-2 ml-1 my-0.5">{{ k }}</span>
          </div>
        </div>
        <div class="flex justify-between border-b border-main py-2">
          <span class="shrink-0 mr-4">{{ $t('version') }}</span> <span>{{ data.v }}</span>
        </div>
        <div class="flex justify-between border-b border-main py-2">
          <span class="shrink-0 mr-4">{{ $t('code') }}</span> <span>U+{{ data.c.replace(/ /g, ' U+') }}</span>
        </div>
        <div class="flex justify-between border-b border-main py-2">
          <span class="shrink-0 mr-4">{{ $t('inGroup') }}</span> <span class="text-right">{{ data.g }} > {{ data.s }}</span>
        </div>
      </div>
      <div class="mt-6">
        <h4 class="font-bold color-action">{{ $t('otherPlatform') }}</h4>
        <div
          class="mt-6 flex justify-between md:block bg-white/90 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 p-4 md:p-0 md:bg-transparent md:dark:bg-transparent md:border-none rounded-2xl"
        >
          <div class="md:flex md:border-t md:border-b md:border-main md:py-2">
            <div v-for="p in platform" :key="p.imgPath" class="md:flex-1 md:text-center h-[72px] leading-[72px] md:h-auto md:leading-normal mb-2 md:mb-0">
              {{ p.name }}
            </div>
          </div>
          <div class="md:flex md:mt-2">
            <div v-for="p in platform" :key="p.imgPath" class="mb-2 md:flex-1 md:flex md:justify-center md:tooltip" :data-tip="$t('imgCopyTip')">
              <img :src="`/emojis/${p.imgPath}/${data.c}.png`" width="72" height="72" :alt="$t('platformImg', { name: data.n, platform: p.name })">
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped></style>
