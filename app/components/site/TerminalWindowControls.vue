<script setup lang="ts">
  defineProps<{ maximized: boolean; minimized: boolean }>();
  defineEmits<{ minimize: []; toggleMaximize: []; close: [] }>();
</script>

<template>
  <div class="window-controls">
    <button
      type="button"
      class="window-controls__button"
      :aria-label="minimized ? 'Restore terminal' : 'Minimize terminal'"
      @click="$emit('minimize')"
    >
      <svg
        viewBox="0 0 10 10"
        aria-hidden="true"
      >
        <path :d="minimized ? 'M1 6.5h8M5 1v3.5' : 'M1 5h8'" />
      </svg>
    </button>
    <button
      type="button"
      class="window-controls__button"
      :aria-label="maximized ? 'Restore terminal size' : 'Maximize terminal'"
      @click="$emit('toggleMaximize')"
    >
      <svg
        viewBox="0 0 10 10"
        aria-hidden="true"
      >
        <rect
          v-if="!maximized"
          x="1"
          y="1"
          width="8"
          height="8"
          rx="1.5"
        />
        <template v-else>
          <rect
            x="1"
            y="3"
            width="6"
            height="6"
            rx="1.5"
          />
          <path d="M3.5 1H9v5.5" />
        </template>
      </svg>
    </button>
    <button
      type="button"
      class="window-controls__button window-controls__button--close"
      aria-label="Close terminal"
      @click="$emit('close')"
    >
      <svg
        viewBox="0 0 10 10"
        aria-hidden="true"
      >
        <path d="M2 2l6 6M8 2l-6 6" />
      </svg>
    </button>
  </div>
</template>
