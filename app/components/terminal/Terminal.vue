<script setup lang="ts">
  import type { PanelTarget } from '#shared/cv/panel-target';
  import { publicNavigation } from '#shared/cv/panel-target';
  import { MOBILE_QUERY } from '#shared/layout';

  import type { MobileKey } from './MobileKeys.vue';
  import type { TerminalInputHandle } from './TerminalInput.vue';

  const props = withDefaults(defineProps<{ publicMode?: boolean }>(), { publicMode: false });

  const { navigate: navigatePanel } = usePanelNav();
  const terminalWindow = useTerminalWindow();
  const currentRoute = useRoute();
  const { toggle } = useSplitPane();
  const reveal = usePanelReveal();
  const { set: setTheme } = useTheme();
  const reduced = useReducedMotion();
  const bus = useTerminalBus();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const app = useAppMode();
  const modal = useModalRequest();

  /**
   * The résumé panel follows every target. The public site only opens a target that has
   * a page, so a visitor keeps the page and the scroll position on other targets.
   */
  async function navigate(target: PanelTarget): Promise<void> {
    if (!props.publicMode) {
      await navigatePanel(target);
      return;
    }
    const route = publicNavigation(target, currentRoute.path);
    if (!route) return;
    await navigateTo(route);
    // The new page answers the command, so the window steps out of the way.
    terminalWindow.dispatch('minimize');
  }

  const shell = useShell({
    publicMode: props.publicMode,
    navigate,
    togglePanel: toggle,
    revealPanel: reveal.request,
    setTheme,
    openApp: app.request,
    openModal: modal.request,
  });

  const booted = ref(false);
  const root = ref<HTMLElement | null>(null);
  const inputRef = ref<TerminalInputHandle | null>(null);
  const tuiApp = ref<{ insert: (text: string) => void; focus: () => void } | null>(null);

  function focusInput(): void {
    inputRef.value?.focus();
  }

  function scrollToBottom(): void {
    if (root.value) root.value.scrollTop = root.value.scrollHeight;
  }

  const { height } = useViewportHeight(root, () =>
    nextTick(() => requestAnimationFrame(scrollToBottom)),
  );

  useTypeToTerminal({
    enabled: () => booted.value && modal.kind.value === null && isVisible(root.value),
    insert: text => (app.open.value ? tuiApp.value : inputRef.value)?.insert(text),
  });

  const mobileKeys: MobileKey[] = [
    { label: 'Tab', aria: 'Complete', press: () => inputRef.value?.complete() },
    { label: '↑', aria: 'Previous command', press: () => inputRef.value?.historyUp() },
    { label: '↓', aria: 'Next command', press: () => inputRef.value?.historyDown() },
    { label: '^C', aria: 'Interrupt', press: () => inputRef.value?.interrupt() },
    { label: 'Clear', aria: 'Clear screen', press: () => shell.clear() },
    { label: 'help', aria: 'Run help', press: () => inputRef.value?.submit('help') },
    { label: 'menu', aria: 'Open the guided menu', press: () => inputRef.value?.submit('menu') },
    { label: 'Run ↵', aria: 'Run command', press: () => inputRef.value?.submit() },
  ];

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
    if (props.publicMode) {
      shell.print('Hamed Niroomand — personal website', 'accent');
      shell.print('Read the projects, the work history and the dotfiles.');
      shell.print("Try 'ls projects', 'ls experience', or 'menu' for guided mode.", 'dim');
      shell.print('');
    } else await shell.run('whoami', { record: false });
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

  defineExpose({
    focus: () => {
      if (app.open.value) tuiApp.value?.focus();
      else focusInput();
    },
  });
</script>

<template>
  <div
    ref="root"
    class="terminal"
    :class="{ 'terminal--app': app.open.value }"
    :style="{ height: publicMode ? undefined : height }"
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
      ref="tuiApp"
      :bridge="shell.bridge"
      :public-mode="publicMode"
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
          :keys="mobileKeys"
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

  /*
   * A touch device needs a 16px input, or Safari zooms the page on focus.
   * The whole terminal takes that size, so the prompt in the log and the prompt
   * on the input line stay the same size.
   */
  @media (max-width: 899px) {
    .terminal {
      font-size: 1rem;
    }
  }
</style>
