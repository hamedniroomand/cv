<script setup lang="ts">
import type { Profile } from '#shared/schemas/profile'
import { githubUrl, mailtoUrl } from '#shared/cv/links'

defineProps<{ profile: Profile }>()

function languageList(profile: Profile): string {
  return profile.languages.map(language => `${language.name} (${language.level})`).join(', ')
}
</script>

<template>
  <p>
    Email <a :href="mailtoUrl(profile.links.email)">{{ profile.links.email }}</a>,
    or find me on <a :href="profile.links.linkedin" rel="me noopener" target="_blank">LinkedIn</a>
    and <a :href="githubUrl(profile.links.github)" rel="me noopener" target="_blank">GitHub</a>.
  </p>
  <p class="languages">
    {{ languageList(profile) }}
  </p>
</template>

<style scoped>
.languages {
  color: var(--fg-dim);
}
</style>
