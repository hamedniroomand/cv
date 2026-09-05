<script setup lang="ts">
  defineProps<{ id: string; label: string }>();
</script>

<template>
  <section
    :id="id"
    class="panel"
    :aria-label="label"
    tabindex="-1"
  >
    <div
      id="section-top"
      class="panel__inner"
    >
      <slot />
    </div>
  </section>
</template>

<style scoped>
  .panel {
    height: 100%;
    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--bg);
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    .panel {
      scroll-behavior: auto;
    }
  }

  .panel__inner {
    max-width: var(--panel-max-width);
    margin: 0 auto;
    padding: var(--space-8) var(--space-6) var(--space-12);
  }

  @media (max-width: 479px) {
    .panel__inner {
      padding: var(--space-4);
    }
  }
</style>
