<script setup lang="ts">
const props = defineProps<{
  path: string
  command?: string
}>()

const bus = useTerminalBus()
const command = computed(() => props.command ?? `bat ${props.path}`)
</script>

<template>
  <button
    type="button"
    class="path-label"
    :title="`Run \`${command}\` in the terminal`"
    @click="bus.run(command)"
  >
    {{ path }}
  </button>
</template>

<style scoped>
.path-label {
  padding: 0.1rem 0.45rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: transparent;
  color: var(--fg-dim);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: 1.6;
  cursor: pointer;
  transition:
    color var(--dur) var(--ease),
    border-color var(--dur) var(--ease);
}

.path-label:hover {
  color: var(--accent);
  border-color: var(--accent);
}
</style>
