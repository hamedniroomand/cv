<script setup lang="ts">
  import { githubUrl, mailtoUrl } from '#shared/cv/links';

  const { site } = useAppConfig();
  const { links } = useCv().profile;
  const items = [
    { href: mailtoUrl(links.email), label: 'Say hello', external: false },
    { href: githubUrl(links.github), label: 'GitHub', external: true },
    { href: site.repo, label: 'Source', external: true },
  ];
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
      <a
        v-for="item in items"
        :key="item.href"
        :href="item.href"
        :target="item.external ? '_blank' : undefined"
        :rel="item.external ? 'noopener' : undefined"
        >{{ item.label }} ↗</a
      >
    </div>
  </footer>
</template>
