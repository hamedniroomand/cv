<script setup lang="ts">
  const cv = useCv();
</script>

<template>
  <PanelFrame
    id="resume"
    label="Resume"
  >
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
  </PanelFrame>
</template>
