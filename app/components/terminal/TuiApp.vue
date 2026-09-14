<script setup lang="ts">
  import { MOBILE_QUERY } from '#shared/layout';
  import type { AppBridge } from '~/tui/bridge';
  import type { View } from '~/tui/types';

  import type { MobileKey } from './MobileKeys.vue';

  const props = defineProps<{ bridge: AppBridge; publicMode?: boolean }>();
  const emit = defineEmits<{ exit: [] }>();

  const value = ref('');
  const status = ref('Type / for commands · ↑↓ to choose · Esc to leave');
  const prompt = ref<{ focus: () => void } | null>(null);
  const root = ref<HTMLElement | null>(null);
  const outputEl = ref<HTMLElement | null>(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
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

  function insert(text: string): void {
    if (picker.value) return;
    value.value += text;
    focusPrompt();
  }

  function submitLine(line: string): void {
    if (runner.busy.value) return;
    value.value = '';
    menu.reveal();
    if (line.trim()) void runner.run(line);
  }

  function runItem(index: number): void {
    const item = menu.items.value[index];
    if (item) submitLine(item.runLine);
  }

  /** Runs the highlighted menu item. Without one, runs the typed line. */
  function runCurrent(): void {
    submitLine(menu.current.value?.runLine ?? value.value);
  }

  function completeMenu(): void {
    const item = menu.current.value;
    if (!item) return;
    value.value = item.completion;
    menu.reveal();
  }

  function showCommands(): void {
    value.value = '/';
    menu.reveal();
    focusPrompt();
  }

  function interrupt(): void {
    runner.abort();
    value.value = '';
    menu.suppress();
  }

  function previous(): void {
    if (menu.visible.value) menu.move(-1);
    else historyUp();
  }

  function next(): void {
    if (menu.visible.value) menu.move(1);
    else historyDown();
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

  const keyActions: Record<string, () => void> = {
    Enter: runCurrent,
    Escape: onEscape,
    ArrowUp: previous,
    ArrowDown: next,
  };

  function onControlKey(event: KeyboardEvent): void {
    if (isControlKey(event, 'c')) {
      event.preventDefault();
      interrupt();
      return;
    }
    if (isControlKey(event, 'd') && !value.value && !menu.visible.value) {
      event.preventDefault();
      exit();
    }
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey) {
      onControlKey(event);
      return;
    }
    const action = event.key === 'Tab' && menu.visible.value ? completeMenu : keyActions[event.key];
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
      { label: '/', aria: 'Show commands', press: showCommands },
      { label: 'Tab', aria: 'Complete', press: completeMenu, disabled: !menuOpen },
      { label: '↑', aria: menuOpen ? 'Previous option' : 'Previous command', press: previous },
      { label: '↓', aria: menuOpen ? 'Next option' : 'Next command', press: next },
      { label: '^C', aria: 'Interrupt', press: interrupt },
      { label: 'Esc', aria: 'Escape', press: onEscape },
      { label: 'Run ↵', aria: 'Run command', press: runCurrent },
    ];
  });

  function scrollToBottom(): void {
    if (outputEl.value) outputEl.value.scrollTop = outputEl.value.scrollHeight;
  }

  watch(
    () => output.lines.value.length,
    () => nextTick(scrollToBottom),
  );

  if (props.publicMode) {
    view.print('Welcome to my personal website.');
    view.print('Type / to list the commands, or pick one of these:');
    view.print('/projects   /dotfiles   /theme   /contact', 'dim');
  } else {
    view.print('Welcome. Try /experience to browse companies, /skills for the stack,');
    view.print('or /pdf to grab the one-pager.');
  }

  function onWindowKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    if (event.target instanceof Node && root.value?.contains(event.target)) return;
    if (document.querySelector('dialog[open]')) return;
    event.preventDefault();
    exit();
  }

  onMounted(() => {
    focusPrompt();
    window.addEventListener('keydown', onWindowKeydown);
  });
  onBeforeUnmount(() => window.removeEventListener('keydown', onWindowKeydown));

  defineExpose({ insert, focus: focusPrompt });
</script>

<template>
  <section
    ref="root"
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
        @select="runItem"
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
