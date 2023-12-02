<script setup lang="ts">
import { Document } from '@akryum/flexsearch-es'
import { qualityMap } from '~/utils'
import { useThrottleFn, watchDebounced, useStorageAsync, useClipboard } from '@vueuse/core'
import Footer from '~/components/Footer.vue'

const route = useRoute()
const router = useRouter()
const { locale, locales } = useI18n()
const flexSearch = new Document({
  document: {
    id: 'c',
    tag: 'g',
    index: [
      {
        field: 'n',
        tokenize: 'forward',
        resolution: 9
      },
      {
        field: `k:${locale.value}`,
        tokenize: 'forward',
        resolution: 8
      }
    ],
    store: true
  }
})
const { data, error, pending } = useFetch('/api/emojis', { query: { locale: locale.value } })
const keyword = ref((route.query.q as string) || '')
const searchResult = ref<any>([])
const searching = ref(false)
watch(
  data,
  val => {
    if (val?.length) {
      val.forEach((item: any) => {
        flexSearch.add(item)
      })
      nextTick(() => {
        if (keyword.value) {
          search()
        }
      })
    }
  },
  {
    immediate: true
  }
)
function search () {
  const result = flexSearch.search(keyword.value, { limit: 10000, enrich: true })
  searchResult.value = result
    .map((item: any) => {
      return item.result.map((r: any) => r.doc)
    })
    .flat()
  searching.value = false
  router.replace({ path: route.path, query: { q: keyword.value || undefined } })
}
function searchInput () {
  searching.value = true
}
watchDebounced(
  keyword,
  () => {
    search()
  },
  { debounce: 300, maxWait: 1000 }
)
const loading = computed(() => searching.value || pending.value)

const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()
const currentLocale = computed(() => {
  return locales.value.find((i: any) => i.code === locale.value)
})

const groupBySubGroup = useStorageAsync('groupBySubGroup', false)
const qualityOptions = Object.keys(qualityMap)
const quality = useStorageAsync('quality', ['fully-qualified'])
const transformQuality = computed(() => {
  return quality.value.map(q => qualityMap[q])
})
const skinToneOptions = [
  {
    name: 'light',
    emoji: '🏻'
  },
  {
    name: 'medium-light',
    emoji: '🏼'
  },
  {
    name: 'medium',
    emoji: '🏽'
  },
  {
    name: 'medium-dark',
    emoji: '🏾'
  },
  {
    name: 'dark',
    emoji: '🏿'
  }
]
const skinTone = useStorageAsync<string[]>('skinTone', [])
const fullSkinTone = computed(() => skinTone.value.map(st => `${st} skin tone`))
function toggleSkinTone (name: string) {
  const index = skinTone.value.findIndex(n => n === name)
  if (index > -1) {
    skinTone.value.splice(index, 1)
  } else {
    skinTone.value.push(name)
  }
}

const emojiCount = ref(0)
// const groupData = ref<any[]>([])
const groupData = computed(() => {
  // watch([searchResult, data, transformQuality, fullSkinTone, groupBySubGroup], () => {
  const list = keyword.value ? searchResult.value : data.value || []
  const filtered = list.filter(
    (li: any) =>
      transformQuality.value.includes(li.q) &&
      (!li.n.includes('skin tone') || (li.n.includes('skin tone') && (fullSkinTone.value.find(fst => li.n.includes(' ' + fst)) || li.s === 'skin-tone')))
  )
  emojiCount.value = filtered.length

  const group: any[] = []
  filtered.forEach((d: any) => {
    const inGroup = group.find(g => g.name === d.g)
    if (!inGroup) {
      group.push({
        name: d.g,
        hash: encodeURIComponent(d.g),
        icon: d.e,
        children: [
          {
            name: d.s,
            data: [d]
          }
        ]
      })
    } else {
      if (groupBySubGroup.value) {
        const inSubGroup = inGroup.children.find((g: any) => g.name === d.s)
        if (!inSubGroup) {
          inGroup.children.push({
            name: d.s,
            data: [d]
          })
        } else {
          inSubGroup.data.push(d)
        }
      } else {
        inGroup.children[0].data.push(d)
      }
    }
  })
  return group
})
const emojiSize = useStorageAsync('emojiSize', 24)
const renderEmojiSize = ref(24)
watchDebounced(
  emojiSize,
  () => {
    renderEmojiSize.value = emojiSize.value
  },
  { debounce: 400 }
)
const activeNav = ref('')
function navClick (name: string) {
  if (name === groupData.value[0]?.name) {
    router.replace({ path: route.path, query: route.query })
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
}
const doms = ref<HTMLElement[]>([])
const y = ref(0)
const handleScroll = useThrottleFn(() => {
  y.value = document.documentElement.scrollTop
  doms.value.forEach(tag => {
    const top = tag.getBoundingClientRect().top
    if (top <= 106) {
      // 10px fault tolerance
      activeNav.value = decodeURIComponent(tag.id)
    }
  })
}, 20)
let stopWatchGroupDataChange: any
onMounted(() => {
  activeNav.value = decodeURIComponent(route.hash)?.replace('#', '') || groupData.value[0]?.name || ''
  stopWatchGroupDataChange = watch(groupData, () => {
    activeNav.value = groupData.value[0]?.name || ''
  })
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  stopWatchGroupDataChange?.()
  window.removeEventListener('scroll', handleScroll)
})
function backTop () {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
const clickTo = useStorageAsync('clickTo', 'detail')
const clickToOptions = ['detail', 'copy']
const source = ref('')
const { copy, copied } = useClipboard({ source })
function copyEmoji (emoji: string) {
  source.value = emoji
  copy(source.value)
}

const showDetail = ref(false)
const emoji = ref()
onBeforeRouteLeave(to => {
  if ((to.name as string).startsWith('id__')) {
    const emojiId = to.params.id as string
    emoji.value = data.value.find((d: any) => d.c === emojiId)
    showDetail.value = true
    window.history.pushState('detailPage', '', to.path)
    return false
  } else {
    return true
  }
})
onMounted(() => {
  window.addEventListener('popstate', event => {
    if (event.state !== 'detailPage') {
      emoji.value = null
      showDetail.value = false
    }
  })
})
function closeDetail () {
  showDetail.value = false
  setTimeout(() => {
    router.back()
  }, 50)
}
function modalClick (ev: any) {
  if (ev.composedPath().find((p: any) => p.className?.includes?.('inner'))) return
  closeDetail()
}
</script>

<template>
  <header
    class="flex justify-between items-center h-20 px-6 z-10 sticky top-0 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80"
  >
    <div class="flex items-center">
      <NuxtLink class="flex items-center w-[256px]" to="/" title="SearchEmoji">
        <img src="/logo.png" class="w-11 h-11 mr-3" alt="SearchEmoji">
        <Logo class="text-2xl color-title mt-0.5" />
        <h1 class="w-0 overflow-hidden">Search for Emoji, Click to Copy</h1>
      </NuxtLink>
      <div class="flex items-center card rounded-2xl w-[560px] h-10">
        <div class="flex items-center pl-4 relative border-r border-zinc-200/80 dark:border-zinc-700/80 group cursor-default">
          <i class="icon-[ph--translate-bold] text-xl mr-1 color-action" role="img" aria-hidden="true" />
          <span class="color-action">{{ currentLocale?.name }}</span>
          <i class="icon-[material-symbols--arrow-drop-down-rounded] text-2xl color-action" role="img" aria-hidden="true" />
          <div class="absolute top-6 left-0 card w-[220px] p-2 rounded-2xl hidden group-hover:flex flex-wrap">
            <NuxtLink
              v-for="l in locales"
              :key="l.code"
              :to="switchLocalePath(l.code)"
              class="flex items-center h-8 px-2 rounded-xl w-[101px]"
              :class="l.code === locale ? 'color-disable cursor-default' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:color-action'"
            >
              {{ l.name }}
            </NuxtLink>
          </div>
        </div>
        <input
          v-model="keyword"
          type="search"
          enterkeyhint="search"
          class="bg-transparent flex-grow outline-none px-2 color-title"
          :placeholder="`${$t('placeholder')}...`"
          @input="searchInput"
          @keyup.enter="search"
        >
        <button class="bg-zinc-200/80 dark:bg-zinc-700/80 h-full w-12 rounded-r-2xl flex justify-center items-center" @click="search">
          <i class="icon-[solar--magnifer-linear] text-lg md:text-2xl color-secondary shrink-0" role="img" aria-hidden="true" />
        </button>
      </div>
      <div class="flex items-center ml-6">
        {{ $t('clickTo') }}
        <div class="flex items-center ml-2 color-action group relative cursor-default">
          {{ $t(clickTo) }}
          <i class="icon-[material-symbols--arrow-drop-down-rounded] text-2xl" role="img" aria-hidden="true" />
          <ul class="absolute top-6 left-0 card px-4 py-2 rounded-2xl hidden group-hover:block">
            <li
              v-for="opt in clickToOptions"
              :key="opt"
              class="py-2 whitespace-nowrap cursor-pointer"
              :class="clickTo === opt ? 'color-secondary' : 'hover:text-rose-500'"
              @click="clickTo = opt"
            >
              {{ $t(opt) }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <ToolBar />
  </header>
  <aside class="flex-shrink-0 w-[280px] top-20 left-0 bottom-0 fixed overflow-y-auto">
    <div class="h-[72px] flex items-center px-6">
      <div class="relative group w-full z-10">
        <div
          class="flex items-center justify-between h-10 card pl-4 pr-2 rounded-t-2xl rounded-b-2xl group-hover:rounded-b-none group-hover:border-b-transparent"
        >
          <span class="cursor-default">{{ $t('status') }}</span>
          <div class="flex items-center">
            <div class="text-sm color-secondary">{{ quality.length }} / 4</div>
            <i class="icon-[material-symbols--arrow-drop-down-rounded] text-2xl color-secondary" role="img" aria-hidden="true" />
          </div>
        </div>
        <ul class="absolute top-10 left-0 card p-4 rounded-b-2xl hidden w-full group-hover:block group-hover:border-t-0">
          <li v-for="q in qualityOptions" :key="q" class="h-7 whitespace-nowrap">
            <label class="flex items-center color-action"><input v-model="quality" type="checkbox" :value="q" class="mr-2"> {{ q }}</label>
          </li>
        </ul>
      </div>
    </div>
    <nav class="px-6">
      <NuxtLink
        v-for="(g, i) in groupData"
        :key="g.name"
        :to="{ path: route.path, query: route.query, hash: i === 0 ? '' : `#${g.hash}` }"
        replace
        class="flex items-center h-10 mt-2 relative cursor-pointer"
        :class="activeNav === g.name ? 'text-rose-500 font-bold' : 'hover:color-action'"
        @click="navClick(g.name)"
      >
        <span class="text-2xl mr-2 w-8 inline-block text-center">{{ g.icon }}</span>
        <span>{{ g.name }}</span>
        <Underline v-if="activeNav === g.name" class="absolute left-10 bottom-0 text-xs text-rose-500" />
      </NuxtLink>
    </nav>
  </aside>
  <main class="ml-[280px] mr-6">
    <div class="flex items-center justify-between h-[72px]">
      <div class="flex items-center">
        <div class="flex items-center">
          <span class="mr-1">{{ $t('skinTone') }}</span>
          <div
            v-for="st in skinToneOptions"
            :key="st.name"
            class="border border-1 cursor-default flex justify-center items-center mr-1 w-5 h-5 tooltip"
            :class="skinTone.includes(st.name) ? 'border-rose-500' : 'border-transparent'"
            :data-tip="st.name"
            @click="toggleSkinTone(st.name)"
          >
            {{ st.emoji }}
          </div>
        </div>
        <div class="ml-4">{{ emojiCount }} {{ $t('emojis') }}</div>
      </div>
      <div class="flex items-center">
        <div class="flex items-center">{{ $t('group') }} <Toggle v-model="groupBySubGroup" class="ml-1" /></div>
        <div class="items-center hidden md:flex ml-6">
          <span class="shrink-0 mr-4">{{ $t('size') }} {{ emojiSize }}</span>
          <Range v-model="emojiSize" :min="16" :max="48" />
        </div>
      </div>
    </div>
    <div v-if="!loading && error" class="text-rose-500 card p-6 mb-6 rounded-2xl">
      {{ error }}
      <button class="border border-rose-500 px-2 rounded-full" onclick="window.location.reload()">{{ $t('refresh') }}</button>
    </div>
    <div v-if="loading" class="flex justify-center items-center h-24">
      <i class="icon-[svg-spinners--ring-resize] text-lg" role="img" aria-hidden="true" />
    </div>
    <div v-if="!loading && !error && !groupData.length" class="card p-6 rounded-2xl">⚠️ {{ $t('noResults', { keyword: keyword }) }}</div>
    <template v-if="!loading">
      <div v-for="g in groupData" :id="g.hash" :key="g.hash" ref="doms" class="card p-4 mb-6 rounded-2xl">
        <div v-for="sg in g.children" :key="sg.name">
          <h3 v-if="groupBySubGroup" class="pl-2 mb-2 mt-4">{{ sg.name }}</h3>
          <div class="grid flex-wrap gap-1" style="grid-template-columns: repeat(auto-fill, minmax(72px, 1fr))">
            <template v-if="clickTo === 'detail'">
              <NuxtLink
                v-for="d in sg.data"
                :key="d.e"
                :to="localePath(`/${d.c}`)"
                :style="{ fontSize: `${renderEmojiSize}px` }"
                class="tooltip min-w-[72px] h-16 flex justify-center items-center hover:card rounded-2xl"
                :data-tip="d.n"
              >
                {{ d.e }}
              </NuxtLink>
            </template>
            <template v-if="clickTo === 'copy'">
              <a
                v-for="d in sg.data"
                :key="d.e"
                href="javascript:;"
                :style="{ fontSize: `${renderEmojiSize}px` }"
                class="tooltip min-w-[72px] h-16 flex justify-center items-center hover:card rounded-2xl relative"
                :data-tip="$t('clickToCopy') + d.n"
                @click="copyEmoji(d.e)"
              >
                {{ d.e }}
                <div v-if="source === d.e && copied" class="absolute left-0 top-0 w-full h-full rounded-2xl bg-black/50 flex justify-center items-center">
                  <i class="icon-[material-symbols--check-circle] text-xl text-green-500" aria-hidden="true" role="img" />
                </div>
              </a>
            </template>
          </div>
        </div>
      </div>
    </template>
  </main>
  <Footer />
  <div
    v-show="y > 400"
    class="cursor-pointer fixed right-4 bottom-4 card w-12 h-12 rounded-2xl flex justify-center items-center shadow-2xl tooltip"
    :data-tip="$t('backTop')"
    @click="backTop"
  >
    <i class="icon-[material-symbols--rocket] text-rose-500 text-2xl" role="img" aria-hidden="true" />
  </div>
  <transition name="nested" :duration="150">
    <div v-if="showDetail" class="fixed z-10 top-0 left-0 w-full h-full bg-black/50 dark:bg-black/80 backdrop-blur-sm flex" @click="modalClick">
      <div ref="iconOverlay" class="inner bg-body h-[90vh] w-[100vw] md:w-[760px] rounded-t-3xl shadow-2xl absolute bottom-0 left-0 md:left-1/2 -ml-[380px]">
        <a
          href="javascript:;"
          class="absolute z-10 card top-6 right-6 w-8 h-8 rounded-xl text-2xl flex justify-center items-center hover:bg-rose-500 hover:border-rose-500 hover:text-white"
          @click="closeDetail"
        >
          <i class="icon-[material-symbols--close]" role="img" aria-hidden="true" />
        </a>
        <div class="h-full overflow-y-auto overscroll-contain">
          <Detail :emoji="emoji" />
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped></style>
