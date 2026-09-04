<script setup lang="ts">
import type { ContactFieldErrors } from '#shared/schemas/contact'
import { contactFieldErrors, issuesToFieldErrors } from '#shared/schemas/contact'

const emit = defineEmits<{ close: [] }>()

const dialog = ref<HTMLDialogElement | null>(null)
const widget = ref<{ reset: () => void } | null>(null)
const form = reactive({ name: '', email: '', message: '', website: '', turnstileToken: '' })
const state = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
/** Form-level message (delivery failure, captcha, honeypot). Field messages live in `errors`. */
const error = ref('')
const errors = ref<ContactFieldErrors>({})
/** Empty when Turnstile is not configured; the form then sends without a captcha. */
const siteKey = useRuntimeConfig().public.turnstile.siteKey
const verified = computed(() => !siteKey || form.turnstileToken !== '')

onMounted(() => {
  dialog.value?.showModal()
})

function close(): void {
  dialog.value?.close()
  emit('close')
}

async function submit(): Promise<void> {
  error.value = ''
  errors.value = contactFieldErrors(form)
  if (Object.keys(errors.value).length > 0) {
    state.value = 'error'
    return
  }
  state.value = 'sending'
  try {
    await $fetch('/api/contact', { method: 'POST', body: form })
    state.value = 'sent'
  }
  catch (err) {
    state.value = 'error'
    widget.value?.reset()
    const data = (err as { data?: { message?: string, issues?: unknown } }).data
    errors.value = issuesToFieldErrors(data?.issues)
    const { website, turnstileToken, ...fieldErrors } = errors.value
    const fieldLevel = Object.keys(fieldErrors).length > 0
    error.value = fieldLevel ? '' : website ?? turnstileToken ?? data?.message ?? 'Could not send. Try email instead.'
  }
}
</script>

<template>
  <dialog ref="dialog" class="modal" aria-labelledby="contact-title" @cancel.prevent="close" @click.self="close">
    <form class="modal__form" novalidate @submit.prevent="submit">
      <h2 id="contact-title" class="modal__title">
        $ contact --send
      </h2>
      <template v-if="state !== 'sent'">
        <label class="field">
          <span>name:</span>
          <input v-model="form.name" type="text" name="name" required maxlength="100" autocomplete="name" :aria-invalid="Boolean(errors.name)" :aria-describedby="errors.name ? 'contact-error-name' : undefined">
          <small v-if="errors.name" id="contact-error-name" class="field__error">{{ errors.name }}</small>
        </label>
        <label class="field">
          <span>email:</span>
          <input v-model="form.email" type="email" name="email" required maxlength="200" autocomplete="email" :aria-invalid="Boolean(errors.email)" :aria-describedby="errors.email ? 'contact-error-email' : undefined">
          <small v-if="errors.email" id="contact-error-email" class="field__error">{{ errors.email }}</small>
        </label>
        <label class="field field--area">
          <span>message:</span>
          <textarea v-model="form.message" name="message" required minlength="10" maxlength="5000" rows="5" :aria-invalid="Boolean(errors.message)" :aria-describedby="errors.message ? 'contact-error-message' : undefined" />
          <small v-if="errors.message" id="contact-error-message" class="field__error">{{ errors.message }}</small>
        </label>
        <!-- Honeypot: bots fill it, people never see it. -->
        <input v-model="form.website" class="visually-hidden" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div v-if="siteKey" class="field">
          <span aria-hidden="true" />
          <TurnstileWidget ref="widget" v-model="form.turnstileToken" :site-key="siteKey" />
        </div>
        <p v-if="error" class="modal__error" role="alert">
          {{ error }}
        </p>
        <div class="modal__actions">
          <button type="submit" class="btn" :disabled="state === 'sending' || !verified">
            {{ state === 'sending' ? 'Sending…' : 'Send message' }}
          </button>
          <button type="button" class="btn btn-ghost" @click="close">
            Cancel
          </button>
        </div>
      </template>
      <template v-else>
        <p class="modal__ok" role="status">
          Sent. I'll reply to {{ form.email }}.
        </p>
        <div class="modal__actions">
          <button type="button" class="btn" @click="close">
            Close
          </button>
        </div>
      </template>
    </form>
  </dialog>
</template>

<style scoped>
.modal {
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

.field {
  display: grid;
  grid-template-columns: 5.5rem 1fr;
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
