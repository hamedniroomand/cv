<script setup lang="ts">
  import { linkLabel } from '#shared/cv/links';
  import { projectPath } from '#shared/cv/panel-target';
  import { projectStories } from '#shared/public-site';
  const route = useRoute();
  const project = useCv().projects.find(entry => entry.slug === String(route.params.slug));
  if (!project)
    throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true });
  const story = projectStories[project.slug];
  usePublicSeo(`${project.name} — Hamed Niroomand`, project.tagline, projectPath(project.slug));
</script>

<template>
  <article
    :id="`project-${project.slug}`"
    class="project-page"
  >
    <PanelCrumbs
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Projects', to: '/#projects' },
        { label: project.name },
      ]"
    />
    <header class="project-page__header">
      <p class="eyebrow">{{ story?.category ?? 'PROJECT' }}</p>
      <h1>{{ project.name }}<span class="accent">.</span></h1>
      <p class="project-page__headline">{{ story?.headline ?? project.tagline }}</p>
      <ProjectActions :project="project" />
    </header>
    <ProjectVisual :slug="project.slug" />
    <ProjectScreenshot
      v-if="project.screenshots"
      :shots="project.screenshots"
      :fallback-frame="project.site ? linkLabel(project.site) : project.name"
    />
    <div class="project-page__body">
      <aside>
        <p class="eyebrow">BUILT WITH</p>
        <StackTags :items="project.stack" />
        <p class="eyebrow project-page__type">SOURCE</p>
        <p>{{ project.repo ? 'Open source' : 'Private source · Public app' }}</p>
        <PathLabel
          :path="`~/projects/${project.slug}`"
          :command="`bat ~/projects/${project.slug}/README.md`"
        />
      </aside>
      <div>
        <p class="project-intro">{{ story?.introduction ?? project.tagline }}</p>
        <section
          v-for="section in story?.sections"
          :key="section.title"
          class="project-story"
        >
          <h2>{{ section.title }}</h2>
          <p>{{ section.body }}</p>
        </section>
      </div>
    </div>
    <ProjectToolCatalog
      v-if="project.tools && project.site"
      :catalog="project.tools"
      :site-url="project.site"
    />
    <NuxtLink
      to="/#projects"
      class="project-back"
      >← All projects <span>Back to the workshop</span></NuxtLink
    >
  </article>
</template>
