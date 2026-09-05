<script setup lang="ts">
  export interface MobileKey {
    id: string;
    label: string;
    aria: string;
    disabled?: boolean;
  }

  defineProps<{
    keys: MobileKey[];
    label: string;
  }>();
  const emit = defineEmits<{ press: [id: string] }>();

  function keepInputFocus(event: PointerEvent): void {
    event.preventDefault();
  }
</script>

<template>
  <div
    class="keys"
    role="toolbar"
    :aria-label="label"
  >
    <button
      v-for="key in keys"
      :key="key.id"
      type="button"
      class="keys__key"
      :aria-label="key.aria"
      :disabled="key.disabled"
      @pointerdown="keepInputFocus"
      @click="emit('press', key.id)"
    >
      {{ key.label }}
    </button>
  </div>
</template>

<style scoped>
  .keys {
    display: none;
  }

  @media (max-width: 899px) {
    .keys {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      padding: var(--space-2) 0 0;
    }

    .keys__key {
      flex: none;
      min-width: 40px;
      min-height: 40px;
      padding: 0 var(--space-2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-elev);
      color: var(--fg);
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      cursor: pointer;
    }

    .keys__key:active {
      background: var(--bg-hover);
      border-color: var(--accent);
    }

    .keys__key:disabled {
      opacity: 0.5;
    }
  }
</style>
