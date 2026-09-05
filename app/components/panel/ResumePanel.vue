<script setup lang="ts">
  const cv = useCv();
</script>

<template>
  <section
    id="resume"
    class="panel"
    aria-label="Resume"
    tabindex="-1"
  >
    <div class="panel__inner">
      <PanelHeader />

      <ResumeSection
        section="about"
        title="About"
        path="~/about.md"
      >
        <MarkdownBody :html="cv.about.html" />
      </ResumeSection>

      <ResumeSection
        section="experience"
        title="Experience"
        path="~/experience"
        command="tree ~/experience"
      >
        <ExperienceEntry
          v-for="experience in cv.experience"
          :key="experience.slug"
          :experience="experience"
        />
      </ResumeSection>

      <ResumeSection
        section="projects"
        title="Open source"
        path="~/projects"
        command="ls ~/projects"
      >
        <ProjectEntry
          v-for="project in cv.projects"
          :key="project.slug"
          :project="project"
        />
      </ResumeSection>

      <ResumeSection
        section="skills"
        title="Skills"
        path="~/skills.json"
        command="skills"
      >
        <SkillsGrid :categories="cv.skills.categories" />
      </ResumeSection>

      <ResumeSection
        section="education"
        title="Education"
        path="~/education.md"
      >
        <EducationEntry :education="cv.education" />
      </ResumeSection>

      <ResumeSection
        section="contact"
        title="Contact"
        path="~/contact.sh"
        command="contact"
      >
        <ContactLinks :profile="cv.profile" />
      </ResumeSection>

      <PanelFooter />
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

  @media (max-width: 479px) {
    .panel__inner {
      padding: var(--space-4);
    }
  }
</style>
