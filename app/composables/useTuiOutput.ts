import type { OutputLine } from '~/terminal/types';
import { createPrinter } from '~/tui/view';

export function useTuiOutput() {
  const lines = ref<OutputLine[]>([]);
  let nextId = 0;

  const sink = (line: OutputLine): void => {
    lines.value.push(line);
  };
  const id = (): number => ++nextId;
  const print = createPrinter(sink, id);
  const clear = (): void => {
    lines.value = [];
  };

  return { lines, sink, nextId: id, print, clear };
}
