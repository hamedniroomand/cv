<script setup lang="ts">
  export interface Crumb {
    label: string;
    to?: string;
  }

  defineProps<{ items: Crumb[] }>();
</script>

<template>
  <nav
    class="crumbs"
    aria-label="Breadcrumb"
  >
    <ol class="crumbs__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="crumbs__item"
      >
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          >{{ item.label }}</NuxtLink
        >
        <span
          v-else
          aria-current="page"
          >{{ item.label }}</span
        >
      </li>
    </ol>
  </nav>
</template>

<style scoped>
  .crumbs__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-dim);
  }

  .crumbs__item + .crumbs__item::before {
    content: '/';
    margin-right: var(--space-2);
  }

  .crumbs__item a {
    color: inherit;
  }

  .crumbs__item a:hover {
    color: var(--accent);
  }
</style>
