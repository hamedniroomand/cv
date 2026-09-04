<script setup lang="ts">
import type { OutputLine, Span } from '~/terminal/types'
import type { AppBridge } from '~/tui/bridge'
import type { AppCommand, AppContext, PickerItem, View } from '~/tui/types'
import { LineWriter } from '~/terminal/io/writer'
import { History } from '~/terminal/shell/history'
import { createAppRunner } from '~/tui/runner'
import { filterCommands, parseSlashInput } from '~/tui/slash'

interface MenuItem {
  key: string
  label: string
  detail?: string
  description?: string
  completion: string
  runLine: string
}

interface PickerState {
  title: string
  items: PickerItem<unknown>[]
  initial?: unknown
  placeholder?: string
  resolve: (value: unknown | null) => void
}

const props = defineProps<{ bridge: AppBridge }>()
const emit = defineEmits<{ exit: [] }>()

const lines = ref<OutputLine[]>([])
const value = ref('')
const status = ref('Type / for commands · ↑↓ to choose · Esc to leave')
const busy = ref(false)
const selected = ref(0)
const menuSuppressed = ref(false)
const picker = ref<PickerState | null>(null)
const input = ref<HTMLInputElement | null>(null)
const output = ref<HTMLElement | null>(null)
const history = new History()
let nextId = 0
let controller: AbortController | null = null
let exited = false

function sink(line: OutputLine): void {
  lines.value.push(line)
}
const getNextId = (): number => ++nextId

function print(spans: Span[] | string, style?: OutputLine['spans'][number]['style']): void {
  const writer = new LineWriter(sink, getNextId, style)
  if (typeof spans === 'string') {
    if (spans.length === 0)
      writer.line()
    else
      writer.write(spans)
  }
  else if (spans.length === 0) {
    writer.line()
  }
  else {
    writer.raw(spans)
  }
  writer.flush()
}

function focusPrompt(): void {
  input.value?.focus()
}

function settlePicker(result: unknown | null): void {
  const current = picker.value
  if (!current)
    return
  picker.value = null
  current.resolve(result)
  nextTick(focusPrompt)
}

function pick<T>(
  title: string,
  items: PickerItem<T>[],
  opts: { initial?: T, placeholder?: string } = {},
): Promise<T | null> {
  settlePicker(null)
  return new Promise<T | null>((resolve) => {
    picker.value = {
      title,
      items: items as PickerItem<unknown>[],
      initial: opts.initial,
      placeholder: opts.placeholder,
      resolve: result => resolve(result as T | null),
    }
  })
}

function exit(): void {
  if (exited)
    return
  exited = true
  controller?.abort()
  settlePicker(null)
  emit('exit')
}

const view: View = {
  print,
  clear: () => {
    lines.value = []
  },
  pick,
  status: (text) => {
    status.value = text
  },
  exit,
}

function runShell(
  line: string,
  signal: AbortSignal,
): Promise<number> {
  return props.bridge.exec(line, sink, getNextId, signal)
}

const runner = createAppRunner({
  registry: props.bridge.registry,
  context: { ...props.bridge.context, view },
  shell: runShell,
})

function completionContext(command: AppCommand): AppContext {
  const signal = controller?.signal ?? new AbortController().signal
  return {
    ...props.bridge.context,
    argv0: `/${command.name}`,
    registry: props.bridge.registry,
    sudo: false,
    signal,
    view,
    shell: line => runShell(line, signal),
    slash: line => runner.run(line, signal),
  }
}

function matchesPickerItem(item: PickerItem, query: string): boolean {
  if (!query)
    return true
  const searchable = [
    item.label,
    item.description ?? '',
    ...(item.keywords ?? []),
  ].join(' ').toLocaleLowerCase()
  return searchable.includes(query.toLocaleLowerCase())
}

const parsed = computed(() => parseSlashInput(value.value))

const showMenu = computed(() => {
  if (picker.value || menuSuppressed.value || !parsed.value)
    return false
  if (parsed.value.partial)
    return true
  return Boolean(props.bridge.registry.get(parsed.value.name)?.complete)
})

function onEscape(): void {
  if (picker.value) {
    settlePicker(null)
    return
  }
  if (showMenu.value) {
    menuSuppressed.value = true
    nextTick(focusPrompt)
    return
  }
  if (!value.value)
    exit()
}

const escapeLabel = computed(() => {
  if (picker.value)
    return 'Esc · cancel'
  if (showMenu.value)
    return 'Esc · close menu'
  return 'Esc · exit'
})

const menuItems = computed<MenuItem[]>(() => {
  const slash = parsed.value
  if (!showMenu.value || !slash)
    return []

  if (slash.partial) {
    return filterCommands(slash.name, props.bridge.registry.list()).map(command => ({
      key: command.name,
      label: `/${command.name}`,
      detail: command.args,
      description: command.description,
      completion: `/${command.name}${command.args ? ' ' : ''}`,
      runLine: `/${command.name}`,
    }))
  }

  const command = props.bridge.registry.get(slash.name)
  const choices = command?.complete?.(slash.argv, completionContext(command))
  if (!command || !choices)
    return []

  const query = value.value.endsWith(' ') ? '' : (slash.argv.at(-1) ?? '')
  return choices
    .filter(item => matchesPickerItem(item, query))
    .map(item => ({
      key: `argument-${String(item.value)}`,
      label: item.label,
      description: item.description,
      completion: `/${command.name} ${String(item.value)}`,
      runLine: `/${command.name} ${String(item.value)}`,
    }))
})

const activeMenuId = computed(() => {
  const item = menuItems.value[selected.value]
  if (!showMenu.value || !item)
    return undefined
  const key = item.key.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `tui-slash-option-${key}`
})

watch(value, () => {
  selected.value = 0
})

watch(() => lines.value.length, () => {
  nextTick(() => {
    if (output.value)
      output.value.scrollTop = output.value.scrollHeight
  })
})

function moveMenu(delta: number): void {
  if (menuItems.value.length === 0)
    return
  selected.value = (selected.value + delta + menuItems.value.length) % menuItems.value.length
}

async function submitLine(line = value.value): Promise<void> {
  if (busy.value)
    return
  const submitted = line
  value.value = ''
  menuSuppressed.value = false
  if (!submitted.trim())
    return

  history.push(submitted)
  busy.value = true
  controller = new AbortController()
  try {
    await runner.run(submitted, controller.signal)
  }
  finally {
    busy.value = false
    controller = null
    nextTick(focusPrompt)
  }
}

function activateMenu(index: number): void {
  const item = menuItems.value[index]
  if (!item)
    return
  void submitLine(item.runLine)
}

function completeMenu(): void {
  const item = menuItems.value[selected.value]
  if (item) {
    value.value = item.completion
    menuSuppressed.value = false
  }
}

function onInput(): void {
  menuSuppressed.value = false
}

function onAppKeydown(event: KeyboardEvent): void {
  if (
    event.ctrlKey
    && !event.altKey
    && !event.metaKey
    && event.key.toLocaleLowerCase() === 'l'
  ) {
    event.preventDefault()
    event.stopPropagation()
    view.clear()
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.ctrlKey && !event.altKey && !event.metaKey) {
    switch (event.key.toLocaleLowerCase()) {
      case 'c':
        event.preventDefault()
        if (controller)
          controller.abort()
        value.value = ''
        menuSuppressed.value = true
        return
      case 'd':
        if (!value.value && !showMenu.value) {
          event.preventDefault()
          exit()
        }
        return
    }
  }

  if (showMenu.value) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        moveMenu(-1)
        return
      case 'ArrowDown':
        event.preventDefault()
        moveMenu(1)
        return
      case 'Tab':
        event.preventDefault()
        completeMenu()
        return
      case 'Enter':
        if (menuItems.value.length > 0) {
          event.preventDefault()
          activateMenu(selected.value)
          return
        }
        break
      case 'Escape':
        event.preventDefault()
        onEscape()
        return
    }
  }

  switch (event.key) {
    case 'Enter':
      event.preventDefault()
      void submitLine()
      return
    case 'Escape':
      event.preventDefault()
      onEscape()
      return
    case 'ArrowUp': {
      event.preventDefault()
      const previous = history.up(value.value)
      if (previous !== null)
        value.value = previous
      return
    }
    case 'ArrowDown': {
      event.preventDefault()
      const next = history.down()
      if (next !== null)
        value.value = next
    }
  }
}

print('Welcome. Try /experience to browse companies, /skills for the stack,')
print('or /pdf to grab the one-pager.')

onMounted(() => {
  focusPrompt()
})
</script>

<template>
  <section class="tui" aria-label="Interactive app" @keydown.capture="onAppKeydown">
    <header class="tui__header">
      <div>
        <h2>hamed 1.0</h2>
        <p>Hamed Niroomand — Frontend Team Lead / Senior TypeScript Engineer</p>
        <p class="tui__status">
          {{ status }}
        </p>
      </div>
      <button type="button" class="tui__exit" @click="onEscape">
        {{ escapeLabel }}
      </button>
    </header>

    <div
      ref="output"
      class="tui__output"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="App output"
    >
      <div v-for="line in lines" :key="line.id" class="tui__line">
        <template v-for="(span, index) in line.spans" :key="index">
          <a
            v-if="span.href"
            :href="span.href"
            :class="`s-${span.style ?? 'accent'}`"
            target="_blank"
            rel="noopener"
          >{{ span.text }}</a>
          <span v-else :class="span.style ? `s-${span.style}` : undefined">{{ span.text }}</span>
        </template>
      </div>
    </div>

    <Picker
      v-if="picker"
      :title="picker.title"
      :items="picker.items"
      :initial="picker.initial"
      :placeholder="picker.placeholder"
      @select="settlePicker"
      @cancel="settlePicker(null)"
    />

    <footer v-else class="tui__prompt-area">
      <SlashMenu
        v-if="showMenu"
        :items="menuItems"
        :selected="selected"
        @highlight="selected = $event"
        @select="activateMenu"
      />
      <label class="tui__prompt">
        <span aria-hidden="true">› </span>
        <input
          id="tui-app-prompt"
          ref="input"
          v-model="value"
          role="combobox"
          class="tui__input"
          type="text"
          aria-label="App command"
          aria-autocomplete="list"
          :aria-busy="busy"
          :aria-controls="showMenu ? 'tui-slash-listbox' : undefined"
          :aria-expanded="showMenu"
          :aria-activedescendant="activeMenuId"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          enterkeyhint="send"
          @input="onInput"
          @keydown="onKeydown"
        >
      </label>
    </footer>
  </section>
</template>

<style scoped>
.tui {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  height: 100%;
  min-height: 0;
  border: 1px solid var(--border);
  background: var(--bg);
  font-family: var(--font-mono);
}

.tui__header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border);
  background: var(--bg-elev);
}

.tui__header > div {
  min-width: 0;
}

.tui__header h2,
.tui__header p {
  margin: 0;
  font: inherit;
}

.tui__header h2 {
  color: var(--accent);
  font-weight: 700;
}

.tui__status {
  color: var(--fg-dim);
}

.tui__exit {
  align-self: start;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
}

.tui__exit:hover {
  background: var(--bg-hover);
}

.tui__output {
  min-height: 0;
  padding: var(--space-4);
  overflow-y: auto;
  overscroll-behavior: contain;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.tui__line {
  min-height: 1.5em;
}

.tui__prompt-area {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--border);
  background: var(--bg);
}

.tui__prompt {
  display: flex;
  align-items: baseline;
}

.tui__prompt > span {
  color: var(--prompt);
}

.tui__input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--fg);
  font: inherit;
  caret-color: var(--accent);
}

.s-dim {
  color: var(--fg-dim);
}

.s-accent {
  color: var(--accent);
}

.s-error {
  color: var(--error);
}

.s-success {
  color: var(--success);
}

.s-prompt {
  color: var(--prompt);
}

.s-pre {
  white-space: pre;
}

@media (max-width: 899px) {
  .tui__exit {
    flex-shrink: 0;
    min-width: 44px;
    min-height: 44px;
  }

  .tui__input {
    min-height: 44px;
  }
}
</style>
