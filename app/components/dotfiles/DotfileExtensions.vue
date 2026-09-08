<script setup lang="ts">
  import { marketplaceUrl, parseExtensions } from '#shared/cv/extensions';

  const props = defineProps<{ content: string; path: string }>();
  const extensions = computed(() => parseExtensions(props.content));
  const install = computed(() => `xargs -L 1 code --install-extension < ${props.path}`);
</script>

<template>
  <section
    class="extensions"
    aria-labelledby="extensions-title"
  >
    <div class="extensions__head">
      <h2 id="extensions-title">{{ extensions.length }} extensions</h2>
      <p>Every name opens in the Visual Studio Marketplace.</p>
    </div>
    <p class="extensions__install">
      <span>Install them all</span><code>{{ install }}</code>
    </p>
    <ul class="extensions__list">
      <li
        v-for="extension in extensions"
        :key="extension.id"
      >
        <a
          :href="marketplaceUrl(extension.id)"
          target="_blank"
          rel="noopener"
        >
          <span class="extensions__name">{{ extension.name }}</span>
          <span class="extensions__publisher">{{ extension.publisher }}</span>
          <span
            class="extensions__go"
            aria-hidden="true"
            >↗</span
          >
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
  .extensions {
    margin-top: var(--space-8);
  }

  .extensions__head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }

  .extensions__head h2 {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
  }

  .extensions__head p {
    margin: 0;
    color: var(--fg-dim);
    font-size: var(--text-sm);
  }

  .extensions__install {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-3);
    margin: 0 0 var(--space-4);
    padding: var(--space-3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-elev);
  }

  .extensions__install span {
    color: var(--fg-dim);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .extensions__install code {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--accent);
    overflow-wrap: anywhere;
  }

  .extensions__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .extensions__list a {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    padding: var(--space-3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--fg);
    text-decoration: none;
    transition:
      border-color var(--dur) var(--ease),
      background-color var(--dur) var(--ease);
  }

  .extensions__list a:hover {
    border-color: var(--accent);
    background: var(--bg-elev);
  }

  .extensions__name {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    overflow-wrap: anywhere;
  }

  .extensions__publisher {
    color: var(--fg-dim);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  .extensions__go {
    margin-left: auto;
    color: var(--fg-dim);
    font-size: var(--text-xs);
  }

  .extensions__list a:hover .extensions__go {
    color: var(--accent);
  }
</style>
