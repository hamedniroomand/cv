<script setup lang="ts">
  const { site } = useAppConfig();
</script>

<template>
  <footer
    id="contact"
    class="site-footer"
  >
    <div>
      <NuxtLink
        to="/"
        class="footer-name"
        >Hamed Niroomand<span class="accent">.</span></NuxtLink
      >
      <p>A small corner of the internet. Made by hand, with curiosity.</p>
    </div>
    <div class="footer-links">
      <a href="mailto:hamed@niroomand.dev">Say hello ↗</a
      ><a
        href="https://github.com/hamedniroomand"
        target="_blank"
        rel="noopener"
        >GitHub ↗</a
      ><a
        :href="site.repo"
        target="_blank"
        rel="noopener"
        >Source ↗</a
      >
    </div>
  </footer>
</template>
