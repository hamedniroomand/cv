<script setup lang="ts">
  import type { NuxtError } from '#app';
  import { siteHost } from '#shared/site-host';

  const props = defineProps<{ error: NuxtError }>();
  const route = useRoute();
  const host = siteHost(useRuntimeConfig().public.siteUrl);
  const message = computed(() =>
    props.error.statusCode === 404 ? 'No such file or directory' : 'Something went wrong',
  );
</script>

<template>
  <main class="error">
    <p class="error__prompt">hamed@{{ host }}:~$ open {{ route.fullPath }}</p>
    <p class="error__message">bash: {{ route.fullPath }}: {{ message }} ({{ error.status }})</p>
    <p>
      <a
        href="/"
        @click.prevent="clearError({ redirect: '/' })"
        >cd ~</a
      >
    </p>
  </main>
</template>

<style scoped>
  .error {
    min-height: 100dvh;
    padding: var(--space-8) var(--space-6);
    font-family: var(--font-mono);
  }

  .error__prompt {
    margin: 0;
    color: var(--prompt);
  }

  .error__message {
    margin: var(--space-2) 0 var(--space-6);
    color: var(--error);
  }
</style>
