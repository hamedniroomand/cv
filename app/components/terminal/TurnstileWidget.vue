<script setup lang="ts">
  const props = defineProps<{ siteKey: string }>();
  const token = defineModel<string>({ default: '' });

  const el = ref<HTMLElement | null>(null);
  const { reset } = useTurnstile(el, props.siteKey, token);

  defineExpose({ reset });
</script>

<template>
  <div
    ref="el"
    class="turnstile"
  />
</template>

<style scoped>
  .turnstile {
    min-height: 65px;
  }
</style>
