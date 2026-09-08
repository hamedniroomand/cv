<template>
  <div class="resume-layout">
    <nav
      class="resume-nav"
      aria-label="Résumé navigation"
    >
      <NuxtLink to="/">← Back to the workshop</NuxtLink>
      <span>Curriculum vitae <span aria-hidden="true">/</span> Hamed Niroomand</span>
    </nav>
    <SiteShell panel-label="Resume"><slot /></SiteShell>
  </div>
</template>
<style scoped>
  .resume-nav {
    height: 48px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--fg-dim);
  }
  .resume-nav a {
    color: var(--fg);
    text-decoration: none;
  }
  .resume-layout :deep(.shell) {
    height: calc(100dvh - 48px);
  }
  @media (max-width: 600px) {
    .resume-nav {
      padding: 0 16px;
    }
    .resume-nav > span {
      display: none;
    }
  }
</style>
