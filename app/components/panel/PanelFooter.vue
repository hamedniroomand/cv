<script setup lang="ts">
const siteUrl = useRuntimeConfig().public.siteUrl
</script>

<template>
  <footer class="footer">
    <p>This page is also an API:</p>
    <pre><code>curl {{ siteUrl }}/api/cv | jq .profile</code></pre>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: var(--space-12);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
  color: var(--fg-dim);
  font-size: var(--text-sm);
}

.footer p {
  margin: 0 0 var(--space-2);
}

.footer pre {
  margin: 0;
  padding: var(--space-3);
  overflow-x: auto;
  border-radius: var(--radius);
  background: var(--bg-elev);
  color: var(--fg);
}
</style>
