import type { Ref } from 'vue';

import type { History } from '~/terminal/shell/history';

export function usePromptHistory(value: Ref<string>, history: History) {
  function up(): void {
    const previous = history.up(value.value);
    if (previous !== null) value.value = previous;
  }

  function down(): void {
    const next = history.down();
    if (next !== null) value.value = next;
  }

  return { up, down };
}
