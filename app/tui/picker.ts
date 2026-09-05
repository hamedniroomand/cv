import type { PickerItem } from './types';

export function pickerItemMatches(item: PickerItem<unknown>, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  const haystack = [item.label, item.description ?? '', ...(item.keywords ?? [])]
    .join(' ')
    .toLocaleLowerCase();
  return haystack.includes(needle);
}
