<script setup lang="ts">
  import type { TerminalWindowMode } from '#shared/terminal/window-mode';

  const Terminal = defineAsyncComponent(() => import('~/components/terminal/Terminal.vue'));

  const props = defineProps<{ mode: TerminalWindowMode }>();
  defineEmits<{ minimize: []; toggleMaximize: []; close: [] }>();

  const terminal = ref<{ focus: () => void } | null>(null);
  defineExpose({ focus: () => terminal.value?.focus() });
</script>

<template>
  <aside
    id="public-terminal"
    class="terminal-dock"
    :class="`terminal-dock--${props.mode}`"
    aria-label="Terminal"
  >
    <div class="terminal-dock__bar">
      <span class="terminal-dock__title">
        <span class="status-dot" /> hamed.sh
        <span class="muted">/ interactive shell</span>
      </span>
      <TerminalWindowControls
        :maximized="props.mode === 'maximized'"
        :minimized="props.mode === 'minimized'"
        @minimize="$emit('minimize')"
        @toggle-maximize="$emit('toggleMaximize')"
        @close="$emit('close')"
      />
    </div>
    <div class="terminal-dock__body">
      <ClientOnly>
        <Terminal
          ref="terminal"
          public-mode
        />
      </ClientOnly>
    </div>
    <div class="terminal-dock__hint">
      <span>Try <code>ls projects</code>, <code>ls experience</code> or <code>menu</code></span>
      <span>Tab to complete</span>
    </div>
  </aside>
</template>
