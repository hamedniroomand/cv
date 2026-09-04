<script setup lang="ts">
import type { PickerItem } from '~/tui/types'

interface PickerEntry {
  item: PickerItem<unknown>
  id: string
  key: string
}

const props = defineProps<{
  title: string
  items: PickerItem<unknown>[]
  initial?: unknown
  placeholder?: string
}>()

const emit = defineEmits<{
  select: [value: unknown]
  cancel: []
}>()

const root = ref<HTMLElement | null>(null)
const query = ref('')
const selected = ref(0)
const entries: PickerEntry[] = props.items.map((item, index) => ({
  item,
  id: `tui-picker-option-${index}`,
  key: `picker-option-${index}`,
}))

const filtered = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  if (!needle)
    return entries
  return entries.filter(({ item }) => {
    const searchable = [
      item.label,
      item.description ?? '',
      ...(item.keywords ?? []),
    ].join(' ').toLocaleLowerCase()
    return searchable.includes(needle)
  })
})

const activeId = computed(() => {
  return filtered.value[selected.value]?.id
})

watch(filtered, (items) => {
  if (selected.value >= items.length)
    selected.value = 0
})

function scrollActiveOption(): void {
  nextTick(() => {
    root.value
      ?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  })
}

watch(selected, scrollActiveOption)

function move(delta: number): void {
  if (filtered.value.length === 0)
    return
  selected.value = (selected.value + delta + filtered.value.length) % filtered.value.length
}

function choose(index = selected.value): void {
  const entry = filtered.value[index]
  if (entry)
    emit('select', entry.item.value)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.ctrlKey && !event.altKey && !event.metaKey && event.key.toLocaleLowerCase() === 'c') {
    event.preventDefault()
    emit('cancel')
    return
  }

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      move(-1)
      return
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      return
    case 'Enter':
      event.preventDefault()
      choose()
      return
    case 'Escape':
      event.preventDefault()
      emit('cancel')
      return
    case 'Backspace':
      event.preventDefault()
      query.value = query.value.slice(0, -1)
      selected.value = 0
      return
  }

  if (
    event.key.length === 1
    && !event.ctrlKey
    && !event.altKey
    && !event.metaKey
  ) {
    event.preventDefault()
    query.value += event.key
    selected.value = 0
  }
}

onMounted(() => {
  const initial = filtered.value.findIndex(entry => Object.is(entry.item.value, props.initial))
  if (initial >= 0)
    selected.value = initial
  root.value?.focus()
  scrollActiveOption()
})
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
        :key="entry.key"
        class="picker__option"
        :class="{ 'is-selected': index === selected }"
        role="option"
        :aria-selected="index === selected"
        @mouseenter="selected = index"
        @click="choose(index)"
      >
        <span class="picker__label">{{ entry.item.label }}</span>
        <span v-if="entry.item.description" class="picker__description">{{ entry.item.description }}</span>
      </div>
      <div v-if="filtered.length === 0" class="picker__empty">
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
}

.picker__hint,
.picker__query,
.picker__description,
.picker__empty {
  color: var(--fg-dim);
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
</style>
