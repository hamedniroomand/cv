<script setup lang="ts">
import type { ModalKind } from '~/terminal/types'

const { navigate } = usePanelNav()
const { toggle } = useSplitPane()
const { set: setTheme } = useTheme()
const reduced = useReducedMotion()
const bus = useTerminalBus()

const modal = ref<{ kind: ModalKind, resolve: () => void } | null>(null)

const shell = useShell({
  navigate,
  togglePanel: toggle,
  setTheme,
  setLang: () => {},
  openApp: async () => {
    throw new Error('interactive app UI is not mounted')
  },
  openModal: kind => new Promise<void>((resolve) => {
    modal.value = { kind, resolve }
  }),
  destroy: () => {},
})

const booted = ref(false)
const root = ref<HTMLElement | null>(null)
const inputRef = ref<{ focus: () => void } | null>(null)

function focusInput(): void {
  inputRef.value?.focus()
}

function closeModal(): void {
  modal.value?.resolve()
  modal.value = null
  nextTick(focusInput)
}

async function submit(line: string): Promise<void> {
  await shell.run(line)
  nextTick(focusInput)
}

function onCandidates(items: string[]): void {
  shell.print(items.join('  '), 'dim')
}

function onInterrupt(): void {
  if (shell.busy.value)
    shell.abort()
  else
    shell.print('^C', 'dim')
}

async function drainBus(): Promise<void> {
  for (const command of bus.drain())
    await shell.run(command)
}

async function onBoot(): Promise<void> {
  booted.value = true
  await shell.run('whoami', { record: false })
  await drainBus()
  nextTick(focusInput)
}

watch(() => bus.queue.value.length, (n) => {
  if (n > 0 && booted.value)
    drainBus()
})

watch(() => shell.lines.value.length, () => {
  nextTick(() => {
    if (root.value)
      root.value.scrollTop = root.value.scrollHeight
  })
})

function onRootClick(): void {
  if (window.getSelection()?.toString())
    return
  focusInput()
}
</script>

<template>
  <div ref="root" class="terminal" @click="onRootClick">
    <BootSequence v-if="!booted" :skip="reduced" @done="onBoot" />
    <template v-else>
      <TerminalOutput :lines="shell.lines.value" />
      <TerminalInput
        ref="inputRef"
        :prompt="shell.prompt()"
        :busy="shell.busy.value"
        :history="shell.history"
        :complete="shell.complete"
        @submit="submit"
        @candidates="onCandidates"
        @clear="shell.clear"
        @interrupt="onInterrupt"
      />
    </template>
    <ContactModal v-if="modal?.kind === 'contact'" @close="closeModal" />
  </div>
</template>

<style scoped>
.terminal {
  height: 100%;
  padding: var(--space-4);
  overflow-y: auto;
  overscroll-behavior: contain;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.5;
  cursor: text;
}
</style>
