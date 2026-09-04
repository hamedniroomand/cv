<script setup lang="ts">
import type { CompletionResult } from '~/terminal/shell/completion'
import type { History } from '~/terminal/shell/history'

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

function focus(): void {
  input.value?.focus()
}

function onKeydown(e: KeyboardEvent): void {
  if (e.ctrlKey && !e.altKey && !e.metaKey) {
    const key = e.key.toLowerCase()
    if (key === 'l') {
      e.preventDefault()
      emit('clear')
      return
    }
    if (key === 'c') {
      e.preventDefault()
      value.value = ''
      emit('interrupt')
      return
    }
    if (key === 'u') {
      e.preventDefault()
      value.value = ''
      return
    }
    return
  }
  switch (e.key) {
    case 'Enter': {
      e.preventDefault()
      if (props.busy)
        return
      const line = value.value
      value.value = ''
      emit('submit', line)
      break
    }
    case 'Tab': {
      e.preventDefault()
      const result = props.complete(value.value)
      if (result.candidates.length > 1 && result.line === value.value)
        emit('candidates', result.candidates)
      value.value = result.line
      break
    }
    case 'ArrowUp': {
      e.preventDefault()
      const prev = props.history.up(value.value)
      if (prev !== null)
        value.value = prev
      break
    }
    case 'ArrowDown': {
      e.preventDefault()
      const next = props.history.down()
      if (next !== null)
        value.value = next
      break
    }
  }
}

defineExpose({ focus })
</script>

<template>
  <label class="input">
    <span class="input__prompt" aria-hidden="true">{{ prompt }}</span>
    <input
      ref="input"
      v-model="value"
      class="input__field"
      type="text"
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
</style>
