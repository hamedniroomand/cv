<script setup lang="ts">
import type { Project } from '#shared/schemas/project'
import { githubUrl } from '#shared/cv/links'
import { panelTargetId } from '#shared/cv/panel-target'

const props = defineProps<{ project: Project }>()

const id = computed(() => panelTargetId({ section: 'projects', slug: props.project.slug }))
const highlighted = usePanelHighlight(id)
const repo = computed(() => githubUrl(props.project.repo))
const path = computed(() => `~/projects/${props.project.slug}`)
</script>

<template>
  <article :id="id" class="project" :class="{ 'is-highlighted': highlighted }">
    <PanelHead :path="path" :command="`bat ${path}/README.md`">
      <h3 class="project__name">
        <a :href="repo" rel="noopener" target="_blank">{{ project.name }}</a>
      </h3>
    </PanelHead>
    <p class="project__tagline">
      {{ project.tagline }}
    </p>
    <p class="project__links">
      <a :href="repo" rel="noopener" target="_blank">github.com/{{ project.repo }}</a>
      <a v-if="project.docs" :href="project.docs" rel="noopener" target="_blank">docs</a>
    </p>
    <StackTags :items="project.stack" />
  </article>
</template>

<style scoped>
.project {
  padding: var(--space-3) 0;
  scroll-margin-top: var(--space-4);
  border-radius: var(--radius);
}

.project.is-highlighted {
  box-shadow: 0 0 0 var(--space-3) var(--bg-elev);
  background: var(--bg-elev);
}

.project__name {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 600;
}

.project__name a {
  color: inherit;
  text-decoration: none;
}

.project__name a:hover {
  color: var(--accent);
}

.project__tagline {
  margin: var(--space-2) 0 0;
}

.project__links {
  display: flex;
  gap: var(--space-4);
  margin: var(--space-2) 0 0;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}
</style>
