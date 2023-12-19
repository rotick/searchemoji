<script setup>
const error = useError()
useHead({
  title: `${error.value.statusCode} - ${error.value.url}`
})
</script>

<template>
  <div class="m-6">
    <h2 class="text-4xl color-title">{{ error.statusCode }}</h2>
    <div class="mt-4">{{ error.message }}</div>
    <div class="card p-6 rounded-2xl mt-4" v-html="error.stack" />
  </div>
</template>

<style scoped></style>
