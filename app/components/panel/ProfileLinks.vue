<script setup lang="ts">
  import { githubUrl, linkLabel, mailtoUrl } from '#shared/cv/links';
  import type { Profile } from '#shared/schemas/profile';

  const props = defineProps<{ links: Profile['links'] }>();

  const items = computed(() => [
    {
      href: githubUrl(props.links.github),
      label: `github.com/${props.links.github}`,
      external: true,
    },
    { href: props.links.linkedin, label: linkLabel(props.links.linkedin), external: true },
    { href: mailtoUrl(props.links.email), label: props.links.email, external: false },
  ]);
</script>

<template>
  <ul class="links">
    <li
      v-for="item in items"
      :key="item.href"
    >
      <a
        :href="item.href"
        :rel="item.external ? 'me noopener' : undefined"
        :target="item.external ? '_blank' : undefined"
        >{{ item.label }}</a
      >
    </li>
  </ul>
</template>

<style scoped>
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
    margin: var(--space-4) 0 0;
    padding: 0;
    list-style: none;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
</style>
