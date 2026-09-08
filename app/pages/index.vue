<script setup lang="ts">
  const { projects, dotfiles, experience } = useCv();
  usePublicSeo(
    'Hamed Niroomand — Projects, tools & experiments',
    'Useful things, built with curiosity. Explore Cue, KitDev Space, and the configuration files behind my everyday work.',
  );
</script>

<template>
  <div class="home-page">
    <section
      id="top"
      class="home-hero"
    >
      <div class="hero-caption">
        <span class="status-dot" /> A PERSONAL WORKSHOP
        <span class="hero-caption__path">~/hamed</span>
      </div>
      <h1>Useful things.<br />Built with <span>curiosity.</span></h1>
      <div class="hero-bottom">
        <p>
          I’m Hamed. I make tools for the way I like to work.<br class="desktop-break" />
          This is where they live, along with a few things from my setup.
        </p>
        <a
          href="#projects"
          class="hero-explore"
          >Explore the work <span aria-hidden="true">↓</span></a
        >
      </div>
      <span
        class="hero-decoration"
        aria-hidden="true"
        >{<span>*</span>}</span
      >
    </section>
    <section
      id="projects"
      class="projects-section"
      aria-labelledby="projects-title"
    >
      <div class="section-heading">
        <div>
          <p class="eyebrow">01 / THE WORK</p>
          <h2 id="projects-title">Selected projects</h2>
        </div>
        <span class="section-aside">Small ideas, working software.</span>
      </div>
      <div class="project-grid">
        <ProjectCard
          v-for="(project, index) in projects"
          :key="project.slug"
          :project="project"
          :index="index"
        />
      </div>
    </section>
    <section
      id="experience"
      class="work-section"
      aria-labelledby="work-title"
    >
      <div class="section-heading">
        <div>
          <p class="eyebrow">02 / THE ROAD HERE</p>
          <h2 id="work-title">Where I&rsquo;ve worked</h2>
        </div>
        <span class="section-aside">Teams, products, and the years between.</span>
      </div>
      <WorkTimeline :experience="experience" />
    </section>
    <section
      class="setup-section"
      aria-labelledby="setup-title"
    >
      <div class="setup-copy">
        <p class="eyebrow">03 / BEHIND THE SCENES</p>
        <h2 id="setup-title">Make yourself<br />at <span class="mono">~</span> home.</h2>
        <p>
          The editor settings and small configurations that make a workspace feel like mine. Open a
          file. Borrow what’s useful.
        </p>
        <NuxtLink
          to="/dotfiles"
          class="text-link"
          >Browse dotfiles <span aria-hidden="true">↗</span></NuxtLink
        >
      </div>
      <div class="setup-files">
        <div class="setup-files__bar">
          <span class="status-dot" /> ~/.config <span>personal setup</span>
        </div>
        <NuxtLink
          v-for="dotfile in dotfiles.slice(0, 3)"
          :key="dotfile.slug"
          :to="`/dotfiles/${dotfile.slug}`"
          class="setup-file"
          ><span
            class="file-icon"
            aria-hidden="true"
            >{ }</span
          ><span
            ><strong>{{ dotfile.title }}</strong
            ><small>{{ dotfile.path }}</small></span
          ><span aria-hidden="true">↗</span></NuxtLink
        >
        <p class="setup-files__note">Readable. Copyable. Yours to adapt.</p>
      </div>
    </section>
    <section class="hello-section">
      <p class="eyebrow">04 / KEEP IN TOUCH</p>
      <h2>Something in common?</h2>
      <div>
        <p>
          A useful tool, a strange idea, or a good conversation.<br />I’m always happy to hear about
          it.
        </p>
        <a
          href="mailto:hamed@niroomand.dev"
          class="text-link"
          >Let’s talk <span aria-hidden="true">↗</span></a
        >
      </div>
    </section>
  </div>
</template>
