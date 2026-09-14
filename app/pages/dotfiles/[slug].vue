<script setup lang="ts">
  import { dotfileDir } from '#shared/cv/dotfiles';

  const route = useRoute();
  const dotfile = useCv().dotfiles.find(entry => entry.slug === String(route.params.slug));
  if (!dotfile) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true });
  }

  useDotfileSeo(dotfile);
  useTerminalCwd().value = dotfileDir(dotfile.path);
</script>

<template>
  <DotfilePanel :dotfile="dotfile" />
</template>
