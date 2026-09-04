<script setup lang="ts">
defineProps<{ items: string[] }>()
</script>

<template>
  <ul class="stack" aria-label="Stack">
    <li v-for="item in items" :key="item">
      {{ item }}
    </li>
  </ul>
</template>

<style scoped>
.stack {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: var(--space-3) 0 0;
  padding: 0;
  list-style: none;
}

.stack li {
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
  background: var(--bg-elev);
  color: var(--fg-dim);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}
</style>
