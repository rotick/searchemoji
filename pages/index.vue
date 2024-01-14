<script setup lang="ts">
import { Document } from '@akryum/flexsearch-es'
import { qualityMap } from '~/utils'
import { useThrottleFn, watchDebounced, useStorageAsync, useClipboard } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const { locale, locales } = useI18n()
const rtl = computed(() => ['ar', 'he'].includes(locale.value))
const flexSearch = new Document({
  document: {
    id: 'c',
    index: [
      // {
      //   field: 'e',
      //   tokenize: 'forward',
      //   resolution: 9
      // },
      {
        field: 'n',
        tokenize: 'forward',
        resolution: 9
      },
      ['zh-hans', 'zh-hant', 'ja', 'ko'].includes(locale.value)
        ? {
            field: 't',
            tokenize: 'forward',
            encode: str => str.replace(/[\x00-\x7F]/g, '').split(''),
            resolution: 9
          }
        : ['ar', 'he'].includes(locale.value)
            ? {
                field: 't',
                encode: false,
                tokenize: 'forward',
                // @ts-expect-error wtf
                rtl: true,
                split: /\s+/,
                resolution: 9
              }
            : {
                field: 't',
                tokenize: 'forward',
                resolution: 9
              },
      // {
      //   field: 'k:en',
      //   tokenize: 'forward',
      //   resolution: 8
      // },
      ['zh-hans', 'zh-hant', 'ja', 'ko'].includes(locale.value)
        ? {
            field: 'k',
            tokenize: 'forward',
            encode: str => str.replace(/[\x00-\x7F]/g, '').split(''),
            resolution: 8
          }
        : ['ar', 'he'].includes(locale.value)
            ? {
                field: 'k',
                encode: false,
                tokenize: 'forward',
                // @ts-expect-error wtf
                rtl: true,
                split: /\s+/,
                resolution: 8
              }
            : {
                field: 'k',
                tokenize: 'forward',
                resolution: 8
              }
    ],
    store: true,
    worker: true
  }
})
interface IndexData {
  emojis: any[]
  groups: any[]
}

const quality = ref(['fully-qualified'])
const transformQuality = computed(() => {
  return quality.value.map(q => qualityMap[q]).join(',')
})
const skinTone = ref([])
const fullSkinTone = computed(() => skinTone.value.map(st => `${st} skin tone`).join(','))

useFetch<IndexData>('/api/emojis', {
  query: {
    locale: locale.value,
    quality: transformQuality,
    skinTone: fullSkinTone
  },
  server: false,
  onResponse ({ response }) {
    for (const item of response._data) {
      flexSearch.add(item)
    }
    nextTick(() => {
      if (keyword.value) {
        search()
      }
    })
  }
})
const { data, error, pending } = useFetch<IndexData>('/api/home', {
  query: {
    locale: locale.value,
    quality: transformQuality,
    skinTone: fullSkinTone
  }
})
const keyword = ref((route.query.q as string) || '')
const searchResult = ref<any>([])
const searching = ref(!!keyword.value)

function search () {
  const result = flexSearch.search(keyword.value, { limit: 10000, enrich: true })
  searchResult.value = result
    .map((item: any) => {
      return item.result.map((r: any) => r.doc)
    })
    .flat()
  searching.value = false
  router.replace({ path: route.path, query: { q: keyword.value || undefined } })
  useHead({
    title: keyword.value ? `🔍 ${keyword.value}` : ''
  })
}
function searchInput () {
  searching.value = true
}
function inputBlur () {
  if (!keyword.value) {
    searching.value = false
  }
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
  let list = data.value?.emojis || []
  if (keyword.value) {
    list = list.filter(emoji => {
      return !!searchResult.value.find(item => item.c === emoji.c)
    })
  }
  emojiCount.value = list.length

  const group: any[] = []
  list.forEach((d: any) => {
    const groupName = data.value?.groups[d.g]
    const subGroupName = data.value?.groups[d.s]
    const item = {
      ...d,
      g: groupName.nt,
      s: subGroupName.nt
    }
    const inGroup = group.find(g => g.name === groupName.n)
    if (!inGroup) {
      group.push({
        name: groupName.n,
        localeName: groupName.nt,
        hash: encodeURIComponent(groupName.n),
        icon: item.e,
        children: [
          {
            name: subGroupName.n,
            localeName: subGroupName.nt,
            data: [item]
          }
        ]
      })
    } else {
      if (groupBySubGroup.value) {
        const inSubGroup = inGroup.children.find((g: any) => g.name === subGroupName.n)
        if (!inSubGroup) {
          inGroup.children.push({
            name: subGroupName.n,
            localeName: subGroupName.nt,
            data: [item]
          })
        } else {
          inSubGroup.data.push(item)
        }
      } else {
        inGroup.children[0].data.push(item)
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
const horizontalScroller = ref<HTMLElement>()
const isMobile = ref(false)
watch(activeNav, () => {
  if (isMobile.value) {
    const target = document.getElementById(`nav-${activeNav.value.replace(/ /g, '-')}`)
    const left = target ? (horizontalScroller.value?.scrollLeft || 0) + target.getBoundingClientRect().left - 72 : 0
    horizontalScroller.value?.scrollTo({ left, top: 0, behavior: 'smooth' })
  }
})
function setGroupRef (el: HTMLElement, index: number) {
  doms.value[index] = el
}
const y = ref(0)
const handleScroll = useThrottleFn(() => {
  y.value = document.documentElement.scrollTop
  doms.value.forEach(tag => {
    const top = tag?.getBoundingClientRect().top
    // 10px fault tolerance, 148 and 96 see app/router.options.ts
    const triggerScrollTop = isMobile.value ? 148 + 10 : 96 + 10
    if (top <= triggerScrollTop) {
      activeNav.value = decodeURIComponent(tag.id)
    }
  })
}, 20)
const searchInputRef = ref<HTMLElement>()
function handleKeydown (e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchInputRef.value?.focus()
    // @ts-expect-error-next-line
    searchInputRef.value?.select()
  }
}
const isMac = ref(false)
let stopWatchGroupDataChange: any
onMounted(() => {
  activeNav.value = decodeURIComponent(route.hash)?.replace('#', '') || groupData.value[0]?.name || ''
  stopWatchGroupDataChange = watch(groupData, () => {
    activeNav.value = groupData.value[0]?.name || ''
  })
  isMac.value = window.navigator.userAgent.toLowerCase().includes('macintosh')
  isMobile.value = window.innerWidth <= 768
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  stopWatchGroupDataChange?.()
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('keydown', handleKeydown)
})
function backTop () {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
const clickTo = useStorageAsync('clickTo', 'detail')
const clickToOptions = ['detail', 'copy']
function setClickTo (opt: any, close: any) {
  clickTo.value = opt
  close()
}
const source = ref('')
const { copy, copied } = useClipboard({ source, legacy: true })
function copyEmoji (emoji: string) {
  source.value = emoji
  copy(source.value)
}

const showDetail = ref(false)
const emoji = ref()
onBeforeRouteLeave(to => {
  if ((to.name as string).startsWith('id__')) {
    const emojiId = to.params.id as string
    const target = data.value?.emojis.find((d: any) => d.c === emojiId)
    if (target) {
      const groupName = data.value?.groups[target.g]
      const subGroupName = data.value?.groups[target.s]
      emoji.value = {
        ...target,
        g: groupName.nt,
        s: subGroupName.nt
      }
    }
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
const { t } = useI18n()
useHead({
  title: t('seo.title')
})
const itemList = computed(() => ({
  '@type': 'ItemList',
  name: 'Emojis',
  sameAs: 'https://en.wikipedia.org/wiki/Emoji',
  numberOfItems: data.value?.emojis.length || 0,
  itemListElement: (data.value?.emojis || []).map((d, i) => ({
    '@type': 'ListItem',
    url: localePath(`/${d.c}`),
    position: i
  }))
}))
useSchemaOrg([
  defineWebSite({
    // delete when nuxt-schema-org fix the bug
    // '@id': 'https://searchemoji.app/#website',
    // '@type': 'WebSite',
    // description: t('seo.title'),
    // inLanguage: locale.value,
    // name: 'SearchEmoji',
    // url: 'https://searchemoji.app',
    // publisher: {
    //   '@id': 'https://searchemoji.app/#identity'
    // },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://searchemoji.app${localePath('/')}?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }),
  // defineWebPage({
  //   '@id': `https://searchemoji.app${localePath('/')}/#webpage`,
  //   '@type': 'WebPage',
  //   description: t('seo.description'),
  //   name: t('seo.title'),
  //   url: `https://searchemoji.app${localePath('/')}`,
  //   about: {
  //     '@id': 'https://searchemoji.app/#identity'
  //   },
  //   isPartOf: {
  //     '@id': 'https://searchemoji.app/#website'
  //   }
  // }),
  itemList
])
</script>

<template>
  <header
    class="flex justify-between items-start md:items-center h-24 px-4 md:h-20 md:px-6 z-[11] sticky top-0 bg-zinc-50/80 md:shadow-sm dark:bg-zinc-900/80 backdrop-blur-md border-b-0 md:border-b border-zinc-200/80 dark:border-zinc-800/80"
  >
    <div class="flex items-center md:items-center flex-wrap w-full md:w-auto">
      <NuxtLink class="flex items-center h-14 md:h-20 w-[168px] md:w-[256px]" :to="localePath('/')" title="SearchEmoji">
        <img src="/logo.png" class="w-9 h-9 mr-2 md:w-11 md:h-11 md:mr-3" alt="SearchEmoji">
        <Logo class="text-lg md:text-2xl color-title mt-0.5" />
        <h1 class="w-0 h-0 overflow-hidden">{{ $t('logoTips') }}</h1>
      </NuxtLink>
      <div class="items-center card rounded-2xl w-full md:w-[360px] lg:w-[420px] xl:w-[560px] h-9 md:h-10 flex flex-grow">
        <DropDown
          class="flex items-center relative border-r border-zinc-200/80 dark:border-zinc-700/80 cursor-default shrink-0"
          :class="rtl ? 'flex-row-reverse pr-2 pl-2' : 'pl-4'"
          :top="30"
          :left="0"
        >
          <template #default="{ active }">
            <i class="icon-[ph--translate-bold] text-xl color-action shrink-0" :class="rtl ? 'ml-1' : 'mr-1'" role="img" aria-hidden="true" />
            <span class="color-action shrink-0 select-none">{{ currentLocale?.name }}</span>
            <i
              class="icon-[material-symbols--arrow-drop-down-rounded] text-2xl color-action transition-all shrink-0"
              role="img"
              :class="{ 'rotate-180': active }"
              aria-hidden="true"
            />
          </template>
          <template #content="{ close }">
            <div class="card w-[264px] p-2 rounded-2xl flex flex-wrap">
              <NuxtLink
                v-for="l in locales"
                :key="l.code"
                :to="switchLocalePath(l.code)"
                class="h-8 px-2 rounded-xl w-[122px] line-clamp-1 break-all leading-8"
                :class="l.code === locale ? 'color-disable cursor-default' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:color-action'"
                @click="close()"
              >
                {{ l.name }}
              </NuxtLink>
            </div>
          </template>
        </DropDown>
        <input
          ref="searchInputRef"
          v-model="keyword"
          type="search"
          enterkeyhint="search"
          class="bg-transparent flex-grow outline-none px-2 color-title min-w-0"
          :class="rtl ? 'text-right' : ''"
          :placeholder="`${$t('placeholder')}${isMobile ? '' : '(' + (isMac ? '⌘' : 'Ctrl') + '+ K)'}`"
          @input="searchInput"
          @blur="inputBlur"
          @keyup.enter="search"
        >
        <button class="bg-zinc-200/80 dark:bg-zinc-700/80 h-full w-12 rounded-r-2xl flex justify-center items-center" aria-label="Search" @click="search">
          <i class="icon-[solar--magnifer-linear] text-lg md:text-2xl color-secondary shrink-0" role="img" aria-hidden="true" />
        </button>
      </div>
      <div class="items-center ml-6 hidden lg:flex" :class="rtl ? 'flex-row-reverse' : ''">
        {{ $t('clickTo') }}
        <DropDown class="flex items-center color-action relative cursor-default select-none" :class="rtl ? 'flex-row-reverse mr-2' : 'ml-2'" :top="24">
          <template #default="{ active }">
            {{ $t(clickTo) }}
            <i
              class="icon-[material-symbols--arrow-drop-down-rounded] text-2xl transition-all"
              :class="{ 'rotate-180': active }"
              role="img"
              aria-hidden="true"
            />
          </template>
          <template #content="{ close }">
            <ul class="card px-4 py-2 rounded-2xl">
              <li
                v-for="opt in clickToOptions"
                :key="opt"
                class="py-2 whitespace-nowrap cursor-pointer"
                :class="clickTo === opt ? 'color-secondary' : 'hover:text-rose-500'"
                @click="setClickTo(opt, close)"
              >
                {{ $t(opt) }}
              </li>
            </ul>
          </template>
        </DropDown>
      </div>
    </div>
    <ToolBar class="absolute right-4 top-0 h-14 md:static" />
  </header>
  <aside
    ref="horizontalScroller"
    class="flex-shrink-0 sticky md:fixed md:pr-3 md:w-[268px] top-24 md:top-20 left-0 bottom-0 overflow-auto z-10 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 md:bg-transparent md:dark:bg-transparent md:backdrop-blur-none md:border-b-0"
  >
    <div class="h-[72px] hidden md:flex items-center pl-6">
      <DropDown class="w-full z-10 select-none" :top="39" :left="0" :right="0">
        <template #default="{ active }">
          <div
            class="flex items-center justify-between h-10 card rounded-t-2xl cursor-default"
            :class="[active ? 'rounded-b-none border-b-transparent' : 'rounded-b-2xl', rtl ? 'flex-row-reverse pl-2 pr-4' : 'pl-4 pr-2']"
          >
            <span>{{ $t('qualified') }}</span>
            <div class="flex items-center" :class="rtl ? 'flex-row-reverse' : ''">
              <div class="text-sm color-secondary shrink-0">{{ quality.length }} / 4</div>
              <i
                class="icon-[material-symbols--arrow-drop-down-rounded] text-2xl color-secondary transition-all shrink-0"
                :class="{ 'rotate-180': active }"
                role="img"
                aria-hidden="true"
              />
            </div>
          </div>
        </template>
        <template #content>
          <ul class="card p-4 rounded-b-2xl w-full border-t-0">
            <li v-for="q in qualityOptions" :key="q" class="h-7 whitespace-nowrap">
              <label class="flex items-center color-action" :class="rtl ? 'flex-row-reverse' : ''"><input v-model="quality" type="checkbox" :value="q" :class="rtl ? 'ml-2' : 'mr-2'"> {{ $t(q) }}</label>
            </li>
          </ul>
        </template>
      </DropDown>
    </div>
    <nav class="px-4 md:pl-6 flex md:block w-auto">
      <NuxtLink
        v-for="(g, i) in groupData"
        :id="`nav-${g.name.replace(/ /g, '-')}`"
        :key="g.name"
        :to="{ path: route.path, query: route.query, hash: i === 0 ? '' : `#${g.hash}` }"
        replace
        class="flex items-center h-10 pr-4 md:pr-0 md:mb-2 relative cursor-pointer"
        :class="[activeNav === g.name ? 'text-rose-500 font-bold' : 'md:hover:color-action', rtl ? 'flex-row-reverse' : '']"
        @click="navClick(g.name)"
      >
        <span class="hidden text-2xl w-8 md:inline-block text-center" :class="rtl ? 'ml-2' : 'mr-2'">{{ g.icon }}</span>
        <span class="whitespace-nowrap">{{ g.localeName }}</span>
        <Underline
          v-if="activeNav === g.name"
          class="absolute bottom-0 text-[8px] md:text-xs text-rose-500"
          :class="rtl ? 'right-4 md:right-10' : 'left-0 md:left-10'"
        />
      </NuxtLink>
    </nav>
    <a
      href="https://yesicon.app"
      target="_blank"
      class="no-icon hidden md:block ml-6 mt-6 mb-6 card p-4 rounded-2xl opacity-30 hover:opacity-100 transition-all"
    >
      <div class="flex justify-between items-center">
        <Yesicon class="color-action text-2xl" />
        <span class="text-xl">👈</span>
      </div>
      <p class="mt-3 text-sm">{{ $t('yesicon') }}</p>
    </a>
  </aside>
  <main class="mx-4 md:ml-[280px] md:mr-6">
    <div class="flex items-center md:justify-between h-11 md:h-[72px]">
      <div class="flex items-center flex-grow justify-between md:justify-start">
        <div class="flex items-center" :class="rtl ? 'flex-row-reverse' : ''">
          <span class="mr-1">{{ $t('skinTone') }}</span>
          <div
            v-for="st in skinToneOptions"
            :key="st.name"
            class="border border-1 cursor-default flex justify-center items-center mr-1 w-5 h-5 md:tooltip relative"
            :class="skinTone.includes(st.name) ? 'border-rose-500' : 'border-transparent'"
            :data-tip="$t(st.name)"
            @click="toggleSkinTone(st.name)"
          >
            {{ st.emoji }}
            <span v-if="skinTone.includes(st.name)" class="absolute left-0 top-0 w-full h-full flex justify-center items-center text-rose-500">
              <i class="icon-[carbon--checkmark]" role="img" aria-hidden="true" />
            </span>
          </div>
        </div>
        <div class="ml-4">{{ emojiCount }} {{ $t('emojis') }}</div>
      </div>
      <div class="md:flex items-center hidden">
        <div class="flex items-center" :class="rtl ? 'flex-row-reverse' : ''">
          {{ $t('group') }} <Toggle v-model="groupBySubGroup" :class="rtl ? 'flex-row-reverse mr-1' : 'ml-1'" />
        </div>
        <div class="items-center hidden lg:flex ml-6">
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
      <div
        v-for="(g, i) in groupData"
        :id="g.hash"
        :key="g.hash"
        :ref="
          el => {
            setGroupRef(el, i)
          }
        "
        class="card p-2 md:p-4 mb-6 rounded-2xl"
      >
        <div v-for="sg in g.children" :key="sg.name">
          <h3 v-if="groupBySubGroup" class="pl-2 mb-2 mt-4">{{ sg.localeName }}</h3>
          <div
            class="grid flex-wrap gap-1 emoji-box"
            style="grid-template-columns: repeat(auto-fill, minmax(72px, 1fr))"
            :style="{ fontSize: `${renderEmojiSize}px` }"
          >
            <template v-if="clickTo === 'detail'">
              <NuxtLink v-for="d in sg.data" :key="d.e" :to="localePath(`/${d.c}`)">
                <h4>{{ d.e }}</h4>
                <p>{{ d.t }}</p>
              </NuxtLink>
            </template>
            <template v-if="clickTo === 'copy'">
              <a v-for="d in sg.data" :key="d.e" href="javascript:;" @click="copyEmoji(d.e)">
                <h4>{{ d.e }}</h4>
                <p>{{ $t('clickToCopy') + d.t }}</p>
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
    class="cursor-pointer !fixed right-4 bottom-4 card w-12 h-12 rounded-2xl flex justify-center items-center shadow-2xl md:tooltip"
    :data-tip="$t('backTop')"
    @click="backTop"
  >
    <i class="icon-[material-symbols--rocket] text-rose-500 text-2xl" role="img" aria-hidden="true" />
  </div>
  <transition name="nested" :duration="150">
    <div v-if="showDetail" class="fixed z-20 top-0 left-0 w-full h-full bg-black/50 dark:bg-black/80 backdrop-blur-sm flex" @click="modalClick">
      <div
        ref="iconOverlay"
        class="inner bg-body h-[90vh] !h-[90dvh] w-[100vw] md:w-[760px] rounded-t-3xl shadow-2xl absolute bottom-0 left-0 md:left-1/2 md:-ml-[380px]"
      >
        <a
          href="javascript:;"
          class="absolute z-20 card top-4 right-4 md:top-6 md:right-6 w-8 h-8 rounded-xl text-2xl flex justify-center items-center hover:bg-rose-500 hover:border-rose-500 hover:text-white"
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

<style>
.emoji-box a {
  @apply relative min-w-[72px] h-16 flex justify-center items-center hover:card rounded-2xl;
}
.emoji-box a h4 {
  @apply inline-block overflow-hidden w-full text-center;
  content-visibility: auto;
}
.emoji-box a p {
  @apply hidden absolute top-0 left-[50%] w-[auto] translate-x-[-50%] translate-y-[-105%] whitespace-nowrap z-10 bg-zinc-900 shadow-sm text-white py-1 px-2 text-sm rounded-lg;
}
.emoji-box a:hover p {
  @apply md:block;
}
</style>
