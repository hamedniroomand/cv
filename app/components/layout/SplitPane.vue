<script setup lang="ts">
  import { clampSplitRatio, SPLIT_DEFAULT, SPLIT_MAX, SPLIT_MIN } from '#shared/split';

  const props = defineProps<{
    ratio: number;
    panelOpen: boolean;
  }>();
  const emit = defineEmits<{ 'update:ratio': [value: number] }>();

  const { splitKeyStep } = useAppConfig().panel;

  const root = ref<HTMLElement | null>(null);
  const dragging = ref(false);
  const percent = computed(() => Math.round(props.ratio * 100));

  function update(value: number): void {
    emit('update:ratio', clampSplitRatio(value));
  }

  function onPointerDown(event: PointerEvent): void {
    if (!root.value) return;
    dragging.value = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent): void {
    if (!dragging.value || !root.value) return;
    const rect = root.value.getBoundingClientRect();
    update((event.clientX - rect.left) / rect.width);
  }

  function onPointerUp(event: PointerEvent): void {
    dragging.value = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  }

  function reset(): void {
    update(SPLIT_DEFAULT);
  }

  function onKeydown(event: KeyboardEvent): void {
    const targets: Record<string, number> = {
      ArrowLeft: props.ratio - splitKeyStep,
      ArrowRight: props.ratio + splitKeyStep,
      Home: SPLIT_MIN,
      End: SPLIT_MAX,
    };
    const next = targets[event.key];
    if (next === undefined) return;
    event.preventDefault();
    update(next);
  }
</script>

<template>
  <div
    ref="root"
    class="split"
    :class="{ 'split--closed': !panelOpen, 'split--dragging': dragging }"
    :style="{ '--split-default': SPLIT_DEFAULT }"
  >
    <div class="split__pane split__pane--left">
      <slot name="left" />
    </div>
    <div
      v-show="panelOpen"
      class="split__divider"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize terminal and resume"
      title="Drag to resize. Double-click to reset."
      aria-controls="resume"
      :aria-valuenow="percent"
      :aria-valuemin="SPLIT_MIN * 100"
      :aria-valuemax="SPLIT_MAX * 100"
      tabindex="0"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @dblclick="reset"
      @keydown="onKeydown"
    />
    <div
      v-show="panelOpen"
      class="split__pane split__pane--right"
    >
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
  .split {
    display: grid;
    grid-template-columns:
      calc(var(--split, var(--split-default)) * 100%) var(--divider-width)
      minmax(0, 1fr);
    height: 100dvh;
    overflow: hidden;
  }

  .split--closed {
    grid-template-columns: 1fr 0 0;
  }

  @media (min-width: 900px) {
    :root[data-panel='closed'] .split {
      grid-template-columns: 1fr 0 0;
    }

    :root[data-panel='closed'] .split__divider {
      display: none;
    }
  }

  .split__pane {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .split__divider {
    position: relative;
    background: var(--border);
    cursor: col-resize;
    touch-action: none;
    transition: background-color var(--dur) var(--ease);
  }

  .split__divider::after {
    content: '';
    position: absolute;
    inset: 0 -4px;
  }

  .split__divider:hover,
  .split--dragging .split__divider,
  .split__divider:focus-visible {
    background: var(--accent);
    outline: none;
  }

  .split--dragging {
    user-select: none;
    cursor: col-resize;
  }

  @media (max-width: 899px) {
    .split,
    .split--closed {
      grid-template-columns: 1fr;
      grid-template-rows: minmax(0, 1fr);
      height: calc(100dvh - var(--tabs-height, 3rem));
    }

    .split__divider {
      display: none;
    }

    .split__pane {
      grid-area: 1 / 1;
    }

    .split[data-tab='resume'] .split__pane--left,
    .split[data-tab='terminal'] .split__pane--right {
      display: none;
    }
  }
</style>
