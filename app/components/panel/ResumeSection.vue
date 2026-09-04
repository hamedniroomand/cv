<script setup lang="ts">
import type { PanelSection } from '#shared/cv/panel-target'
import { panelTargetId } from '#shared/cv/panel-target'

const props = defineProps<{
  section: PanelSection
  title: string
  path: string
  command?: string
}>()

const id = computed(() => panelTargetId({ section: props.section }))
const highlighted = usePanelHighlight(id)
</script>

<template>
  <section :id="id" class="section" :class="{ 'is-highlighted': highlighted }">
    <PanelHead class="section__head" :path="path" :command="command">
      <h2>{{ title }}</h2>
    </PanelHead>
    <slot />
  </section>
</template>

<style scoped>
.section {
  margin-top: var(--space-8);
  scroll-margin-top: var(--space-4);
  border-radius: var(--radius);
  transition: box-shadow var(--dur) var(--ease);
}

.section.is-highlighted {
  box-shadow: 0 0 0 var(--space-3) var(--bg-elev);
  background: var(--bg-elev);
}

.section__head {
  margin-bottom: var(--space-3);
}

.section__head h2 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: -0.01em;
}
</style>
