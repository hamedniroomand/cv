<script setup lang="ts">
  defineProps<{ label: string; title: string; note?: string }>();
</script>

<template>
  <div
    class="project-visual"
    role="img"
    :aria-label="label"
  >
    <div class="visual-topline">
      <span><i /> {{ title }}</span
      ><span v-if="note">{{ note }}</span>
    </div>
    <slot />
    <div
      v-if="$slots.bottom"
      class="visual-bottomline"
    >
      <slot name="bottom" />
    </div>
  </div>
</template>
