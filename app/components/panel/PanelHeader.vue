<script setup lang="ts">
const cv = useCv()
const { profile } = cv
const siteUrl = useRuntimeConfig().public.siteUrl
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
</style>
