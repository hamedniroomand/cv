import type { Ref } from 'vue';

const ACTIVE_OPTION = '[role="option"][aria-selected="true"]';

export function useActiveOptionScroll(
  root: Ref<HTMLElement | null>,
  selected: MaybeRefOrGetter<number>,
) {
  function scrollToActive(): void {
    void nextTick(() => {
      root.value?.querySelector<HTMLElement>(ACTIVE_OPTION)?.scrollIntoView({ block: 'nearest' });
    });
  }
  watch(() => toValue(selected), scrollToActive);
  return { scrollToActive };
}

export function useListSelection(length: MaybeRefOrGetter<number>) {
  const selected = ref(0);

  function move(delta: number): void {
    const count = toValue(length);
    if (count === 0) return;
    selected.value = (selected.value + delta + count) % count;
  }

  function reset(): void {
    selected.value = 0;
  }

  watch(
    () => toValue(length),
    count => {
      if (selected.value >= count) reset();
    },
  );

  return { selected, move, reset };
}
