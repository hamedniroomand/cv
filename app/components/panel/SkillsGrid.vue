<script setup lang="ts">
import type { SkillCategory } from '#shared/schemas/skills'

defineProps<{ categories: SkillCategory[] }>()

function itemNames(category: SkillCategory): string {
  return category.items.map(item => item.name).join(', ')
}
</script>

<template>
  <dl class="skills">
    <div v-for="category in categories" :key="category.id" class="skills__row">
      <dt>{{ category.label }}</dt>
      <dd>{{ itemNames(category) }}</dd>
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
