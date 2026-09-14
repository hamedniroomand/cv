<script setup lang="ts">
  import { linkLabel } from '#shared/cv/links';
  import type { Project } from '#shared/schemas/project';

  const props = defineProps<{ project: Project }>();

  const screenshots = computed(() => props.project.screenshots ?? []);
  /** The window title of a shot without its own: the site host, or the project name. */
  const frame = computed(() =>
    props.project.site ? linkLabel(props.project.site) : props.project.name,
  );
</script>

<template>
  <figure
    v-for="shot in screenshots"
    :key="shot.src"
    class="shot"
  >
    <div class="shot__frame">
      <div
        class="shot__bar"
        aria-hidden="true"
      >
        <span class="shot__lights"><i /><i /><i /></span>
        <span class="shot__name">{{ shot.frame ?? frame }}</span>
      </div>
      <img
        :src="shot.src"
        :alt="shot.alt"
        :width="shot.width"
        :height="shot.height"
        loading="lazy"
        decoding="async"
      />
    </div>
    <figcaption>{{ shot.caption }}</figcaption>
  </figure>
</template>

<style scoped>
  .shot {
    margin: var(--space-8) 0 0;
  }

  /* A window frame, so the picture reads as an application and not as a page element. */
  .shot__frame {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-elev);
    overflow: hidden;
  }

  .shot__bar {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-dim);
  }

  .shot__lights {
    display: flex;
    gap: 6px;
  }

  .shot__lights i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--border);
  }

  .shot__frame img {
    display: block;
    width: 100%;
    height: auto;
  }

  figcaption {
    margin-top: var(--space-3);
    color: var(--fg-dim);
    font-size: var(--text-sm);
    line-height: 1.7;
  }
</style>
