<script setup lang="ts">
const route = useRoute()
const cv = useCv()
const slug = String(route.params.slug)
const entry = cv.experience.find(e => e.slug === slug)

if (!entry)
  throw createError({ statusCode: 404, statusMessage: 'No such experience', fatal: true })

const firstParagraph = entry.body.split(/\n\s*\n/)[0] ?? entry.body
useResumeSeo(cv, {
  title: `${entry.company} — ${cv.profile.name}`,
  description: firstParagraph,
  path: `/experience/${slug}`,
})
</script>

<template>
  <SiteShell :initial-target="{ section: 'experience', slug }" />
</template>
