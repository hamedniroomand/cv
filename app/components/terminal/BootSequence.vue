<script setup lang="ts">
const props = defineProps<{ skip: boolean }>()
const emit = defineEmits<{ done: [] }>()

const STEPS = [
  'Booting hamed.sh …',
  'Mounting ~ (read-only) … ok',
  'Loading resume data … ok',
  'Starting shell …',
]
const STEP_MS = 220

const shown = ref<string[]>([])
let timers: ReturnType<typeof setTimeout>[] = []
let finished = false

function finish(): void {
  if (finished)
    return
  finished = true
  timers.forEach(clearTimeout)
  window.removeEventListener('keydown', finish)
  emit('done')
}

onMounted(() => {
  if (props.skip) {
    finish()
    return
  }
  window.addEventListener('keydown', finish)
  timers = STEPS.map((step, i) => setTimeout(() => shown.value.push(step), i * STEP_MS))
  timers.push(setTimeout(finish, STEPS.length * STEP_MS + 150))
})

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  window.removeEventListener('keydown', finish)
})
</script>

<template>
  <div class="boot" aria-hidden="true" @click="finish">
    <div v-for="step in shown" :key="step" class="boot__line">
      {{ step }}
    </div>
    <div class="boot__hint">
      press any key to skip
    </div>
  </div>
</template>

<style scoped>
.boot {
  color: var(--fg-dim);
}

.boot__line {
  min-height: 1.5em;
}

.boot__hint {
  margin-top: var(--space-4);
  font-size: var(--text-xs);
  opacity: 0.6;
}
</style>
