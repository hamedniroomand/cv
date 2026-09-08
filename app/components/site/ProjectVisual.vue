<script setup lang="ts">
  defineProps<{ slug: string }>();
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
