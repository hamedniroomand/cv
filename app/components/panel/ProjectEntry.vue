<script setup lang="ts">
  import { githubUrl, linkLabel, projectUrl } from '#shared/cv/links';
  import { panelTargetId } from '#shared/cv/panel-target';
  import type { Project } from '#shared/schemas/project';

  const props = defineProps<{ project: Project }>();

  const id = computed(() => panelTargetId({ section: 'projects', slug: props.project.slug }));
  const highlighted = usePanelHighlight(id);
  const primary = computed(() => projectUrl(props.project));
  const repo = computed(() => (props.project.repo ? githubUrl(props.project.repo) : null));
  const path = computed(() => `~/projects/${props.project.slug}`);
</script>

<template>
  <article
    :id="id"
    class="project"
    :class="{ 'is-highlighted': highlighted }"
  >
    <PanelHead
      :path="path"
      :command="`bat ${path}/README.md`"
    >
      <h3 class="project__name">
        <a
          :href="primary"
          rel="noopener"
          target="_blank"
          >{{ project.name }}</a
        >
      </h3>
    </PanelHead>
    <p class="project__tagline">
      {{ project.tagline }}
    </p>
    <p class="project__links">
      <a
        v-if="project.site"
        :href="project.site"
        rel="noopener"
        target="_blank"
        >{{ linkLabel(project.site) }}</a
      >
      <a
        v-if="repo"
        :href="repo"
        rel="noopener"
        target="_blank"
        >github.com/{{ project.repo }}</a
      >
      <a
        v-if="project.docs"
        :href="project.docs"
        rel="noopener"
        target="_blank"
        >docs</a
      >
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
