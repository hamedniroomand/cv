<script setup lang="ts">
  const LABS = [
    { icon: '{ }', name: 'Data' },
    { icon: '⌘', name: 'Crypto' },
    { name: 'Color' },
    { icon: '↗', name: 'Network' },
    { icon: '▧', name: 'Image' },
    { icon: '</>', name: 'Dev' },
  ];
</script>

<template>
  <VisualFrame
    class="kitdev-visual"
    label="KitDev Space: six labs for data, crypto, color, network, image, and development tools"
    title="kitdev.space / toolbox"
    note="six labs, one space"
  >
    <div class="tool-grid">
      <div
        v-for="lab in LABS"
        :key="lab.name"
      >
        <b v-if="lab.icon">{{ lab.icon }}</b>
        <b
          v-else
          class="color-swatches"
          ><i /><i /><i
        /></b>
        <span>{{ lab.name }}</span>
      </div>
    </div>
    <template #bottom>
      <span>small tools. less friction.</span><span class="accent">↗</span>
    </template>
  </VisualFrame>
</template>
