<script setup lang="ts">
// Placeholder until the terminal UI lands. Keeps the layout and lazy-loading wiring testable.
</script>

<template>
  <div class="terminal-stub">
    <span class="terminal-stub__prompt">hamed@hamed.sh:~$</span> whoami
  </div>
</template>

<style scoped>
.terminal-stub {
  padding: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.terminal-stub__prompt {
  color: var(--prompt);
}
</style>
