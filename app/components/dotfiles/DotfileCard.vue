<script setup lang="ts">
  import { dotfilePath, panelTargetId } from '#shared/cv/panel-target';
  import type { Dotfile } from '#shared/schemas/dotfile';

  import type DotfileCode from './DotfileCode.vue';

  const props = defineProps<{ dotfile: Dotfile }>();

  const id = computed(() => panelTargetId({ section: 'dotfiles', slug: props.dotfile.slug }));
  const highlighted = usePanelHighlight(id);
  const pageUrl = computed(
    () => `${useRuntimeConfig().public.siteUrl}${dotfilePath(props.dotfile.slug)}`,
  );

  const hydrated = useHydrated();
  const { copy } = useClipboard();
  const { share } = useShare();
  const { message, announce } = useStatusMessage();
  const code = ref<InstanceType<typeof DotfileCode> | null>(null);

  async function onCopy(): Promise<void> {
    if (await copy(props.dotfile.content)) {
      announce('Copied');
      return;
    }
    code.value?.select();
    announce('Select and copy with your keyboard');
  }

  async function onShare(): Promise<void> {
    const result = await share(props.dotfile.title, pageUrl.value);
    if (result === 'copied') announce('Link copied');
    else if (result === 'failed') announce(pageUrl.value);
  }
</script>

<template>
  <section
    :id="id"
    class="card"
    :class="{ 'is-highlighted': highlighted }"
    :aria-label="`${dotfile.title} file`"
  >
    <header class="card__bar">
      <span class="card__tab">{{ dotfile.path }}</span>
      <span class="card__lang">{{ dotfile.lang }}</span>
      <span class="card__actions">
        <button
          type="button"
          class="btn btn-ghost card__btn"
          :disabled="!hydrated"
          aria-label="Copy file"
          @click="onCopy"
        >
          {{ message === 'Copied' ? 'Copied' : 'Copy' }}
        </button>
        <button
          type="button"
          class="btn btn-ghost card__btn"
          :disabled="!hydrated"
          aria-label="Share link"
          @click="onShare"
        >
          Share
        </button>
        <a
          v-if="dotfile.gistUrl"
          class="btn btn-ghost card__btn"
          :href="dotfile.gistUrl"
          target="_blank"
          rel="noopener"
          >Gist ↗</a
        >
      </span>
    </header>
    <DotfileCode
      ref="code"
      :html="dotfile.html"
    />
    <p
      class="card__status"
      role="status"
      aria-live="polite"
    >
      {{ message }}
    </p>
  </section>
</template>

<style scoped>
  .card {
    margin-top: var(--space-6);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-elev);
    overflow: hidden;
    scroll-margin-top: var(--space-4);
  }

  .card.is-highlighted {
    box-shadow: 0 0 0 var(--space-1) var(--accent);
  }

  .card__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  .card__tab {
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--fg);
  }

  .card__lang {
    color: var(--fg-dim);
  }

  .card__actions {
    display: flex;
    gap: var(--space-2);
    margin-left: auto;
  }

  .card__btn {
    padding: 0.15rem 0.6rem;
    font-size: var(--text-xs);
  }

  .card__status {
    min-height: 1.2em;
    margin: 0;
    padding: 0 var(--space-3) var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-dim);
  }
</style>
