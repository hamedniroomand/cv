<script setup lang="ts">
  const STEPS = [
    { icon: '#', name: 'issue' },
    { icon: '≡', name: 'plan' },
    { icon: '>_', name: 'build', active: true },
    { icon: '✓', name: 'review' },
    { icon: '⑂', name: 'PR' },
  ];
</script>

<template>
  <VisualFrame
    class="cue-visual"
    label="Cue workflow: issue, plan, implement, review, pull request"
    title="cue / workflow"
    note="01 — 05"
  >
    <div class="cue-flow">
      <template
        v-for="(step, index) in STEPS"
        :key="step.name"
      >
        <span
          v-if="index > 0"
          class="flow-line"
        />
        <div
          class="cue-node"
          :class="{ 'cue-node--active': step.active }"
        >
          <span class="cue-node__icon">{{ step.icon }}</span
          ><span>{{ step.name }}</span>
        </div>
      </template>
    </div>
    <template #bottom>
      <span><span class="accent">$</span> cue start</span
      ><span>human in the loop <span class="accent">↵</span></span>
    </template>
  </VisualFrame>
</template>
