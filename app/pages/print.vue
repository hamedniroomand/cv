<script setup lang="ts">
import { formatRange } from '#shared/cv/format'

const cv = useCv()
const { profile } = cv
const siteUrl = useRuntimeConfig().public.siteUrl
const site = siteUrl.replace(/^https?:\/\//, '')

useHead({
  title: `${profile.name} — CV`,
  meta: [{ name: 'robots', content: 'noindex' }],
  htmlAttrs: { 'data-theme': 'light' },
})

const roles = (exp: (typeof cv.experience)[number]) => [...exp.roles].sort((a, b) => b.start.localeCompare(a.start))
</script>

<template>
  <main class="print">
    <header class="print__header">
      <div>
        <h1>{{ profile.name }}</h1>
        <p class="print__title">
          {{ profile.title }}
        </p>
      </div>
      <address class="print__contact">
        <span>{{ profile.location.city }}, {{ profile.location.country }} ({{ profile.location.tz }}){{ profile.remote ? ', remote' : '' }}</span>
        <a :href="`mailto:${profile.links.email}`">{{ profile.links.email }}</a>
        <a :href="`https://github.com/${profile.links.github}`">github.com/{{ profile.links.github }}</a>
        <a :href="profile.links.linkedin">{{ profile.links.linkedin.replace(/^https?:\/\/(www\.)?/, '') }}</a>
        <a :href="siteUrl">{{ site }}</a>
      </address>
    </header>

    <section>
      <h2>Summary</h2>
      <p>{{ profile.summary }}</p>
    </section>

    <section>
      <h2>Experience</h2>
      <article v-for="exp in cv.experience" :key="exp.slug" class="entry">
        <div class="entry__head">
          <h3>{{ exp.company }}</h3>
          <span class="entry__meta">{{ exp.location }}, {{ exp.type }}</span>
        </div>
        <ul class="entry__roles">
          <li v-for="role in roles(exp)" :key="role.start">
            <strong>{{ role.title }}</strong> <span class="entry__dates">{{ formatRange(role.start, role.end) }}</span>
          </li>
        </ul>
        <ul v-if="exp.highlights.length" class="entry__highlights">
          <li v-for="h in exp.highlights" :key="h.slug">
            {{ h.body }}
          </li>
        </ul>
        <p v-else class="entry__body">
          {{ exp.body }}
        </p>
        <p class="entry__stack">
          Stack: {{ exp.stack.join(', ') }}
        </p>
      </article>
    </section>

    <section>
      <h2>Open source</h2>
      <article v-for="project in cv.projects" :key="project.slug" class="entry">
        <div class="entry__head">
          <h3>{{ project.name }}</h3>
          <span class="entry__meta">github.com/{{ project.repo }}</span>
        </div>
        <p class="entry__body">
          {{ project.tagline }}
        </p>
        <p class="entry__stack">
          Stack: {{ project.stack.join(', ') }}
        </p>
      </article>
    </section>

    <section>
      <h2>Skills</h2>
      <dl class="skills">
        <template v-for="cat in cv.skills.categories" :key="cat.id">
          <dt>{{ cat.label }}</dt>
          <dd>{{ cat.items.map(i => i.name).join(', ') }}</dd>
        </template>
      </dl>
    </section>

    <section>
      <h2>Education</h2>
      <p>
        <strong>{{ cv.education.degree }} {{ cv.education.field }}</strong>, {{ cv.education.institution }}, {{ cv.education.location }}.
        {{ formatRange(cv.education.start, cv.education.end) }}
      </p>
      <p class="print__languages">
        Languages: {{ profile.languages.map(l => `${l.name} (${l.level})`).join(', ') }}
      </p>
    </section>
  </main>
</template>

<style>
@page {
  size: A4;
  margin: 14mm 16mm;
}

@media print {
  html,
  body {
    background: #fff !important;
  }
}
</style>

<style scoped>
.print {
  max-width: 190mm;
  margin: 0 auto;
  padding: 10mm 0;
  color: #111;
  background: #fff;
  font-family: var(--font-sans);
  font-size: 10.5pt;
  line-height: 1.4;
}

.print a {
  color: #111;
  text-decoration: none;
}

.print__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8mm;
  padding-bottom: 3mm;
  border-bottom: 1.5px solid #111;
}

h1 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 20pt;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.print__title {
  margin: 1mm 0 0;
  font-size: 11.5pt;
}

.print__contact {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-style: normal;
  font-size: 9pt;
  text-align: right;
  white-space: nowrap;
}

section {
  margin-top: 4mm;
  break-inside: auto;
}

h2 {
  margin: 0 0 1.5mm;
  font-family: var(--font-mono);
  font-size: 10pt;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-bottom: 0.5px solid #999;
  padding-bottom: 0.5mm;
}

section > p {
  margin: 0;
}

.entry {
  margin-top: 2.5mm;
  break-inside: avoid;
}

.entry__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 4mm;
}

h3 {
  margin: 0;
  font-size: 11pt;
  font-weight: 700;
}

.entry__meta {
  color: #444;
  font-size: 9pt;
}

.entry__roles {
  margin: 0.5mm 0 0;
  padding: 0;
  list-style: none;
}

.entry__dates {
  color: #444;
  font-size: 9pt;
  margin-left: 1.5mm;
}

.entry__highlights {
  margin: 1mm 0 0;
  padding-left: 4mm;
}

.entry__highlights li + li {
  margin-top: 0.5mm;
}

.entry__body {
  margin: 1mm 0 0;
}

.entry__stack {
  margin: 1mm 0 0;
  color: #444;
  font-size: 9pt;
}

.skills {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.5mm 4mm;
  margin: 0;
}

.skills dt {
  font-weight: 600;
}

.skills dd {
  margin: 0;
}

.print__languages {
  margin-top: 1mm !important;
  color: #444;
  font-size: 9pt;
}
</style>
