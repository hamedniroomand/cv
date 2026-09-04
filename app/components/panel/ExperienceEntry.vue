<script setup lang="ts">
import type { Experience } from '#shared/schemas/experience'
import { formatRange } from '#shared/cv/format'
import { panelTargetId } from '#shared/cv/panel-target'

const props = defineProps<{ experience: Experience }>()

const id = computed(() => panelTargetId({ section: 'experience', slug: props.experience.slug }))
const highlighted = usePanelHighlight(id)
const roles = computed(() => [...props.experience.roles].sort((a, b) => b.start.localeCompare(a.start)))
const path = computed(() => `~/experience/${props.experience.slug}`)
</script>

<template>
  <article :id="id" class="entry" :class="{ 'is-highlighted': highlighted }">
    <PanelHead :path="path" :command="`bat ${path}/README.md`">
      <h3 class="entry__company">
        <a v-if="experience.url" :href="experience.url" rel="noopener" target="_blank">{{ experience.company }}</a>
        <template v-else>
          {{ experience.company }}
        </template>
      </h3>
    </PanelHead>
    <dl class="entry__roles">
      <template v-for="role in roles" :key="role.start">
        <dt>{{ formatRange(role.start, role.end) }}</dt>
        <dd>{{ role.title }}</dd>
      </template>
    </dl>
    <p class="entry__meta">
      {{ experience.location }}, {{ experience.type }}
    </p>
    <MarkdownBody :html="experience.html" />
    <ul v-if="experience.highlights.length" class="entry__highlights">
      <li v-for="highlight in experience.highlights" :key="highlight.slug">
        <MarkdownBody :html="highlight.html" />
      </li>
    </ul>
    <StackTags class="entry__stack" :items="experience.stack" />
  </article>
</template>

<style scoped>
.entry {
  padding: var(--space-4) 0;
  scroll-margin-top: var(--space-4);
  border-radius: var(--radius);
  transition:
    background-color var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}

.entry + .entry {
  border-top: 1px solid var(--border);
}

.entry.is-highlighted {
  background: var(--bg-elev);
  box-shadow: 0 0 0 var(--space-3) var(--bg-elev);
}

.entry__company {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 600;
}

.entry__company a {
  color: inherit;
  text-decoration: none;
}

.entry__company a:hover {
  color: var(--accent);
}

.entry__roles {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--space-1) var(--space-4);
  margin: var(--space-3) 0 0;
}

.entry__roles dt {
  color: var(--fg-dim);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  white-space: nowrap;
  line-height: 1.7;
}

.entry__roles dd {
  margin: 0;
  font-weight: 500;
}

.entry__meta {
  margin: var(--space-1) 0 var(--space-3);
  color: var(--fg-dim);
  font-size: var(--text-sm);
}

.entry__highlights {
  margin: var(--space-3) 0 0;
  padding-left: 1.2rem;
}

.entry__highlights li + li {
  margin-top: var(--space-2);
}

.entry__highlights li::marker {
  color: var(--accent);
}

.entry__stack {
  margin-top: var(--space-4);
}
</style>
