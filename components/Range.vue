<script setup lang="ts">
import { useColorMode } from '#imports'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 24
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  }
})
const emit = defineEmits(['update:modelValue'])
const value = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    emit('update:modelValue', Number(value))
  }
})

const colorMode = useColorMode()
const progress = computed(() => ((value.value - props.min) / (props.max - props.min)) * 100)
const bgColor = ref('#d4d4d8')
watch(
  () => colorMode.value,
  () => {
    bgColor.value = colorMode.value === 'dark' ? '#3f3f46' : '#d4d4d8'
  }
)
// wtf!!! there are so many problems with computed and watch in ssr
onMounted(() => {
  bgColor.value = colorMode.value === 'dark' ? '#3f3f46' : '#d4d4d8'
})
</script>

<template>
  <input
    v-model="value"
    class="range"
    type="range"
    :min="min"
    :max="max"
    :style="{
      '--thumb-rotate': `${(value / 48) * 2160}deg`,
      background: `linear-gradient(to right, #f43f5e ${progress}%, ${bgColor} ${progress}% 100%)`
    }"
  >
</template>

<style scoped>
.range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  outline: none;
  border-radius: 10px;
  height: 10px;
}

.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 30px;
  width: 30px;
  background: transparent;
  background-image: url('/logo.png');
  background-size: cover;
  border-radius: 50%;
  transition: 0.2s ease-in-out;
  transform: rotateZ(var(--thumb-rotate, 0deg));
}

/* Thumb: Firefox */
.range::-moz-range-thumb {
  height: 30px;
  width: 30px;
  background: transparent;
  background-image: url('/logo.png');
  background-size: cover;
  border: none;
  border-radius: 50%;
  transform: rotateZ(var(--thumb-rotate, 0deg));
  transition: 0.2s ease-in-out;
}

.range::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 10px rgba(244, 63, 94, 0.1);
}
.range:active::-webkit-slider-thumb {
  box-shadow: 0 0 0 13px rgba(244, 63, 94, 0.2);
}

.range:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 13px rgba(244, 63, 94, 0.2);
}

.range::-moz-range-thumb:hover {
  box-shadow: 0 0 0 10px rgba(244, 63, 94, 0.1);
}
.range:active::-moz-range-thumb {
  box-shadow: 0 0 0 13px rgba(244, 63, 94, 0.2);
}
.range:focus::-moz-range-thumb {
  box-shadow: 0 0 0 13px rgba(244, 63, 94, 0.2);
}
</style>
