<script setup lang="ts">
import { siteHost } from '#shared/site-host'

const REPO_URL = 'https://github.com/hamedniroomand/cv'
const PDF_FILE = 'hamed-niroomand-cv.pdf'

const { profile } = useCv()
const host = siteHost(useRuntimeConfig().public.siteUrl)
const location = computed(() => {
  const { city, country, tz } = profile.location
  return `${city}, ${country} (${tz})${profile.remote ? ', remote' : ''}`
})
</script>

<template>
  <header id="section-top" class="header">
    <p class="header__prompt" aria-hidden="true">
      hamed@{{ host }}:~$ whoami
    </p>
    <h1 class="header__name">
      {{ profile.name }}
    </h1>
    <p class="header__title">
      {{ profile.title }}
    </p>
    <p class="header__meta">
      {{ location }}
    </p>
    <ProfileLinks :links="profile.links" />
    <div class="header__actions">
      <a class="btn" :href="`/${PDF_FILE}`" :download="PDF_FILE">
        Download PDF
      </a>
      <a class="btn btn-ghost" :href="REPO_URL" target="_blank" rel="noopener" aria-label="Source on GitHub" title="This site is open source">
        <GithubIcon />
        Source
      </a>
      <PathLabel path="~" command="whoami" />
    </div>
  </header>
</template>

<style scoped>
.header {
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--border);
}

.header__prompt {
  margin: 0 0 var(--space-2);
  color: var(--fg-dim);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.header__name {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.header__title {
  margin: var(--space-2) 0 0;
  font-size: var(--text-lg);
  color: var(--accent);
}

.header__meta {
  margin: var(--space-1) 0 0;
  color: var(--fg-dim);
}

.header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-6);
}
</style>
