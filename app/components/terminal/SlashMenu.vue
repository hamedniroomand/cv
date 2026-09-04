<script setup lang="ts">
import type { SlashMenuItem } from '~/composables/useSlashMenu'
import { slashOptionId } from '~/tui/slash'

const props = defineProps<{
  items: SlashMenuItem[]
  selected: number
}>()

const emit = defineEmits<{
  select: [index: number]
  highlight: [index: number]
}>()

const root = ref<HTMLElement | null>(null)
useActiveOptionScroll(root, () => props.selected)
</script>

<template>
  <div
    id="tui-slash-listbox"
    ref="root"
    class="slash-menu"
    role="listbox"
    aria-label="Slash commands"
  >
    <div
      v-for="(item, index) in items"
      :id="slashOptionId(item.key)"
      :key="item.key"
      class="slash-menu__option"
      :class="{ 'is-selected': index === selected }"
      role="option"
      :aria-selected="index === selected"
      @mouseenter="emit('highlight', index)"
      @click="emit('select', index)"
    >
      <span class="slash-menu__name">{{ item.label }}</span>
      <span v-if="item.detail" class="slash-menu__detail">{{ item.detail }}</span>
      <span v-if="item.description" class="slash-menu__description">{{ item.description }}</span>
    </div>
    <div v-if="items.length === 0" class="slash-menu__empty">
      No matches
    </div>
  </div>
</template>

<style scoped>
.slash-menu {
  max-height: min(18rem, 42vh);
  overflow-y: auto;
  border: 1px solid var(--border);
  background: var(--bg-elev);
}

.slash-menu__option {
  display: grid;
  grid-template-columns: max-content max-content minmax(0, 1fr);
  gap: var(--space-2);
  min-height: 2rem;
  padding: var(--space-1) var(--space-3);
  border-left: 2px solid transparent;
  cursor: pointer;
}

.slash-menu__option.is-selected {
  border-left-color: var(--accent);
  background: var(--bg-hover);
}

.slash-menu__name {
  color: var(--accent);
}

.slash-menu__detail,
.slash-menu__description,
.slash-menu__empty {
  color: var(--fg-dim);
}

.slash-menu__description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slash-menu__empty {
  padding: var(--space-2) var(--space-3);
}

@media (max-width: 899px) {
  .slash-menu__option {
    min-height: 44px;
    align-items: center;
  }
}
</style>
