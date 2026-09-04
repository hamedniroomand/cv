<script setup lang="ts">
const cv = useCv()
const { profile } = cv
const siteUrl = useRuntimeConfig().public.siteUrl
/** This site's own source, as opposed to the GitHub profile listed in the resume links. */
const REPO_URL = 'https://github.com/hamedniroomand/cv'
const linkedinLabel = computed(() => profile.links.linkedin.replace(/^https?:\/\/(www\.)?/, ''))
const locationLine = computed(() => `${profile.location.city}, ${profile.location.country} (${profile.location.tz})${profile.remote ? ', remote' : ''}`)
</script>

<template>
  <header id="section-top" class="header">
    <p class="header__prompt" aria-hidden="true">
      hamed@{{ siteUrl.replace(/^https?:\/\//, '') }}:~$ whoami
    </p>
    <h1 class="header__name">
      {{ profile.name }}
    </h1>
    <p class="header__title">
      {{ profile.title }}
    </p>
    <p class="header__meta">
      {{ locationLine }}
    </p>
    <ul class="header__links">
      <li>
        <a :href="`https://github.com/${profile.links.github}`" rel="me noopener" target="_blank">github.com/{{ profile.links.github }}</a>
      </li>
      <li>
        <a :href="profile.links.linkedin" rel="me noopener" target="_blank">{{ linkedinLabel }}</a>
      </li>
      <li>
        <a :href="`mailto:${profile.links.email}`">{{ profile.links.email }}</a>
      </li>
    </ul>
    <div class="header__actions">
      <a class="btn" href="/hamed-niroomand-cv.pdf" download="hamed-niroomand-cv.pdf">
        Download PDF
      </a>
      <a class="btn btn-ghost" :href="REPO_URL" target="_blank" rel="noopener" aria-label="Source on GitHub" title="This site is open source">
        <svg class="header__github" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
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

.header__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.header__github {
  flex: none;
}
</style>
