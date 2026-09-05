<script setup lang="ts">
  import type { OutputLine } from '~/terminal/types';

  defineProps<{
    lines: OutputLine[];
    label: string;
  }>();
</script>

<template>
  <div
    class="output"
    role="log"
    aria-live="polite"
    aria-relevant="additions"
    :aria-label="label"
  >
    <div
      v-for="line in lines"
      :key="line.id"
      class="output__line"
    >
      <template
        v-for="(span, index) in line.spans"
        :key="index"
      >
        <a
          v-if="span.href"
          :href="span.href"
          :class="`s-${span.style ?? 'accent'}`"
          target="_blank"
          rel="noopener"
          >{{ span.text }}</a
        >
        <span
          v-else
          :class="span.style ? `s-${span.style}` : undefined"
          >{{ span.text }}</span
        >
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

  .output__line:has(> .s-pre) {
    max-width: 100%;
    min-height: 1.2em;
    overflow-x: auto;
    overflow-wrap: normal;
    white-space: pre;
    line-height: 1.2;
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
    color: var(--accent);
    white-space: pre;
  }

  a {
    color: var(--accent-2);
  }
</style>
