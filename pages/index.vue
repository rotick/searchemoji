<script setup lang="ts">
import { Document } from '@akryum/flexsearch-es'
import { qualityMap } from '~/utils'

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
      console.log(val)
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
  console.log(searchResult.value)
}

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

const groupData = computed(() => {
  const list = searchResult.value.length ? searchResult.value : data.value
  const filtered = list.filter((li: any) => {
    if (transformQuality.value.includes(li.q)) return true
    // todo has bug here
    if (!li.n.includes('skin tone') || (li.n.includes('skin tone') && (fullSkinTone.value.includes(li.n) || li.s === 'skin-tone'))) return true
    return false
  })
  console.log(filtered.length)
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
const fontSize = ref(24)
</script>

<template>
  <div v-if="error" class="text-red-500">{{ error }}</div>
  <div class="flex">
    <div class="flex-shrink-0">
      <div v-for="g in groupData" :key="g.name">{{ g.icon }} {{ g.name }}</div>
    </div>
    <div class="flex-grow ml-6">
      <div>
        <div class="flex border">
          <input v-model="keyword" type="search" enterkeyhint="search" @keyup.enter="search">
          <button @click="search">
            <i class="icon-[solar--magnifer-linear] text-lg md:text-2xl color-secondary shrink-0" role="img" aria-hidden="true" />
          </button>
        </div>
        <div>
          <div class="flex">Group: <Toggle v-model="groupBySubGroup" /></div>
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
        </div>
      </div>
      <div v-for="g in groupData" :key="g.name" class="card mb-6">
        <div v-for="sg in g.children" :key="sg.name">
          <h3>{{ sg.name }}</h3>
          <div>
            <NuxtLink v-for="d in sg.data" :key="d.e" :style="{ fontSize: `${fontSize}px` }">
              {{ d.e }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
