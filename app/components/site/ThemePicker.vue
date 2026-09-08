<script setup lang="ts">
  import { THEMES } from '#shared/theme';
  import type { ThemeName } from '#shared/theme';

  const { theme, set } = useTheme();
  const root = ref<HTMLDetailsElement | null>(null);
  const swatches: Record<ThemeName, string[]> = {
    dark: ['#151615', '#eeeae2', '#dcb66d'],
    light: ['#f6f5f2', '#1c1f26', '#8a5a00'],
    gruvbox: ['#282828', '#ebdbb2', '#fabd2f'],
    dracula: ['#282a36', '#bd93f9', '#50fa7b'],
    crt: ['#0a0f0a', '#5fb85f', '#9dff9d'],
  };

  function close(restoreFocus = false): void {
    if (!root.value?.open) return;
    root.value.open = false;
    if (restoreFocus) root.value.querySelector('summary')?.focus();
  }
  function choose(name: ThemeName): void {
    set(name);
    close(true);
  }
  function outside(event: PointerEvent): void {
    if (event.target instanceof Node && !root.value?.contains(event.target)) close();
  }
  onMounted(() => document.addEventListener('pointerdown', outside));
  onBeforeUnmount(() => document.removeEventListener('pointerdown', outside));
</script>

<template>
  <details
    ref="root"
    class="theme-picker"
    @keydown.esc.stop.prevent="close(true)"
  >
    <summary aria-label="Color theme">
      <span
        class="theme-picker__icon"
        aria-hidden="true"
        >◐</span
      >{{ theme
      }}<span
        class="theme-picker__chevron"
        aria-hidden="true"
        >⌄</span
      >
    </summary>
    <div
      class="theme-picker__panel"
      aria-label="Choose a color theme"
    >
      <p>Color theme</p>
      <button
        v-for="name in THEMES"
        :key="name"
        type="button"
        :aria-pressed="theme === name"
        :aria-label="`${name} theme`"
        @click="choose(name)"
      >
        <span
          class="theme-picker__swatches"
          aria-hidden="true"
          ><i
            v-for="color in swatches[name]"
            :key="color"
            :style="{ background: color }"
        /></span>
        <span>{{ name }}</span
        ><span
          class="theme-picker__check"
          aria-hidden="true"
          >{{ theme === name ? '✓' : '' }}</span
        >
      </button>
    </div>
  </details>
</template>

<style scoped>
  .theme-picker {
    position: relative;
    font: 11px var(--font-mono);
  }
  summary {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 8px 10px;
    list-style: none;
    cursor: pointer;
    text-transform: capitalize;
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--fg-dim);
    background: var(--bg-elev);
    transition:
      border-color var(--motion-fast),
      color var(--motion-fast);
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary:hover,
  details[open] summary {
    color: var(--fg);
    border-color: var(--fg-dim);
  }
  .theme-picker__icon {
    font-size: 16px;
    color: var(--accent);
  }
  .theme-picker__chevron {
    margin-left: 4px;
    transition: transform var(--motion-fast);
  }
  details[open] .theme-picker__chevron {
    transform: rotate(180deg);
  }
  .theme-picker__panel {
    position: absolute;
    right: 0;
    top: calc(100% + 10px);
    z-index: 50;
    width: 210px;
    padding: 8px;
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: 9px;
    box-shadow: var(--shadow);
    animation: picker-in var(--motion-fast) ease-out;
  }
  .theme-picker__panel p {
    margin: 5px 8px 9px;
    color: var(--fg-dim);
    font-size: 10px;
  }
  button {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 40px;
    padding: 9px 8px;
    border: 0;
    border-radius: 5px;
    background: transparent;
    text-align: left;
    text-transform: capitalize;
    font: inherit;
    cursor: pointer;
    transition: background-color var(--motion-fast);
  }
  button:hover,
  button[aria-pressed='true'] {
    background: var(--bg-hover);
  }
  .theme-picker__swatches {
    display: flex;
    gap: 3px;
  }
  .theme-picker__swatches i {
    width: 12px;
    height: 16px;
    border-radius: 3px;
    border: 1px solid rgb(128 128 128 / 35%);
  }
  .theme-picker__check {
    margin-left: auto;
    color: var(--accent);
  }
  @keyframes picker-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (max-width: 700px) {
    summary,
    button {
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .theme-picker__panel {
      animation: none;
    }
    summary,
    button,
    .theme-picker__chevron {
      transition: none;
    }
  }
</style>
