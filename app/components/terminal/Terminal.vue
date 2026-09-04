<script setup lang="ts">
import type { MobileKey } from './MobileKeys.vue'
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
interface InputHandle {
  focus: () => void
  submit: (line?: string) => void
  complete: () => void
  historyUp: () => void
  historyDown: () => void
  interrupt: () => void
  clearLine: () => void
  insert: (text: string) => void
}
const inputRef = ref<InputHandle | null>(null)
const isMobile = useMediaQuery('(max-width: 899px)')

const mobileKeys: MobileKey[] = [
  { id: 'tab', label: 'Tab', aria: 'Complete' },
  { id: 'up', label: '↑', aria: 'Previous command' },
  { id: 'down', label: '↓', aria: 'Next command' },
  { id: 'interrupt', label: '^C', aria: 'Interrupt' },
  { id: 'clear', label: 'Clear', aria: 'Clear screen' },
  { id: 'help', label: 'help', aria: 'Run help' },
  { id: 'run', label: 'Run ↵', aria: 'Run command' },
]

function onMobileKey(id: string): void {
  const handle = inputRef.value
  if (!handle)
    return
  switch (id) {
    case 'tab': return handle.complete()
    case 'up': return handle.historyUp()
    case 'down': return handle.historyDown()
    case 'interrupt': return handle.interrupt()
    case 'clear': return shell.clear()
    case 'help': return handle.submit('help')
    case 'run': return handle.submit()
  }
}
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
    <div v-if="!booted" class="terminal__body">
      <BootSequence :skip="reduced" @done="onBoot" />
    </div>
    <template v-else>
      <TuiApp
        v-if="appOpen"
        :bridge="shell.bridge"
        @exit="closeApp"
      />
      <template v-else>
        <div class="terminal__body">
          <TerminalOutput :lines="shell.lines.value" />
        </div>
        <div class="terminal__footer">
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
          <MobileKeys v-if="isMobile" label="Terminal shortcuts" :keys="mobileKeys" @press="onMobileKey" />
        </div>
      </template>
    </template>
    <ContactModal v-if="modal?.kind === 'contact'" @close="closeModal" />
  </div>
</template>

<style scoped>
/*
 * The scroller carries no padding of its own: Safari anchors a sticky element to the
 * scroller's content box, so padding here would leave a gap under the stuck footer where
 * scrolled output shows through. The body and footer pad themselves instead.
 */
.terminal {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.5;
  cursor: text;
}

.terminal--app {
  overflow: hidden;
}

.terminal__body {
  padding: var(--space-4) var(--space-4) 0;
}

.terminal__footer {
  position: sticky;
  bottom: 0;
  padding: 0 var(--space-4) var(--space-4);
  background: var(--bg);
}
</style>
