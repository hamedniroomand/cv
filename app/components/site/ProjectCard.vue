<script setup lang="ts">
  import { projectPath } from '#shared/cv/panel-target';
  import { projectStories } from '#shared/public-site';
  import type { Project } from '#shared/schemas/project';
  defineProps<{ project: Project; index: number }>();
</script>

<template>
  <article
    :id="`project-${project.slug}`"
    class="project-card"
  >
    <NuxtLink
      :to="projectPath(project.slug)"
      class="project-card__visual"
      :aria-label="`Explore ${project.name}`"
      ><ProjectVisual :slug="project.slug"
    /></NuxtLink>
    <div class="project-card__meta">
      <span
        >{{ String(index + 1).padStart(2, '0') }} /
        {{ projectStories[project.slug]?.category ?? 'Project' }}</span
      ><span>{{ project.stack.slice(0, 2).join(' · ') }}</span>
    </div>
    <h3>
      <NuxtLink :to="projectPath(project.slug)"
        >{{ project.name }} <span aria-hidden="true">↗</span></NuxtLink
      >
    </h3>
    <p>{{ projectStories[project.slug]?.headline ?? project.tagline }}</p>
  </article>
</template>
