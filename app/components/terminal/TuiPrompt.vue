<script setup lang="ts">
  defineOptions({ inheritAttrs: false });

  defineProps<{
    busy: boolean;
    menuOpen: boolean;
    activeDescendant?: string;
  }>();

  const value = defineModel<string>({ required: true });
  const input = ref<HTMLInputElement | null>(null);

  function focus(): void {
    input.value?.focus();
  }

  defineExpose({ focus });
</script>

<template>
  <label class="prompt">
    <span aria-hidden="true">› </span>
    <input
      id="tui-app-prompt"
      ref="input"
      v-model="value"
      v-bind="$attrs"
      role="combobox"
      class="prompt__input"
      type="text"
      aria-label="App command"
      aria-autocomplete="list"
      :aria-busy="busy"
      :aria-controls="menuOpen ? 'tui-slash-listbox' : undefined"
      :aria-expanded="menuOpen"
      :aria-activedescendant="activeDescendant"
      autocapitalize="off"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      enterkeyhint="send"
    />
  </label>
</template>

<style scoped>
  .prompt {
    display: flex;
    align-items: baseline;
  }

  .prompt > span {
    color: var(--prompt);
  }

  .prompt__input {
    flex: 1;
    min-width: 0;
    padding: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--fg);
    font: inherit;
    caret-color: var(--accent);
  }

  @media (max-width: 899px) {
    .prompt {
      font-size: 1rem;
    }

    .prompt__input {
      min-height: 44px;
    }
  }
</style>
