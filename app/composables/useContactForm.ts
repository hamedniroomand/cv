import type { ContactFieldErrors } from '#shared/schemas/contact';
import { contactFailureFeedback, contactFieldErrors } from '#shared/schemas/contact';

export type ContactState = 'idle' | 'sending' | 'sent' | 'error';

export function useContactForm() {
  const form = reactive({ name: '', email: '', message: '', website: '', turnstileToken: '' });
  const state = ref<ContactState>('idle');
  const error = ref('');
  const errors = ref<ContactFieldErrors>({});

  function validate(): boolean {
    errors.value = contactFieldErrors(form);
    if (Object.keys(errors.value).length === 0) return true;
    state.value = 'error';
    return false;
  }

  async function submit(): Promise<boolean> {
    error.value = '';
    if (!validate()) return false;
    state.value = 'sending';
    try {
      await $fetch('/api/contact', { method: 'POST', body: form });
      state.value = 'sent';
      return true;
    } catch (err) {
      state.value = 'error';
      const feedback = contactFailureFeedback((err as { data?: unknown }).data);
      errors.value = feedback.errors;
      error.value = feedback.message;
      return false;
    }
  }

  return { form, state, error, errors, submit };
}
