<script setup lang="ts">
import type { Profile } from '#shared/schemas/profile'
import { githubUrl, linkLabel, mailtoUrl } from '#shared/cv/links'

const props = defineProps<{ links: Profile['links'] }>()

const github = computed(() => githubUrl(props.links.github))
const linkedin = computed(() => linkLabel(props.links.linkedin))
</script>

<template>
  <ul class="links">
    <li>
      <a :href="github" rel="me noopener" target="_blank">github.com/{{ links.github }}</a>
    </li>
    <li>
      <a :href="links.linkedin" rel="me noopener" target="_blank">{{ linkedin }}</a>
    </li>
    <li>
      <a :href="mailtoUrl(links.email)">{{ links.email }}</a>
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
