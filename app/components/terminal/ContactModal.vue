<script setup lang="ts">
  const emit = defineEmits<{ close: [] }>();

  const dialog = ref<HTMLDialogElement | null>(null);
  const widget = ref<{ reset: () => void } | null>(null);
  const { form, state, error, errors, submit } = useContactForm();
  const siteKey = useRuntimeConfig().public.turnstile.siteKey;
  const verified = computed(() => !siteKey || form.turnstileToken !== '');
  const sending = computed(() => state.value === 'sending');

  onMounted(() => dialog.value?.showModal());

  function close(): void {
    dialog.value?.close();
    emit('close');
  }

  async function onSubmit(): Promise<void> {
    const sent = await submit();
    if (!sent) widget.value?.reset();
  }
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    aria-labelledby="contact-title"
    @cancel.prevent="close"
    @click.self="close"
  >
    <form
      class="modal__form"
      novalidate
      @submit.prevent="onSubmit"
    >
      <h2
        id="contact-title"
        class="modal__title"
      >
        $ contact --send
      </h2>
      <template v-if="state !== 'sent'">
        <ContactField
          v-model="form.name"
          name="name"
          label="name:"
          :error="errors.name"
          type="text"
          required
          maxlength="100"
          autocomplete="name"
        />
        <ContactField
          v-model="form.email"
          name="email"
          label="email:"
          :error="errors.email"
          type="email"
          required
          maxlength="200"
          autocomplete="email"
        />
        <ContactField
          v-model="form.message"
          name="message"
          label="message:"
          :error="errors.message"
          multiline
          required
          minlength="10"
          maxlength="5000"
          rows="5"
        />
        <input
          v-model="form.website"
          class="visually-hidden"
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
        />
        <div
          v-if="siteKey"
          class="modal__row"
        >
          <span aria-hidden="true" />
          <TurnstileWidget
            ref="widget"
            v-model="form.turnstileToken"
            :site-key="siteKey"
          />
        </div>
        <p
          v-if="error"
          class="modal__error"
          role="alert"
        >
          {{ error }}
        </p>
        <div class="modal__actions">
          <button
            type="submit"
            class="btn"
            :disabled="sending || !verified"
          >
            {{ sending ? 'Sending…' : 'Send message' }}
          </button>
          <button
            type="button"
            class="btn btn-ghost"
            @click="close"
          >
            Cancel
          </button>
        </div>
      </template>
      <template v-else>
        <p
          class="modal__ok"
          role="status"
        >
          Sent. I'll reply to {{ form.email }}.
        </p>
        <div class="modal__actions">
          <button
            type="button"
            class="btn"
            @click="close"
          >
            Close
          </button>
        </div>
      </template>
    </form>
  </dialog>
</template>

<style scoped>
  .modal {
    --field-label-width: 5.5rem;

    width: min(32rem, calc(100vw - 2rem));
    padding: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-elev);
    color: var(--fg);
    box-shadow: var(--shadow);
    font-family: var(--font-mono);
  }

  .modal::backdrop {
    background: rgb(0 0 0 / 55%);
  }

  .modal__form {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-6);
  }

  .modal__title {
    margin: 0 0 var(--space-2);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--prompt);
  }

  .modal__row {
    display: grid;
    grid-template-columns: var(--field-label-width) 1fr;
    gap: var(--space-2);
  }

  .modal__error {
    margin: 0;
    color: var(--error);
    font-size: var(--text-sm);
  }

  .modal__ok {
    margin: 0;
    color: var(--success);
  }

  .modal__actions {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }

  @media (max-width: 480px) {
    .modal__row {
      grid-template-columns: 1fr;
    }
  }
</style>
