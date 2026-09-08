<script setup lang="ts">
  import { THEMES } from '#shared/theme';
  import type { ThemeName } from '#shared/theme';

  defineProps<{ terminalOpen: boolean }>();
  defineEmits<{ toggleTerminal: [] }>();

  const route = useRoute();
  const { theme, set } = useTheme();
  const launcher = ref<{ focus: () => void } | null>(null);

  function changeTheme(event: Event): void {
    set((event.target as HTMLSelectElement).value as ThemeName);
  }

  defineExpose({ focusTerminalButton: () => launcher.value?.focus() });
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink
        to="/"
        class="site-brand"
        aria-label="Hamed Niroomand — Home"
      >
        <span
          class="site-brand__mark"
          aria-hidden="true"
          >h<span>.</span></span
        >
        <span>hamed<span class="site-brand__domain"> / niroomand.dev</span></span>
      </NuxtLink>
      <nav
        aria-label="Main navigation"
        class="site-nav"
      >
        <NuxtLink
          to="/#projects"
          :class="{ 'is-current': route.path.startsWith('/projects') }"
          >Projects</NuxtLink
        >
        <NuxtLink to="/#experience">Experience</NuxtLink>
        <NuxtLink to="/dotfiles">Dotfiles</NuxtLink>
      </nav>
      <div class="site-controls">
        <label class="theme-select">
          <span class="visually-hidden">Color theme</span>
          <select
            :value="theme"
            aria-label="Color theme"
            @change="changeTheme"
          >
            <option
              v-for="name in THEMES"
              :key="name"
              :value="name"
            >
              {{ name }}
            </option>
          </select>
        </label>
        <TerminalLauncher
          ref="launcher"
          :expanded="terminalOpen"
          @activate="$emit('toggleTerminal')"
        />
      </div>
    </div>
  </header>
</template>
