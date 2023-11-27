<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const id = route.params.id
const { data, error } = useFetch(`/api/emoji/${id}`, { query: { locale: locale.value } })
</script>

<template>
  <div v-if="error" class="text-rose-500 card p-6 mb-6 rounded-2xl">
    {{ error }}
    <button class="border border-rose-500 px-2 rounded-full" onclick="window.location.reload()">{{ $t('refresh') }}</button>
  </div>
  <div v-if="data">
    <div class="flex justify-center items-center">{{ data.e }}</div>
    <div>
      <h2>{{ data.n }}</h2>
      <div>
        Search keyword:
        <span v-for="k in data.keywords" :key="k">{{ k }}</span>
      </div>
      <div>Unicode version:{{ data.v }}</div>
      <div>Unicode code: U+{{ data.c.replace(/ /g, ' U+') }}</div>
      <div>Group: {{ data.g }} > {{ data.s }}</div>
      <button>Copy</button>
    </div>
  </div>
  <div>Show in other platform: Apple:</div>
</template>

<style scoped></style>
