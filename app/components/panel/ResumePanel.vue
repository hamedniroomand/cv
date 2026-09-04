<script setup lang="ts">
import { formatRange } from '#shared/cv/format'
import { panelTargetId } from '#shared/cv/panel-target'

const cv = useCv()
const { active } = usePanelNav()
const siteUrl = useRuntimeConfig().public.siteUrl
const id = (section: Parameters<typeof panelTargetId>[0]['section']) => panelTargetId({ section })
</script>

<template>
  <section id="resume" class="panel" aria-label="Resume" tabindex="-1">
    <div class="panel__inner">
      <PanelHeader />

      <section :id="id('about')" class="section" :class="{ 'is-highlighted': active === id('about') }">
        <div class="section__head">
          <h2>About</h2>
          <PathLabel path="~/about.md" />
        </div>
        <MarkdownBody :html="cv.about.html" />
      </section>

      <section :id="id('experience')" class="section" :class="{ 'is-highlighted': active === id('experience') }">
        <div class="section__head">
          <h2>Experience</h2>
          <PathLabel path="~/experience" command="tree ~/experience" />
        </div>
        <ExperienceEntry v-for="exp in cv.experience" :key="exp.slug" :experience="exp" />
      </section>

      <section :id="id('projects')" class="section" :class="{ 'is-highlighted': active === id('projects') }">
        <div class="section__head">
          <h2>Open source</h2>
          <PathLabel path="~/projects" command="ls ~/projects" />
        </div>
        <article
          v-for="project in cv.projects"
          :id="panelTargetId({ section: 'projects', slug: project.slug })"
          :key="project.slug"
          class="project"
          :class="{ 'is-highlighted': active === panelTargetId({ section: 'projects', slug: project.slug }) }"
        >
          <div class="section__head">
            <h3 class="project__name">
              <a :href="`https://github.com/${project.repo}`" rel="noopener" target="_blank">{{ project.name }}</a>
            </h3>
            <PathLabel :path="`~/projects/${project.slug}`" :command="`cat ~/projects/${project.slug}/README.md`" />
          </div>
          <p class="project__tagline">
            {{ project.tagline }}
          </p>
          <p class="project__links">
            <a :href="`https://github.com/${project.repo}`" rel="noopener" target="_blank">github.com/{{ project.repo }}</a>
            <a v-if="project.docs" :href="project.docs" rel="noopener" target="_blank">docs</a>
          </p>
          <ul class="project__stack" aria-label="Stack">
            <li v-for="item in project.stack" :key="item">
              {{ item }}
            </li>
          </ul>
        </article>
      </section>

      <section :id="id('skills')" class="section" :class="{ 'is-highlighted': active === id('skills') }">
        <div class="section__head">
          <h2>Skills</h2>
          <PathLabel path="~/skills.json" command="skills" />
        </div>
        <SkillsGrid :categories="cv.skills.categories" />
      </section>

      <section :id="id('education')" class="section" :class="{ 'is-highlighted': active === id('education') }">
        <div class="section__head">
          <h2>Education</h2>
          <PathLabel path="~/education.md" />
        </div>
        <p class="education">
          <strong>{{ cv.education.degree }} {{ cv.education.field }}</strong><br>
          {{ cv.education.institution }}, {{ cv.education.location }}<br>
          <span class="education__dates">{{ formatRange(cv.education.start, cv.education.end) }}</span>
        </p>
      </section>

      <section :id="id('contact')" class="section" :class="{ 'is-highlighted': active === id('contact') }">
        <div class="section__head">
          <h2>Contact</h2>
          <PathLabel path="~/contact.sh" command="contact" />
        </div>
        <p>
          Email <a :href="`mailto:${cv.profile.links.email}`">{{ cv.profile.links.email }}</a>,
          or find me on <a :href="cv.profile.links.linkedin" rel="me noopener" target="_blank">LinkedIn</a>
          and <a :href="`https://github.com/${cv.profile.links.github}`" rel="me noopener" target="_blank">GitHub</a>.
        </p>
        <p class="languages">
          {{ cv.profile.languages.map(l => `${l.name} (${l.level})`).join(', ') }}
        </p>
      </section>

      <footer class="panel__footer">
        <p>This page is also an API:</p>
        <pre><code>curl {{ siteUrl }}/api/cv | jq .profile</code></pre>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.panel {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--bg);
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  .panel {
    scroll-behavior: auto;
  }
}

.panel__inner {
  max-width: var(--panel-max-width);
  margin: 0 auto;
  padding: var(--space-8) var(--space-6) var(--space-12);
}

.section {
  margin-top: var(--space-8);
  scroll-margin-top: var(--space-4);
  border-radius: var(--radius);
  transition: box-shadow var(--dur) var(--ease);
}

.section.is-highlighted,
.project.is-highlighted {
  box-shadow: 0 0 0 var(--space-3) var(--bg-elev);
  background: var(--bg-elev);
}

.section__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.section__head h2 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.project {
  padding: var(--space-3) 0;
  scroll-margin-top: var(--space-4);
  border-radius: var(--radius);
}

.project__name {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 600;
}

.project__name a {
  color: inherit;
  text-decoration: none;
}

.project__name a:hover {
  color: var(--accent);
}

.project__tagline {
  margin: var(--space-2) 0 0;
}

.project__links {
  display: flex;
  gap: var(--space-4);
  margin: var(--space-2) 0 0;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.project__stack {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: var(--space-3) 0 0;
  padding: 0;
  list-style: none;
}

.project__stack li {
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
  background: var(--bg-elev);
  color: var(--fg-dim);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.education {
  margin: 0;
}

.education__dates {
  color: var(--fg-dim);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.languages {
  color: var(--fg-dim);
}

.panel__footer {
  margin-top: var(--space-12);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
  color: var(--fg-dim);
  font-size: var(--text-sm);
}

.panel__footer p {
  margin: 0 0 var(--space-2);
}

.panel__footer pre {
  margin: 0;
  padding: var(--space-3);
  overflow-x: auto;
  border-radius: var(--radius);
  background: var(--bg-elev);
  color: var(--fg);
}
</style>
