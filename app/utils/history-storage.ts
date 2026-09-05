import { HISTORY_STORAGE_KEY, parseHistory } from '#shared/history';
import type { HistoryStore } from '~/terminal/shell/history';

export function createHistoryStore(limit: number): HistoryStore {
  return {
    load: () => parseHistory(readStorage(HISTORY_STORAGE_KEY), limit),
    save: lines => {
      writeStorage(HISTORY_STORAGE_KEY, JSON.stringify(lines.slice(-limit)));
    },
  };
}
