<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  name: string
  label: string
  error?: string
  multiline?: boolean
}>()

const value = defineModel<string>({ required: true })
const errorId = computed(() => `contact-error-${props.name}`)
</script>

<template>
  <label class="field" :class="{ 'field--area': multiline }">
    <span>{{ label }}</span>
    <textarea
      v-if="multiline"
      v-model="value"
      v-bind="$attrs"
      :name="name"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
    />
    <input
      v-else
      v-model="value"
      v-bind="$attrs"
      :name="name"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
    >
    <small v-if="error" :id="errorId" class="field__error">{{ error }}</small>
  </label>
</template>

<style scoped>
.field {
  display: grid;
  grid-template-columns: var(--field-label-width, 5.5rem) 1fr;
  align-items: baseline;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.field span {
  color: var(--fg-dim);
}

.field input,
.field textarea {
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--fg);
  font: inherit;
}

.field textarea {
  resize: vertical;
}

.field__error {
  grid-column: 2;
  color: var(--error);
  font-size: var(--text-xs);
}

.field input[aria-invalid='true'],
.field textarea[aria-invalid='true'] {
  border-color: var(--error);
}

.field input:focus,
.field textarea:focus {
  outline: 2px solid var(--accent);
  outline-offset: 0;
  border-color: transparent;
}

@media (max-width: 899px) {
  .field input,
  .field textarea {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .field {
    grid-template-columns: 1fr;
  }
}
</style>
