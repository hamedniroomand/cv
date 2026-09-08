<script setup lang="ts">
  import type { NuxtError } from '#app';
  import { siteHost } from '#shared/site-host';
  const props = defineProps<{ error: NuxtError }>();
  const route = useRoute();
  const host = siteHost(useRuntimeConfig().public.siteUrl);
  const missing = computed(() => props.error.statusCode === 404);
</script>

<template>
  <main class="error-page">
    <p class="error-page__brand">hamed <span>/ niroomand.dev</span></p>
    <div class="error-page__content">
      <p class="eyebrow">
        {{ error.statusCode }} / {{ missing ? 'NOT FOUND' : 'SOMETHING WENT WRONG' }}
      </p>
      <h1>{{ missing ? 'A little off the path.' : 'That didn’t go to plan.' }}</h1>
      <p class="error-page__lede">
        {{
          missing
            ? 'This page doesn’t live here. There’s still plenty to explore back at the workshop.'
            : 'Try again in a moment, or head back to the workshop.'
        }}
      </p>
      <p class="error-page__prompt">hamed@{{ host }}:~$ open {{ route.fullPath }}</p>
      <a
        class="btn"
        href="/"
        @click.prevent="clearError({ redirect: '/' })"
        >← Back to the workshop</a
      >
    </div>
    <span
      class="error-page__code"
      aria-hidden="true"
      >{{ error.statusCode }}</span
    >
  </main>
</template>

<style scoped>
  .error-page {
    min-height: 100dvh;
    max-width: 1200px;
    margin: auto;
    padding: 36px clamp(24px, 6vw, 80px);
    position: relative;
    isolation: isolate;
    overflow: hidden;
  }
  .error-page__brand {
    font: 12px var(--font-mono);
  }
  .error-page__brand span {
    color: var(--fg-dim);
  }
  .error-page__content {
    max-width: 610px;
    padding: clamp(80px, 16vh, 180px) 0;
  }
  h1 {
    font-size: clamp(40px, 6vw, 66px);
    line-height: 1.1;
    letter-spacing: -2px;
    font-weight: 500;
    margin: 22px 0;
  }
  .error-page__lede {
    color: var(--fg-dim);
    line-height: 1.8;
    max-width: 430px;
  }
  .error-page__prompt {
    font: 11px var(--font-mono);
    color: var(--accent);
    margin: 32px 0;
    overflow-wrap: anywhere;
  }
  .error-page__code {
    position: absolute;
    z-index: -1;
    right: 0;
    bottom: 0;
    font: clamp(150px, 30vw, 380px) var(--font-mono);
    color: var(--border);
    opacity: 0.5;
  }
</style>
