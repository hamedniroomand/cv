<script setup lang="ts">
  import { projectPath } from '#shared/cv/panel-target';
  import { projectSourceLabel } from '#shared/cv/project-actions';
  import { projectStory } from '#shared/public-site';

  const route = useRoute();
  const project = useCv().projects.find(entry => entry.slug === String(route.params.slug));
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true });
  }

  const story = projectStory(project);
  const path = `~/projects/${project.slug}`;
  const crumbs = [
    { label: 'Home', to: '/' },
    { label: 'Projects', to: '/#projects' },
    { label: project.name },
  ];

  usePublicSeo(
    `${project.name} — Hamed Niroomand`,
    project.tagline,
    projectPath(project.slug),
    project.slug,
    `${project.name} — ${project.tagline}`,
  );
</script>

<template>
  <article
    :id="`project-${project.slug}`"
    class="project-page"
  >
    <PanelCrumbs :items="crumbs" />
    <header class="project-page__header">
      <p class="eyebrow">{{ story.category }}</p>
      <h1>{{ project.name }}<span class="accent">.</span></h1>
      <p class="project-page__headline">{{ story.headline }}</p>
      <ProjectActions :project="project" />
    </header>
    <ProjectVisual :slug="project.slug" />
    <ProjectScreenshots
      v-if="project.screenshots"
      :project="project"
    />
    <div class="project-page__body">
      <aside>
        <p class="eyebrow">BUILT WITH</p>
        <StackTags :items="project.stack" />
        <p class="eyebrow project-page__type">SOURCE</p>
        <p>{{ projectSourceLabel(project) }}</p>
        <PathLabel
          :path="path"
          :command="`bat ${path}/README.md`"
        />
      </aside>
      <div>
        <p class="project-intro">{{ story.introduction }}</p>
        <section
          v-for="section in story.sections"
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
      >← All projects <span>Back to projects</span></NuxtLink
    >
  </article>
</template>
