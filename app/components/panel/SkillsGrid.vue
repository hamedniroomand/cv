<script setup lang="ts">
import type { SkillCategory } from '#shared/schemas/skills'

defineProps<{ categories: SkillCategory[] }>()
</script>

<template>
  <dl class="skills">
    <div v-for="cat in categories" :key="cat.id" class="skills__row">
      <dt>{{ cat.label }}</dt>
      <dd>{{ cat.items.map(item => item.name).join(', ') }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.skills {
  margin: 0;
}

.skills__row {
  display: grid;
  grid-template-columns: 9rem 1fr;
  gap: var(--space-4);
  padding: var(--space-2) 0;
}

.skills__row + .skills__row {
  border-top: 1px solid var(--border);
}

.skills dt {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--fg-dim);
}

.skills dd {
  margin: 0;
}

@media (max-width: 480px) {
  .skills__row {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }
}
</style>
