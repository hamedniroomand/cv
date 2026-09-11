<script setup lang="ts">
  defineProps<{ slug: string }>();

  /** One bar per frequency slot. A marked slot carries part of the keyed watermark. */
  const WAVE_HEIGHTS = [
    14, 22, 36, 30, 52, 44, 68, 58, 82, 64, 92, 74, 100, 70, 88, 60, 76, 48, 62, 40, 54, 34, 46, 28,
    40, 24, 50, 38, 66, 56, 80, 62, 94, 72, 84, 58, 70, 46, 56, 36, 42, 26, 30, 18,
  ];
  const MARKED = new Set([6, 12, 18, 24, 30, 36, 42]);
  const WAVE = WAVE_HEIGHTS.map((height, index) => ({ height, marked: MARKED.has(index) }));
</script>

<template>
  <div
    v-if="slug === 'cue'"
    class="project-visual cue-visual"
    role="img"
    aria-label="Cue workflow: issue, plan, implement, review, pull request"
  >
    <div class="visual-topline">
      <span><i /> cue / workflow</span><span>01 — 05</span>
    </div>
    <div class="cue-flow">
      <div class="cue-node"><span class="cue-node__icon">#</span><span>issue</span></div>
      <span class="flow-line" />
      <div class="cue-node"><span class="cue-node__icon">≡</span><span>plan</span></div>
      <span class="flow-line" />
      <div class="cue-node cue-node--active">
        <span class="cue-node__icon">&gt;_</span><span>build</span>
      </div>
      <span class="flow-line" />
      <div class="cue-node"><span class="cue-node__icon">✓</span><span>review</span></div>
      <span class="flow-line" />
      <div class="cue-node"><span class="cue-node__icon">⑂</span><span>PR</span></div>
    </div>
    <div class="visual-bottomline">
      <span><span class="accent">$</span> cue start</span
      ><span>human in the loop <span class="accent">↵</span></span>
    </div>
  </div>
  <div
    v-else-if="slug === 'waverune'"
    class="project-visual waverune-visual"
    role="img"
    aria-label="WaveRune: a keyed watermark spread across the frequency slots of a waveform"
  >
    <div class="visual-topline">
      <span><i /> waverune / embed</span><span>hidden data in sound</span>
    </div>
    <div class="wave">
      <span
        v-for="(bar, index) in WAVE"
        :key="index"
        class="wave-bar"
        :class="{ 'wave-bar--marked': bar.marked }"
        :style="{ '--h': bar.height }"
      />
    </div>
    <div class="visual-bottomline">
      <span><span class="accent">$</span> waverune detect marked.wav --key ····</span
      ><span>payload 42 <span class="accent">✓</span></span>
    </div>
  </div>
  <div
    v-else
    class="project-visual kitdev-visual"
    role="img"
    aria-label="KitDev Space: six labs for data, crypto, color, network, image, and development tools"
  >
    <div class="visual-topline">
      <span><i /> kitdev.space / toolbox</span><span>six labs, one space</span>
    </div>
    <div class="tool-grid">
      <div><b>{ }</b><span>Data</span></div>
      <div><b>⌘</b><span>Crypto</span></div>
      <div>
        <b class="color-swatches"><i /><i /><i /></b><span>Color</span>
      </div>
      <div><b>↗</b><span>Network</span></div>
      <div><b>▧</b><span>Image</span></div>
      <div><b>&lt;/&gt;</b><span>Dev</span></div>
    </div>
    <div class="visual-bottomline">
      <span>small tools. less friction.</span><span class="accent">↗</span>
    </div>
  </div>
</template>
