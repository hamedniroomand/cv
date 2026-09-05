<script setup lang="ts">
  defineProps<{
    path: string;
    command?: string;
  }>();
</script>

<template>
  <div class="head">
    <slot />
    <PathLabel
      :path="path"
      :command="command"
    />
  </div>
</template>

<style scoped>
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2);
  }
</style>
