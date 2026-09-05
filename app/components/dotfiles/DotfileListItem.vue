<script setup lang="ts">
  import { dotfilePath } from '#shared/cv/panel-target';
  import type { Dotfile } from '#shared/schemas/dotfile';

  defineProps<{ dotfile: Dotfile }>();
</script>

<template>
  <li class="entry">
    <h2 class="entry__title">
      <NuxtLink :to="dotfilePath(dotfile.slug)">{{ dotfile.title }}</NuxtLink>
    </h2>
    <p class="entry__description">{{ dotfile.description }}</p>
    <p class="entry__meta">
      <span>{{ dotfile.path }}</span>
      <span>{{ dotfile.lang }}</span>
    </p>
  </li>
</template>

<style scoped>
  .entry {
    padding: var(--space-4) 0;
    border-top: 1px solid var(--border);
  }

  .entry__title {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    font-weight: 600;
  }

  .entry__title a {
    color: inherit;
    text-decoration: none;
  }

  .entry__title a:hover {
    color: var(--accent);
  }

  .entry__description {
    margin: var(--space-2) 0 0;
  }

  .entry__meta {
    display: flex;
    gap: var(--space-4);
    margin: var(--space-2) 0 0;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-dim);
  }
</style>
