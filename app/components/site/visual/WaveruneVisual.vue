<script setup lang="ts">
  /** One bar per frequency slot. A marked slot carries part of the keyed watermark. */
  const HEIGHTS = [
    14, 22, 36, 30, 52, 44, 68, 58, 82, 64, 92, 74, 100, 70, 88, 60, 76, 48, 62, 40, 54, 34, 46, 28,
    40, 24, 50, 38, 66, 56, 80, 62, 94, 72, 84, 58, 70, 46, 56, 36, 42, 26, 30, 18,
  ];
  const MARKED = new Set([6, 12, 18, 24, 30, 36, 42]);
  const BARS = HEIGHTS.map((height, index) => ({ height, marked: MARKED.has(index) }));
</script>

<template>
  <VisualFrame
    class="waverune-visual"
    label="WaveRune: a keyed watermark spread across the frequency slots of a waveform"
    title="waverune / embed"
    note="hidden data in sound"
  >
    <div class="wave">
      <span
        v-for="(bar, index) in BARS"
        :key="index"
        class="wave-bar"
        :class="{ 'wave-bar--marked': bar.marked }"
        :style="{ '--h': bar.height }"
      />
    </div>
    <template #bottom>
      <span><span class="accent">$</span> waverune detect marked.wav --key ····</span
      ><span>payload 42 <span class="accent">✓</span></span>
    </template>
  </VisualFrame>
</template>
