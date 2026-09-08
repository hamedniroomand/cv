<script setup lang="ts">
  import { publicExperience } from '#shared/cv/public-experience';
  import type { Experience } from '#shared/schemas/experience';

  const props = defineProps<{ experience: Experience[] }>();
  const entries = computed(() => publicExperience(props.experience));
</script>

<template>
  <div>
    <ol class="work-list">
      <WorkEntry
        v-for="entry in entries.slice(0, 2)"
        :key="entry.slug"
        :entry="entry"
      />
    </ol>
    <details
      v-if="entries.length > 2"
      class="earlier-work"
    >
      <summary>
        Earlier work <span class="earlier-work__count">{{ entries.length - 2 }} more</span
        ><span
          class="earlier-work__icon"
          aria-hidden="true"
          >+</span
        >
      </summary>
      <ol
        class="work-list"
        start="3"
      >
        <WorkEntry
          v-for="entry in entries.slice(2)"
          :key="entry.slug"
          :entry="entry"
        />
      </ol>
    </details>
  </div>
</template>
