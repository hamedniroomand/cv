<script setup lang="ts">
  import { pickerItemMatches } from '~/tui/picker';
  import type { PickerItem } from '~/tui/types';

  interface PickerEntry {
    item: PickerItem<unknown>;
    id: string;
  }

  const props = defineProps<{
    title: string;
    items: PickerItem<unknown>[];
    initial?: unknown;
    placeholder?: string;
  }>();

  const emit = defineEmits<{
    select: [value: unknown];
    cancel: [];
  }>();

  const root = ref<HTMLElement | null>(null);
  const query = ref('');
  const entries: PickerEntry[] = props.items.map((item, index) => ({
    item,
    id: `tui-picker-option-${index}`,
  }));

  const filtered = computed(() =>
    entries.filter(entry => pickerItemMatches(entry.item, query.value)),
  );
  const { selected, move, reset } = useListSelection(() => filtered.value.length);
  const { scrollToActive } = useActiveOptionScroll(root, selected);
  const activeId = computed(() => filtered.value[selected.value]?.id);

  function choose(index = selected.value): void {
    const entry = filtered.value[index];
    if (entry) emit('select', entry.item.value);
  }

  function editQuery(next: string): void {
    query.value = next;
    reset();
  }

  const keyActions: Record<string, () => void> = {
    ArrowUp: () => move(-1),
    ArrowDown: () => move(1),
    Enter: () => choose(),
    Escape: () => emit('cancel'),
    Backspace: () => editQuery(query.value.slice(0, -1)),
  };

  function onKeydown(event: KeyboardEvent): void {
    if (isControlKey(event, 'c')) {
      event.preventDefault();
      emit('cancel');
      return;
    }
    const action = keyActions[event.key];
    if (action) {
      event.preventDefault();
      action();
      return;
    }
    if (event.key.length === 1 && isPlainKey(event)) {
      event.preventDefault();
      editQuery(query.value + event.key);
    }
  }

  onMounted(() => {
    const initial = filtered.value.findIndex(entry => Object.is(entry.item.value, props.initial));
    if (initial >= 0) selected.value = initial;
    root.value?.focus();
    scrollToActive();
  });
</script>

<template>
  <section class="picker">
    <div class="picker__header">
      <strong>{{ title }}</strong>
      <span class="picker__hint">Type to filter · ↑↓ choose · Enter select · Esc cancel</span>
    </div>
    <div class="picker__query">
      <span aria-hidden="true">› </span>
      <span>{{ query || placeholder || 'Filter' }}</span>
    </div>
    <div
      id="tui-picker-listbox"
      ref="root"
      class="picker__list"
      role="listbox"
      :aria-label="title"
      :aria-activedescendant="activeId"
      tabindex="0"
      @keydown="onKeydown"
    >
      <div
        v-for="(entry, index) in filtered"
        :id="entry.id"
        :key="entry.id"
        class="picker__option"
        :class="{ 'is-selected': index === selected }"
        role="option"
        :aria-selected="index === selected"
        @mouseenter="selected = index"
        @click="choose(index)"
      >
        <span class="picker__label">{{ entry.item.label }}</span>
        <span
          v-if="entry.item.description"
          class="picker__description"
          >{{ entry.item.description }}</span
        >
      </div>
      <div
        v-if="filtered.length === 0"
        class="picker__empty"
      >
        No matches
      </div>
    </div>
  </section>
</template>

<style scoped>
  .picker {
    min-height: 0;
    border: 1px solid var(--border);
    background: var(--bg-elev);
  }

  .picker__header,
  .picker__query {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--border);
  }

  .picker__header {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .picker__hint,
  .picker__query,
  .picker__description,
  .picker__empty {
    color: var(--fg-dim);
  }

  .picker__hint {
    min-width: 0;
  }

  .picker__query > span:first-child {
    color: var(--prompt);
  }

  .picker__list {
    max-height: min(22rem, 55vh);
    overflow-y: auto;
    outline: none;
  }

  .picker__option {
    display: grid;
    grid-template-columns: minmax(10rem, max-content) minmax(0, 1fr);
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-left: 2px solid transparent;
    cursor: pointer;
  }

  .picker__option.is-selected {
    border-left-color: var(--accent);
    background: var(--bg-hover);
  }

  .picker__label {
    color: var(--accent);
  }

  .picker__description {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .picker__empty {
    padding: var(--space-3);
  }

  @media (max-width: 899px) {
    .picker__option {
      min-height: 44px;
      align-items: center;
    }
  }
</style>
