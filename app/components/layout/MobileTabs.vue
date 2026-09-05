<script setup lang="ts">
  export type ShellTab = 'resume' | 'terminal';

  const tab = defineModel<ShellTab>({ required: true });

  const tabs: { id: ShellTab; label: string }[] = [
    { id: 'resume', label: 'Resume' },
    { id: 'terminal', label: 'Terminal' },
  ];
</script>

<template>
  <nav
    class="tabs"
    role="tablist"
    aria-label="View"
  >
    <button
      v-for="item in tabs"
      :id="`tab-${item.id}`"
      :key="item.id"
      type="button"
      role="tab"
      class="tabs__tab"
      :class="{ 'is-active': tab === item.id }"
      :aria-selected="tab === item.id"
      :aria-controls="item.id"
      @click="tab = item.id"
    >
      {{ item.label }}
    </button>
  </nav>
</template>

<style scoped>
  .tabs {
    display: none;
    position: sticky;
    top: 0;
    z-index: 1;
    height: var(--tabs-height, 3rem);
    min-height: 44px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-elev);
  }

  .tabs__tab {
    flex: 1;
    min-height: 44px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: none;
    color: var(--fg-dim);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    cursor: pointer;
  }

  .tabs__tab.is-active {
    color: var(--fg);
    border-bottom-color: var(--accent);
  }

  @media (max-width: 899px) {
    .tabs {
      display: flex;
    }
  }
</style>
