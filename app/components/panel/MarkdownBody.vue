<script setup lang="ts">
defineProps<{ html: string }>()
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- html is rendered at build time from our own Markdown -->
  <div class="prose" v-html="html" />
</template>

<style>
.prose > :first-child {
  margin-top: 0;
}

.prose > :last-child {
  margin-bottom: 0;
}

.prose p,
.prose ul,
.prose ol {
  margin: 0 0 0.8em;
}

.prose h1,
.prose h2,
.prose h3 {
  margin: 1.2em 0 0.4em;
  font-family: var(--font-mono);
  font-size: var(--text-base);
  font-weight: 600;
}

.prose code {
  padding: 0.05em 0.3em;
  border-radius: 4px;
  background: var(--bg-elev);
}

.prose pre {
  padding: var(--space-3);
  overflow-x: auto;
  border-radius: var(--radius);
  background: var(--bg-elev);
}

.prose pre code {
  padding: 0;
  background: none;
}

.prose img {
  max-width: 100%;
}
</style>
