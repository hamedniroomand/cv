<script setup lang="ts">
  import { TERMINAL_HOTKEY } from '~/composables/useTerminalHotkeys';

  defineProps<{ expanded: boolean }>();
  defineEmits<{ activate: [] }>();
  const button = ref<HTMLButtonElement | null>(null);

  defineExpose({ focus: () => button.value?.focus() });
</script>

<template>
  <button
    ref="button"
    type="button"
    class="terminal-trigger"
    aria-label="Open terminal"
    :aria-expanded="expanded"
    aria-controls="public-terminal"
    @click="$emit('activate')"
  >
    <span aria-hidden="true">&gt;_</span>
    <span class="terminal-trigger__label">Terminal</span>
    <kbd
      class="terminal-trigger__keys"
      aria-hidden="true"
      ><span>Ctrl</span><span>{{ TERMINAL_HOTKEY }}</span></kbd
    >
  </button>
</template>
