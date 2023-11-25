<script setup lang="ts">
import { Document } from '@akryum/flexsearch-es'
import { qualityMap } from '~/utils'
import { watchDebounced } from '@vueuse/core'

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
        field: 'k:en',
        tokenize: 'forward',
        resolution: 8
      }
    ],
    store: true
  }
})
const { data, error } = useFetch('/api/data', { query: { locale: 'en' } })
watch(
  data,
  val => {
    if (val?.length) {
      val.forEach((item: any) => {
        flexSearch.add(item)
      })
    }
  },
  {
    immediate: true
  }
)
const keyword = ref('')
const searchResult = ref<any>([])
function search () {
  const result = flexSearch.search(keyword.value, { limit: 10000, enrich: true })
  searchResult.value = result
    .map((item: any) => {
      return item.result.map((r: any) => r.doc)
    })
    .flat()
}
watchDebounced(
  keyword,
  () => {
    search()
  },
  { debounce: 400, maxWait: 1000 }
)

const groupBySubGroup = ref(false)
const qualityOptions = Object.keys(qualityMap)
const quality = ref(['fully-qualified'])
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
const skinTone = ref<string[]>([])
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
const emojiSize = ref(24)
const renderEmojiSize = ref(24)
watchDebounced(
  emojiSize,
  () => {
    renderEmojiSize.value = emojiSize.value
  },
  { debounce: 400 }
)
const route = useRoute()
const router = useRouter()
const activeNav = computed(() => {
  const currentHash = decodeURIComponent(route.hash) || groupData.value[0]?.name || ''
  return currentHash.replace('#', '')
})
function navClick (name: string) {
  if (name.startsWith('Smileys')) {
    router.replace(route.path)
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
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
      </NuxtLink>
      <div class="flex items-center card rounded-2xl w-[560px] h-10">
        <div class="flex items-center pl-4 color-action relative border-r border-zinc-200/80 dark:border-zinc-700/80 group cursor-default">
          <i class="icon-[ph--translate-bold] text-xl mr-1" role="img" aria-hidden="true" />
          <span>English</span>
          <i class="icon-[material-symbols--arrow-drop-down-rounded] text-2xl" role="img" aria-hidden="true" />
          <div class="absolute top-6 left-0 card w-[240px] p-4 rounded-3xl hidden group-hover:flex">
            <NuxtLink>English</NuxtLink>
            <NuxtLink>简体中文</NuxtLink>
          </div>
        </div>
        <input
          v-model="keyword"
          type="search"
          enterkeyhint="search"
          class="bg-transparent flex-grow outline-none px-2 color-title"
          placeholder="Enter a keyword..."
          @keyup.enter="search"
        >
        <button class="bg-zinc-200/80 dark:bg-zinc-700/80 h-full w-12 rounded-r-2xl flex justify-center items-center" @click="search">
          <i class="icon-[solar--magnifer-linear] text-lg md:text-2xl color-secondary shrink-0" role="img" aria-hidden="true" />
        </button>
      </div>
      <div class="flex items-center ml-6">
        Click to
        <div class="flex items-center ml-2 color-action">
          Go to detail
          <i class="icon-[material-symbols--arrow-drop-down-rounded] text-2xl" role="img" aria-hidden="true" />
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
          <span class="cursor-default">Status</span>
          <div class="flex items-center">
            <div class="text-xs">{{ quality.length }} / 4</div>
            <i class="icon-[material-symbols--arrow-drop-down-rounded] text-2xl" role="img" aria-hidden="true" />
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
        v-for="g in groupData"
        :key="g.name"
        :to="g.hash.startsWith('Smileys') ? '' : `#${g.hash}`"
        replace
        class="flex items-center h-10 mt-2 relative cursor-pointer"
        :class="activeNav === g.name ? 'text-rose-500 font-bold' : 'hover:color-action'"
        @click="navClick(g.name)"
      >
        <span class="text-2xl mr-2">{{ g.icon }}</span>
        <span>{{ g.name }}</span>
        <Underline v-show="activeNav === g.name" class="absolute left-10 bottom-0 text-xs text-rose-500" />
      </NuxtLink>
    </nav>
  </aside>
  <main class="ml-[280px] mr-6">
    <div class="flex items-center justify-between h-[72px]">
      <div class="flex items-center">
        <div class="flex items-center">
          <span class="mr-1">Skin tone:</span>
          <div
            v-for="st in skinToneOptions"
            :key="st.name"
            class="border border-1 cursor-default flex justify-center items-center mr-1 w-5 h-5"
            :class="skinTone.includes(st.name) ? 'border-rose-500' : 'border-transparent'"
            @click="toggleSkinTone(st.name)"
          >
            {{ st.emoji }}
          </div>
        </div>
        <div class="ml-4">{{ emojiCount }} Emojis</div>
      </div>
      <div class="flex items-center">
        <div class="flex items-center">Group: <Toggle v-model="groupBySubGroup" class="ml-1" /></div>
        <div class="items-center hidden md:flex ml-6">
          <span class="shrink-0 mr-4">Size: {{ emojiSize }}</span>
          <Range v-model="emojiSize" :min="16" :max="48" />
        </div>
      </div>
    </div>
    <div v-if="error" class="text-rose-500 card p-6 mb-6 rounded-2xl">
      {{ error }}
      <button class="border border-rose-500 px-2 rounded-full" onclick="window.location.reload()">Refresh</button>
    </div>
    <div v-for="g in groupData" :id="g.hash" :key="g.hash" class="card p-4 mb-6 rounded-2xl">
      <div v-for="sg in g.children" :key="sg.name">
        <h3 v-if="groupBySubGroup" class="pl-2 mt-2">{{ sg.name }}</h3>
        <div class="grid flex-wrap gap-1" style="grid-template-columns: repeat(auto-fill, minmax(72px, 1fr))">
          <NuxtLink
            v-for="d in sg.data"
            :key="d.e"
            :style="{ fontSize: `${renderEmojiSize}px` }"
            class="tooltip min-w-[72px] h-16 flex justify-center items-center hover:card rounded-2xl"
            :data-tip="d.n"
          >
            {{ d.e }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
