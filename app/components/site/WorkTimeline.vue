<script setup lang="ts">
  import { publicExperience } from '#shared/cv/public-experience';
  import type { Experience } from '#shared/schemas/experience';

  const props = defineProps<{ experience: Experience[] }>();
  const entries = computed(() => publicExperience(props.experience));
</script>

<template>
  <ol class="work-list">
    <li
      v-for="entry in entries"
      :key="entry.slug"
      class="work-row"
    >
      <div class="work-row__when">
        <span
          class="work-row__marker"
          aria-hidden="true"
        />
        <span>{{ entry.range }}</span>
      </div>
      <div class="work-row__what">
        <h3>
          <a
            v-if="entry.url"
            :href="entry.url"
            target="_blank"
            rel="noopener"
            >{{ entry.company }} <span aria-hidden="true">↗</span></a
          >
          <template v-else>{{ entry.company }}</template>
        </h3>
        <p class="work-row__where">{{ entry.location }} · {{ entry.type }}</p>
        <p class="work-row__summary">{{ entry.summary }}</p>
        <ul class="work-row__stack">
          <li
            v-for="item in entry.stack"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </li>
  </ol>
</template>
