<script setup lang="ts">
  import { DOTFILES_INDEX } from '#shared/cv/panel-target';

  const route = useRoute();
  const panelLabel = computed(() => (route.path.startsWith(DOTFILES_INDEX) ? 'File' : 'Resume'));
</script>

<template>
  <SiteShell :panel-label="panelLabel">
    <slot />
  </SiteShell>
</template>
