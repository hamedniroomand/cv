<script setup lang="ts">
  import { APP_COMMAND } from '~/tui/types';

  defineProps<{
    status: string;
    escapeLabel: string;
  }>();
  const emit = defineEmits<{ escape: [] }>();

  const { profile } = useCv();
</script>

<template>
  <header class="header">
    <div class="header__text">
      <h2>{{ APP_COMMAND }} 1.0</h2>
      <p>{{ profile.name }} — {{ profile.title }}</p>
      <p class="header__status">
        {{ status }}
      </p>
    </div>
    <button
      type="button"
      class="header__exit"
      @click="emit('escape')"
    >
      {{ escapeLabel }}
    </button>
  </header>
</template>

<style scoped>
  .header {
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--border);
    background: var(--bg-elev);
  }

  .header__text {
    min-width: 0;
  }

  .header h2,
  .header p {
    margin: 0;
    font: inherit;
  }

  .header h2 {
    color: var(--accent);
    font-weight: 700;
  }

  .header__status {
    color: var(--fg-dim);
  }

  .header__exit {
    align-self: start;
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--border);
    background: transparent;
    cursor: pointer;
  }

  .header__exit:hover {
    background: var(--bg-hover);
  }

  @media (max-width: 899px) {
    .header__exit {
      flex-shrink: 0;
      min-width: 44px;
      min-height: 44px;
    }
  }
</style>
