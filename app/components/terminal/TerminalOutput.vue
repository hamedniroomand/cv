<script setup lang="ts">
import type { OutputLine } from '~/terminal/types'

defineProps<{ lines: OutputLine[] }>()
</script>

<template>
  <div class="output" role="log" aria-live="polite" aria-relevant="additions" aria-label="Terminal output">
    <div v-for="line in lines" :key="line.id" class="output__line">
      <template v-for="(span, i) in line.spans" :key="i">
        <a
          v-if="span.href"
          :href="span.href"
          :class="`s-${span.style ?? 'accent'}`"
          target="_blank"
          rel="noopener"
        >{{ span.text }}</a>
        <span v-else :class="span.style ? `s-${span.style}` : undefined">{{ span.text }}</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.output {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.output__line {
  min-height: 1.5em;
}

.s-dim {
  color: var(--fg-dim);
}

.s-accent {
  color: var(--accent);
}

.s-error {
  color: var(--error);
}

.s-success {
  color: var(--success);
}

.s-prompt {
  color: var(--prompt);
}

.s-pre {
  white-space: pre;
}

a {
  color: var(--accent-2);
}
</style>
