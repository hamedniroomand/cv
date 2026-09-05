<script setup lang="ts">
  import type { MobileKey } from './MobileKeys.vue';
  import type { TerminalInputHandle } from './TerminalInput.vue';

  const MOBILE_KEYS: MobileKey[] = [
    { id: 'tab', label: 'Tab', aria: 'Complete' },
    { id: 'up', label: '↑', aria: 'Previous command' },
    { id: 'down', label: '↓', aria: 'Next command' },
    { id: 'interrupt', label: '^C', aria: 'Interrupt' },
    { id: 'clear', label: 'Clear', aria: 'Clear screen' },
    { id: 'help', label: 'help', aria: 'Run help' },
    { id: 'run', label: 'Run ↵', aria: 'Run command' },
  ];

  const { navigate } = usePanelNav();
  const { toggle } = useSplitPane();
  const { set: setTheme } = useTheme();
  const reduced = useReducedMotion();
  const bus = useTerminalBus();
  const isMobile = useMediaQuery('(max-width: 899px)');
  const app = useAppMode();
  const modal = useModalRequest();

  const shell = useShell({
    navigate,
    togglePanel: toggle,
    setTheme,
    setLang: () => {},
    openApp: app.request,
    openModal: modal.request,
    destroy: () => {},
  });

  const booted = ref(false);
  const root = ref<HTMLElement | null>(null);
  const inputRef = ref<TerminalInputHandle | null>(null);

  function focusInput(): void {
    inputRef.value?.focus();
  }

  function scrollToBottom(): void {
    if (root.value) root.value.scrollTop = root.value.scrollHeight;
  }

  const { height } = useViewportHeight(root, () =>
    nextTick(() => requestAnimationFrame(scrollToBottom)),
  );

  const mobileActions: Record<string, () => void> = {
    tab: () => inputRef.value?.complete(),
    up: () => inputRef.value?.historyUp(),
    down: () => inputRef.value?.historyDown(),
    interrupt: () => inputRef.value?.interrupt(),
    clear: () => shell.clear(),
    help: () => inputRef.value?.submit('help'),
    run: () => inputRef.value?.submit(),
  };

  function onMobileKey(id: string): void {
    mobileActions[id]?.();
  }

  function closeModal(): void {
    modal.close();
    nextTick(focusInput);
  }

  function closeApp(): void {
    app.close();
    nextTick(focusInput);
  }

  async function submit(line: string): Promise<void> {
    await shell.run(line);
    nextTick(focusInput);
  }

  function onCandidates(items: string[]): void {
    shell.print(items.join('  '), 'dim');
  }

  function onInterrupt(): void {
    if (shell.busy.value) shell.abort();
    else shell.print('^C', 'dim');
  }

  async function drainBus(): Promise<void> {
    for (const command of bus.drain()) await shell.run(command);
  }

  async function onBoot(): Promise<void> {
    booted.value = true;
    await shell.run('whoami', { record: false });
    await drainBus();
    nextTick(focusInput);
  }

  function onRootClick(): void {
    if (app.open.value || hasTextSelection()) return;
    focusInput();
  }

  watch(
    () => bus.queue.value.length,
    count => {
      if (count > 0 && booted.value) drainBus();
    },
  );

  watch(
    () => shell.lines.value.length,
    () => nextTick(scrollToBottom),
  );
</script>

<template>
  <div
    ref="root"
    class="terminal"
    :class="{ 'terminal--app': app.open.value }"
    :style="{ height }"
    @click="onRootClick"
  >
    <div
      v-if="!booted"
      class="terminal__body"
    >
      <BootSequence
        :skip="reduced"
        @done="onBoot"
      />
    </div>
    <TuiApp
      v-else-if="app.open.value"
      :bridge="shell.bridge"
      @exit="closeApp"
    />
    <template v-else>
      <div class="terminal__body">
        <OutputLog
          :lines="shell.lines.value"
          label="Terminal output"
        />
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
        <MobileKeys
          v-if="isMobile"
          label="Terminal shortcuts"
          :keys="MOBILE_KEYS"
          @press="onMobileKey"
        />
      </div>
    </template>
    <ContactModal
      v-if="modal.kind.value === 'contact'"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
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
