<script setup lang="ts">
  defineProps<{ html: string }>();

  const root = ref<HTMLElement | null>(null);

  function select(): void {
    if (root.value) selectContents(root.value);
  }

  defineExpose({ select });
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div
    ref="root"
    v-html="html"
  />
</template>
