<script setup lang="ts">
  import { projectPath } from '#shared/cv/panel-target';
  import { projectStory } from '#shared/public-site';
  import type { Project } from '#shared/schemas/project';

  const props = defineProps<{ project: Project; index: number }>();

  const path = computed(() => projectPath(props.project.slug));
  const story = computed(() => projectStory(props.project));
  const number = computed(() => String(props.index + 1).padStart(2, '0'));
</script>

<template>
  <article
    :id="`project-${project.slug}`"
    class="project-card"
  >
    <NuxtLink
      :to="path"
      class="project-card__visual"
      :aria-label="`Explore ${project.name}`"
      ><ProjectVisual :slug="project.slug"
    /></NuxtLink>
    <div class="project-card__meta">
      <span>{{ number }} / {{ story.category }}</span
      ><span>{{ project.stack.slice(0, 2).join(' · ') }}</span>
    </div>
    <h3>
      <NuxtLink :to="path">{{ project.name }} <span aria-hidden="true">↗</span></NuxtLink>
    </h3>
    <p>{{ story.headline }}</p>
  </article>
</template>
