<script setup lang="ts">
  import monoFont from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';

  useHead({
    link: [{ rel: 'preload', as: 'font', type: 'font/woff2', href: monoFont, crossorigin: '' }],
  });
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
