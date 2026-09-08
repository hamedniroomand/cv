<script setup lang="ts">
  import { MOBILE_QUERY } from '#shared/layout';

  const content = ref<HTMLElement | null>(null);
  useSectionReveals(content);

  const bus = useTerminalBus();
  const reveal = usePanelReveal();
  const terminalWindow = useTerminalWindow();
  /** A phone has no room for a small window, so the terminal fills the screen there. */
  const isMobile = useMediaQuery(MOBILE_QUERY);

  const header = ref<{ focusTerminalButton: () => void } | null>(null);
  const dock = ref<{ focus: () => void } | null>(null);

  function openTerminal(): void {
    // A minimized window goes back to the size it had. A closed window on a phone fills the screen.
    if (terminalWindow.minimized.value) terminalWindow.dispatch('open');
    else terminalWindow.dispatch(isMobile.value ? 'maximize' : 'open');
    nextTick(() => dock.value?.focus());
  }

  function toggleTerminal(): void {
    if (terminalWindow.docked.value) closeTerminal();
    else openTerminal();
  }

  function closeTerminal(): void {
    terminalWindow.dispatch('close');
    nextTick(() => header.value?.focusTerminalButton());
  }

  function minimizeTerminal(): void {
    if (terminalWindow.minimized.value) openTerminal();
    else terminalWindow.dispatch('minimize');
  }

  function toggleMaximize(): void {
    terminalWindow.dispatch('toggleMaximize');
    nextTick(() => dock.value?.focus());
  }

  useTerminalHotkeys({
    toggle: toggleTerminal,
    close: closeTerminal,
    isOpen: () => terminalWindow.docked.value,
  });

  watch(() => bus.requested.value, openTerminal);
  watch(
    () => reveal.requested.value,
    () => terminalWindow.dispatch('close'),
  );
</script>

<template>
  <div class="public-shell">
    <a
      class="skip-link"
      href="#main-content"
      >Skip to content</a
    >
    <SiteHeader
      ref="header"
      :terminal-open="terminalWindow.docked.value"
      @toggle-terminal="toggleTerminal"
    />
    <main
      ref="content"
      id="main-content"
      tabindex="-1"
    >
      <slot />
    </main>
    <SiteFooter />
    <TerminalDock
      v-if="terminalWindow.loaded.value"
      v-show="terminalWindow.present.value"
      ref="dock"
      :mode="terminalWindow.mode.value"
      @minimize="minimizeTerminal"
      @toggle-maximize="toggleMaximize"
      @close="closeTerminal"
    />
  </div>
</template>
