<script setup lang="ts">
  import { projectActions } from '#shared/cv/project-actions';
  import type { LinkableProject } from '#shared/cv/project-actions';

  const props = defineProps<{ project: LinkableProject }>();
  const actions = computed(() => projectActions(props.project));
</script>

<template>
  <div class="project-page__actions">
    <a
      v-for="action in actions"
      :key="action.kind"
      :href="action.href"
      class="btn"
      :class="{ 'btn-ghost': action.variant === 'secondary' }"
      target="_blank"
      rel="noopener"
    >
      <GithubIcon v-if="action.kind === 'repo'" />
      {{ action.label }} <span aria-hidden="true">↗</span>
    </a>
  </div>
</template>
