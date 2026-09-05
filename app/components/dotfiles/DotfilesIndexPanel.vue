<script setup lang="ts">
  import { panelTargetId } from '#shared/cv/panel-target';

  const { dotfiles } = useCv();
  const id = panelTargetId({ section: 'dotfiles' });
  const highlighted = usePanelHighlight(id);
  const crumbs = [{ label: '~', to: '/' }, { label: 'dotfiles' }];
</script>

<template>
  <PanelFrame
    id="dotfiles"
    label="Dotfiles"
  >
    <PanelCrumbs :items="crumbs" />
    <section
      :id="id"
      class="index"
      :class="{ 'is-highlighted': highlighted }"
    >
      <PanelHead
        class="index__head"
        path="~/.config"
        command="dotfiles"
      >
        <h1 class="index__title">Dotfiles</h1>
      </PanelHead>
      <p class="index__lede">
        Configuration files that I use each day. Read them here, copy them with one click, or
        <code>cat</code> them in the terminal.
      </p>
      <ul
        v-if="dotfiles.length > 0"
        class="index__list"
      >
        <DotfileListItem
          v-for="dotfile in dotfiles"
          :key="dotfile.slug"
          :dotfile="dotfile"
        />
      </ul>
      <p
        v-else
        class="index__empty"
      >
        Nothing published yet.
      </p>
    </section>
  </PanelFrame>
</template>

<style scoped>
  .index {
    margin-top: var(--space-4);
    border-radius: var(--radius);
  }

  .index.is-highlighted {
    box-shadow: 0 0 0 var(--space-3) var(--bg-elev);
    background: var(--bg-elev);
  }

  .index__title {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-xl);
    font-weight: 600;
  }

  .index__lede {
    margin: var(--space-2) 0 0;
    color: var(--fg-dim);
  }

  .index__list {
    margin: var(--space-6) 0 0;
    padding: 0;
    list-style: none;
  }

  .index__empty {
    color: var(--fg-dim);
  }
</style>
