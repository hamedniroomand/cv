<script setup lang="ts">
import type { Education } from '#shared/schemas/education'
import { formatRange } from '#shared/cv/format'

defineProps<{ education: Education }>()
</script>

<template>
  <p class="education">
    <strong>{{ education.degree }} {{ education.field }}</strong><br>
    {{ education.institution }}, {{ education.location }}<br>
    <span class="education__dates">{{ formatRange(education.start, education.end) }}</span>
  </p>
</template>

<style scoped>
.education {
  margin: 0;
}

.education__dates {
  color: var(--fg-dim);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}
</style>
