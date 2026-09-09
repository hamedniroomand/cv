<script setup lang="ts">
  import type { ToolCatalog } from '#shared/cv/tool-catalog';

  const SHOWN_PER_LAB = 5;
  const props = defineProps<{ catalog: ToolCatalog; siteUrl: string }>();

  const labs = computed(() =>
    props.catalog.labs.map(lab => ({
      name: lab.name,
      count: lab.tools.length,
      shown: lab.tools.slice(0, SHOWN_PER_LAB),
      rest: Math.max(0, lab.tools.length - SHOWN_PER_LAB),
    })),
  );
</script>

<template>
  <section
    class="catalog"
    aria-labelledby="catalog-title"
  >
    <p class="eyebrow">WHAT IS INSIDE</p>
    <h2 id="catalog-title">{{ catalog.total }} tools across {{ catalog.labs.length }} labs</h2>
    <p class="catalog__note">Read from the live site when this page was built.</p>
    <ul class="catalog__labs">
      <li
        v-for="lab in labs"
        :key="lab.name"
      >
        <p class="catalog__lab">
          {{ lab.name }} <span>{{ lab.count }}</span>
        </p>
        <p class="catalog__tools">
          <template
            v-for="(tool, index) in lab.shown"
            :key="tool.path"
          >
            <a
              :href="`${siteUrl}${tool.path}`"
              target="_blank"
              rel="noopener"
              >{{ tool.name }}</a
            ><span v-if="index < lab.shown.length - 1">, </span> </template
          ><span v-if="lab.rest"> and {{ lab.rest }} more</span>
        </p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
  .catalog {
    margin-top: var(--space-12);
    padding-top: var(--space-8);
    border-top: 1px solid var(--border);
  }

  .catalog h2 {
    margin: var(--space-2) 0 0;
    font-size: var(--text-xl);
    font-weight: 500;
    letter-spacing: -0.02em;
  }

  .catalog__note {
    margin: var(--space-2) 0 0;
    color: var(--fg-dim);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  .catalog__labs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: var(--space-6);
    margin: var(--space-6) 0 0;
    padding: 0;
    list-style: none;
  }

  .catalog__lab {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2);
    margin: 0 0 var(--space-2);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }

  .catalog__lab span {
    color: var(--accent);
  }

  .catalog__tools {
    margin: 0;
    color: var(--fg-dim);
    font-size: var(--text-sm);
    line-height: 1.8;
  }

  .catalog__tools a {
    color: var(--fg-dim);
    text-decoration: none;
    border-bottom: 1px solid transparent;
  }

  .catalog__tools a:hover {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }
</style>
