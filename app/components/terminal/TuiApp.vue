<script setup lang="ts">
  import type { AppBridge } from '~/tui/bridge';
  import type { View } from '~/tui/types';

  import type { MobileKey } from './MobileKeys.vue';

  const props = defineProps<{ bridge: AppBridge }>();
  const emit = defineEmits<{ exit: [] }>();

  const value = ref('');
  const status = ref('Type / for commands · ↑↓ to choose · Esc to leave');
  const prompt = ref<{ focus: () => void } | null>(null);
  const outputEl = ref<HTMLElement | null>(null);
  const isMobile = useMediaQuery('(max-width: 899px)');
  let exited = false;

  function focusPrompt(): void {
    nextTick(() => prompt.value?.focus());
  }

  const output = useTuiOutput();
  const { picker, pick, settle: settlePicker } = useTuiPicker(focusPrompt);

  const view: View = {
    print: output.print,
    clear: output.clear,
    pick,
    status: text => {
      status.value = text;
    },
    exit,
  };

  const runner = useTuiRunner({
    bridge: props.bridge,
    view,
    sink: output.sink,
    nextId: output.nextId,
    onSettled: focusPrompt,
  });
  const { up: historyUp, down: historyDown } = usePromptHistory(value, runner.history);
  const menu = useSlashMenu({
    value,
    registry: props.bridge.registry,
    blocked: () => picker.value !== null,
    completionContext: runner.completionContext,
  });

  function exit(): void {
    if (exited) return;
    exited = true;
    runner.abort();
    settlePicker(null);
    emit('exit');
  }

  function submitLine(line = value.value): void {
    if (runner.busy.value) return;
    value.value = '';
    menu.reveal();
    if (line.trim()) void runner.run(line);
  }

  function activateMenu(index: number): void {
    const item = menu.items.value[index];
    if (item) submitLine(item.runLine);
  }

  function completeMenu(): void {
    const item = menu.current.value;
    if (!item) return;
    value.value = item.completion;
    menu.reveal();
  }

  function interrupt(): void {
    runner.abort();
    value.value = '';
    menu.suppress();
  }

  function onEscape(): void {
    if (picker.value) {
      settlePicker(null);
      return;
    }
    if (menu.visible.value) {
      menu.suppress();
      focusPrompt();
      return;
    }
    if (!value.value) exit();
  }

  const escapeLabel = computed(() => {
    if (picker.value) return 'Esc · cancel';
    if (menu.visible.value) return 'Esc · close menu';
    return 'Esc · exit';
  });

  function onControlKey(event: KeyboardEvent): boolean {
    if (isControlKey(event, 'c')) {
      event.preventDefault();
      interrupt();
      return true;
    }
    if (isControlKey(event, 'd') && !value.value && !menu.visible.value) {
      event.preventDefault();
      exit();
      return true;
    }
    return event.ctrlKey;
  }

  function onMenuKey(event: KeyboardEvent): boolean {
    const actions: Record<string, () => void> = {
      ArrowUp: () => menu.move(-1),
      ArrowDown: () => menu.move(1),
      Tab: completeMenu,
      Escape: onEscape,
    };
    if (event.key === 'Enter' && menu.items.value.length > 0)
      actions.Enter = () => activateMenu(menu.selected.value);
    const action = actions[event.key];
    if (!action) return false;
    event.preventDefault();
    action();
    return true;
  }

  const promptActions: Record<string, () => void> = {
    Enter: () => submitLine(),
    Escape: onEscape,
    ArrowUp: historyUp,
    ArrowDown: historyDown,
  };

  function onKeydown(event: KeyboardEvent): void {
    if (onControlKey(event)) return;
    if (menu.visible.value && onMenuKey(event)) return;
    const action = promptActions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  function onAppKeydown(event: KeyboardEvent): void {
    if (isControlKey(event, 'l')) {
      event.preventDefault();
      event.stopPropagation();
      view.clear();
    }
  }

  const mobileKeys = computed<MobileKey[]>(() => {
    const menuOpen = menu.visible.value;
    return [
      { id: 'slash', label: '/', aria: 'Show commands' },
      { id: 'tab', label: 'Tab', aria: 'Complete', disabled: !menuOpen },
      { id: 'up', label: '↑', aria: menuOpen ? 'Previous option' : 'Previous command' },
      { id: 'down', label: '↓', aria: menuOpen ? 'Next option' : 'Next command' },
      { id: 'interrupt', label: '^C', aria: 'Interrupt' },
      { id: 'esc', label: 'Esc', aria: 'Escape' },
      { id: 'run', label: 'Run ↵', aria: 'Run command' },
    ];
  });

  const mobileActions: Record<string, () => void> = {
    slash: () => {
      value.value = '/';
      menu.reveal();
      focusPrompt();
    },
    tab: () => {
      if (menu.visible.value) completeMenu();
    },
    up: () => (menu.visible.value ? menu.move(-1) : historyUp()),
    down: () => (menu.visible.value ? menu.move(1) : historyDown()),
    interrupt,
    esc: onEscape,
    run: () => {
      if (menu.visible.value && menu.items.value.length > 0) activateMenu(menu.selected.value);
      else submitLine();
    },
  };

  function onMobileKey(id: string): void {
    mobileActions[id]?.();
  }

  watch(
    () => output.lines.value.length,
    () => {
      nextTick(() => {
        if (outputEl.value) outputEl.value.scrollTop = outputEl.value.scrollHeight;
      });
    },
  );

  view.print('Welcome. Try /experience to browse companies, /skills for the stack,');
  view.print('or /pdf to grab the one-pager.');

  onMounted(focusPrompt);
</script>

<template>
  <section
    class="tui"
    aria-label="Interactive app"
    @keydown.capture="onAppKeydown"
  >
    <TuiHeader
      :status="status"
      :escape-label="escapeLabel"
      @escape="onEscape"
    />

    <div
      ref="outputEl"
      class="tui__output"
    >
      <OutputLog
        :lines="output.lines.value"
        label="App output"
      />
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

    <footer
      v-else
      class="tui__prompt-area"
    >
      <SlashMenu
        v-if="menu.visible.value"
        :items="menu.items.value"
        :selected="menu.selected.value"
        @highlight="menu.selected.value = $event"
        @select="activateMenu"
      />
      <TuiPrompt
        ref="prompt"
        v-model="value"
        :busy="runner.busy.value"
        :menu-open="menu.visible.value"
        :active-descendant="menu.activeId.value"
        @input="menu.reveal"
        @keydown="onKeydown"
      />
      <MobileKeys
        v-if="isMobile"
        label="App shortcuts"
        :keys="mobileKeys"
        @press="onMobileKey"
      />
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

  .tui__output {
    min-height: 0;
    padding: var(--space-4);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .tui__prompt-area {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-top: 1px solid var(--border);
    background: var(--bg);
  }
</style>
