<script setup lang="ts">
import type { CompletionResult } from '~/terminal/shell/completion'
import type { History } from '~/terminal/shell/history'

export interface TerminalInputHandle {
  focus: () => void
  submit: (line?: string) => void
  complete: () => void
  historyUp: () => void
  historyDown: () => void
  interrupt: () => void
  clearLine: () => void
  insert: (text: string) => void
}

const props = defineProps<{
  prompt: string
  busy: boolean
  history: History
  complete: (line: string) => CompletionResult
}>()

const emit = defineEmits<{
  submit: [line: string]
  candidates: [items: string[]]
  clear: []
  interrupt: []
}>()

const value = ref('')
const input = ref<HTMLInputElement | null>(null)
const { up: historyUp, down: historyDown } = usePromptHistory(value, props.history)

function focus(): void {
  input.value?.focus()
}

function submit(line = value.value): void {
  if (props.busy)
    return
  value.value = ''
  emit('submit', line)
}

function complete(): void {
  const result = props.complete(value.value)
  if (result.candidates.length > 1 && result.line === value.value)
    emit('candidates', result.candidates)
  value.value = result.line
}

function interrupt(): void {
  value.value = ''
  emit('interrupt')
}

function clearLine(): void {
  value.value = ''
}

function insert(text: string): void {
  value.value += text
  focus()
}

const controlActions: Record<string, () => void> = {
  l: () => emit('clear'),
  c: interrupt,
  u: clearLine,
}

const keyActions: Record<string, () => void> = {
  Enter: submit,
  Tab: complete,
  ArrowUp: historyUp,
  ArrowDown: historyDown,
}

function onKeydown(event: KeyboardEvent): void {
  const action = isPlainKey(event)
    ? keyActions[event.key]
    : event.ctrlKey && !event.altKey && !event.metaKey ? controlActions[event.key.toLowerCase()] : undefined
  if (!action)
    return
  event.preventDefault()
  action()
}

defineExpose<TerminalInputHandle>({ focus, submit, complete, historyUp, historyDown, interrupt, clearLine, insert })
</script>

<template>
  <label class="input">
    <span class="input__prompt" aria-hidden="true">{{ prompt }}</span>
    <input
      ref="input"
      v-model="value"
      class="input__field"
      type="text"
      inputmode="text"
      aria-label="Terminal input"
      autocapitalize="off"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      enterkeyhint="send"
      @keydown="onKeydown"
    >
  </label>
</template>

<style scoped>
.input {
  display: flex;
  align-items: baseline;
  gap: 0;
  cursor: text;
}

.input__prompt {
  color: var(--prompt);
  white-space: pre;
  flex: none;
}

.input__field {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fg);
  font: inherit;
  caret-color: var(--accent);
  outline: none;
}

@media (max-width: 899px) {
  .input {
    align-items: center;
    min-height: 44px;
    font-size: 1rem;
  }
}
</style>
