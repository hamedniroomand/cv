<script setup lang="ts">
  const props = defineProps<{ skip: boolean }>();
  const emit = defineEmits<{ done: [] }>();

  const STEPS = [
    'Booting hamed.sh …',
    'Mounting ~ (read-only) … ok',
    'Loading resume data … ok',
    'Starting shell …',
  ];
  const { stepMs, finishDelayMs } = useAppConfig().terminal.boot;

  const shown = ref<string[]>([]);
  let timers: ReturnType<typeof setTimeout>[] = [];
  let finished = false;

  function cleanup(): void {
    timers.forEach(clearTimeout);
    window.removeEventListener('keydown', finish);
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    cleanup();
    emit('done');
  }

  onMounted(() => {
    if (props.skip) {
      finish();
      return;
    }
    window.addEventListener('keydown', finish);
    timers = STEPS.map((step, index) => setTimeout(() => shown.value.push(step), index * stepMs));
    timers.push(setTimeout(finish, STEPS.length * stepMs + finishDelayMs));
  });

  onBeforeUnmount(cleanup);
</script>

<template>
  <div
    class="boot"
    aria-hidden="true"
    @click="finish"
  >
    <div
      v-for="step in shown"
      :key="step"
      class="boot__line"
    >
      {{ step }}
    </div>
    <div class="boot__hint">press any key to skip</div>
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
