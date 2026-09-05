<script setup lang="ts">
  import { DOTFILES_INDEX } from '#shared/cv/panel-target';
  import type { Dotfile } from '#shared/schemas/dotfile';

  const props = defineProps<{ dotfile: Dotfile }>();

  const crumbs = computed(() => [
    { label: '~', to: '/' },
    { label: 'dotfiles', to: DOTFILES_INDEX },
    { label: props.dotfile.slug },
  ]);
</script>

<template>
  <PanelFrame
    id="dotfile"
    :label="dotfile.title"
  >
    <PanelCrumbs :items="crumbs" />
    <PanelHead
      class="dotfile__head"
      :path="dotfile.path"
      :command="`cat ${dotfile.path}`"
    >
      <h1 class="dotfile__title">{{ dotfile.title }}</h1>
    </PanelHead>
    <p class="dotfile__description">{{ dotfile.description }}</p>
    <DotfileCard :dotfile="dotfile" />
  </PanelFrame>
</template>

<style scoped>
  .dotfile__head {
    margin-top: var(--space-4);
  }

  .dotfile__title {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-xl);
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .dotfile__description {
    margin: var(--space-2) 0 0;
    color: var(--fg-dim);
  }
</style>
