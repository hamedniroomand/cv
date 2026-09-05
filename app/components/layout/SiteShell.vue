<script setup lang="ts">
  import { siteHost } from '#shared/site-host';

  import type { ShellTab } from './MobileTabs.vue';

  const Terminal = defineAsyncComponent(() => import('~/components/terminal/Terminal.vue'));

  const { ratio, panelOpen, setRatio, toggle } = useSplitPane();
  const host = siteHost(useRuntimeConfig().public.siteUrl);
  const bus = useTerminalBus();
  const isDesktop = useMediaQuery('(min-width: 900px)', true);
  const tab = ref<ShellTab>('resume');
  const mounted = ref(false);
  const terminalLoaded = ref(false);

  const showTerminal = computed(
    () => mounted.value && (isDesktop.value || tab.value === 'terminal'),
  );

  watch(
    showTerminal,
    shown => {
      if (shown) terminalLoaded.value = true;
    },
    { immediate: true },
  );

  watch(
    () => bus.requested.value,
    () => {
      if (!isDesktop.value) tab.value = 'terminal';
    },
  );

  function onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === '`') {
      event.preventDefault();
      toggle();
    }
  }

  onMounted(() => {
    mounted.value = true;
    window.addEventListener('keydown', onKeydown);
  });
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div class="shell">
    <MobileTabs v-model="tab" />
    <SplitPane
      :ratio="ratio"
      :panel-open="panelOpen"
      :data-tab="tab"
      @update:ratio="setRatio"
    >
      <template #left>
        <div
          id="terminal"
          class="shell__terminal"
          role="tabpanel"
          aria-labelledby="tab-terminal"
        >
          <ClientOnly>
            <Terminal v-if="terminalLoaded" />
            <div
              v-else
              class="shell__terminal-placeholder"
              aria-hidden="true"
            >
              <span class="shell__prompt">hamed@{{ host }}:~$</span>
            </div>
          </ClientOnly>
        </div>
      </template>
      <template #right>
        <ResumePanel />
      </template>
    </SplitPane>
  </div>
</template>

<style scoped>
  .shell {
    display: flex;
    flex-direction: column;
    height: 100dvh;
  }

  .shell__terminal {
    height: 100%;
    background: var(--bg);
  }

  .shell__terminal-placeholder {
    padding: var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }

  .shell__prompt {
    color: var(--prompt);
  }
</style>
