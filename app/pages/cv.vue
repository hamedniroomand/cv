<script setup lang="ts">
  definePageMeta({ layout: 'resume' });
  const cv = useCv();
  useResumeSeo(cv);
</script>

<template>
  <ResumePanel />
</template>
