<script setup lang="ts">
import type { ModalKind } from '~/terminal/types'

const { navigate } = usePanelNav()
const { toggle } = useSplitPane()
const { set: setTheme } = useTheme()
const reduced = useReducedMotion()
const bus = useTerminalBus()

const modal = ref<{ kind: ModalKind, resolve: () => void } | null>(null)
const appOpen = ref(false)
let appPromise: Promise<void> | null = null
let resolveApp: (() => void) | null = null

function openApp(): Promise<void> {
  if (appPromise)
    return appPromise
  appOpen.value = true
  appPromise = new Promise<void>((resolve) => {
    resolveApp = resolve
  })
  return appPromise
}

const shell = useShell({
  navigate,
  togglePanel: toggle,
  setTheme,
  setLang: () => {},
  openApp,
  openModal: kind => new Promise<void>((resolve) => {
    modal.value = { kind, resolve }
  }),
  destroy: () => {},
})

const booted = ref(false)
const root = ref<HTMLElement | null>(null)
const inputRef = ref<{ focus: () => void } | null>(null)
const terminalHeight = ref<string>()

function focusInput(): void {
  inputRef.value?.focus()
}

function scrollToBottom(): void {
  if (root.value)
    root.value.scrollTop = root.value.scrollHeight
}

function syncVisualViewport(): void {
  if (typeof window === 'undefined' || !window.visualViewport || !root.value)
    return

  const top = root.value.getBoundingClientRect().top
  terminalHeight.value = `${Math.max(0, window.visualViewport.height - top)}px`
  nextTick(() => requestAnimationFrame(scrollToBottom))
}

function closeModal(): void {
  modal.value?.resolve()
  modal.value = null
  nextTick(focusInput)
}

function closeApp(): void {
  if (!appOpen.value)
    return
  appOpen.value = false
  resolveApp?.()
  resolveApp = null
  appPromise = null
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
  nextTick(scrollToBottom)
})

function onRootClick(): void {
  if (appOpen.value)
    return
  if (window.getSelection()?.toString())
    return
  focusInput()
}

onMounted(() => {
  if (typeof window === 'undefined' || !window.visualViewport)
    return
  window.visualViewport.addEventListener('resize', syncVisualViewport)
  syncVisualViewport()
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined' || !window.visualViewport)
    return
  window.visualViewport.removeEventListener('resize', syncVisualViewport)
})
</script>

<template>
  <div
    ref="root"
    class="terminal"
    :class="{ 'terminal--app': appOpen }"
    :style="{ height: terminalHeight }"
    @click="onRootClick"
  >
    <BootSequence v-if="!booted" :skip="reduced" @done="onBoot" />
    <template v-else>
      <TuiApp
        v-if="appOpen"
        :bridge="shell.bridge"
        @exit="closeApp"
      />
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

.terminal--app {
  padding: 0;
  overflow: hidden;
}
</style>
