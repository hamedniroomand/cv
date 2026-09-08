<script setup lang="ts">
  defineProps<{ terminalOpen: boolean }>();
  defineEmits<{ toggleTerminal: [] }>();

  const route = useRoute();
  const launcher = ref<{ focus: () => void } | null>(null);

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
        <ThemePicker />
        <TerminalLauncher
          ref="launcher"
          :expanded="terminalOpen"
          @activate="$emit('toggleTerminal')"
        />
      </div>
    </div>
  </header>
</template>
