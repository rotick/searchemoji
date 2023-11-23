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
const quality = ref(['fully-qualified', 'component'])
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
const groupData = computed(() => {
  const list = keyword.value ? searchResult.value : data.value
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
        icon: d.e,
        children: [
          {
            name: d.s,
            data: [d]
          }
        ]
      })
    } else {
      const inSubGroup = inGroup.children.find((g: any) => g.name === d.s)
      if (!inSubGroup) {
        inGroup.children.push({
          name: d.s,
          data: [d]
        })
      } else {
        inSubGroup.data.push(d)
      }
    }
  })
  return group
})
const emojiSize = ref(24)
</script>

<template>
  <div class="flex justify-between items-center h-20 px-6 z-10 sticky top-0 bg-body">
    <div class="flex items-center">
      <div class="flex items-center w-[256px]">
        <img src="/logo.png" class="w-12 h-12 mr-3" alt="SearchEmoji">
        <h1 class="text-2xl font-bold color-title">SearchEmoji</h1>
      </div>
      <div class="flex items-center card rounded-full w-[560px] h-10">
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
          class="bg-transparent flex-grow outline-none px-2"
          placeholder="Enter a keyword..."
          @keyup.enter="search"
        >
        <button class="bg-zinc-200/80 dark:bg-zinc-700/80 h-full w-12 rounded-r-full flex justify-center items-center" @click="search">
          <i class="icon-[solar--magnifer-linear] text-lg md:text-2xl color-secondary shrink-0" role="img" aria-hidden="true" />
        </button>
      </div>
    </div>
    <ToolBar />
  </div>
  <div v-if="error" class="text-red-500">{{ error }}</div>
  <div class="flex mx-6">
    <div class="flex-shrink-0 w-[232px]">
      <div v-for="g in groupData" :key="g.name">{{ g.icon }} {{ g.name }}</div>
    </div>
    <div class="flex-grow ml-6">
      <div>
        <div>
          <div class="flex">
            Quality: <label v-for="q in qualityOptions" :key="q"><input v-model="quality" type="checkbox" :value="q">{{ q }}</label>
          </div>
          <div class="flex">
            Skin tone:
            <div
              v-for="st in skinToneOptions"
              :key="st.name"
              class="border border-1 cursor-default"
              :class="skinTone.includes(st.name) ? 'border-rose-500' : 'border-transparent'"
              @click="toggleSkinTone(st.name)"
            >
              {{ st.emoji }}
            </div>
          </div>
          <div class="flex items-center justify-between h-10 text-sm">
            <div>{{ emojiCount }} emojis</div>
            <div class="flex items-center">
              <div class="flex items-center">Group: <Toggle v-model="groupBySubGroup" /></div>
              <div class="items-center hidden md:flex ml-6">
                <span class="shrink-0 mr-4">Emoji size: {{ emojiSize }}</span>
                <input v-model="emojiSize" type="range" min="16" max="48" class="form-range range-sm">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-for="g in groupData" :key="g.name" class="card p-6 mb-6 rounded-2xl">
        <div v-for="sg in g.children" :key="sg.name">
          <h3>{{ sg.name }}</h3>
          <div>
            <NuxtLink v-for="d in sg.data" :key="d.e" :style="{ fontSize: `${emojiSize}px` }">
              {{ d.e }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
