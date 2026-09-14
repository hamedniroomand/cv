<script setup lang="ts">
  import type { Component } from 'vue';

  import CpmVisual from './visual/CpmVisual.vue';
  import CueVisual from './visual/CueVisual.vue';
  import KitdevVisual from './visual/KitdevVisual.vue';
  import WaveruneVisual from './visual/WaveruneVisual.vue';

  defineProps<{ slug: string }>();

  const VISUALS: Record<string, Component> = {
    cpm: CpmVisual,
    cue: CueVisual,
    kitdev: KitdevVisual,
    waverune: WaveruneVisual,
  };
</script>

<template>
  <component
    :is="VISUALS[slug]"
    v-if="VISUALS[slug]"
  />
  <VisualFrame
    v-else
    :label="`${slug} project`"
    :title="slug"
  />
</template>
