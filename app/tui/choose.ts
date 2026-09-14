import type { AppContext, PickerItem, PickOptions } from './types';

export function chooseValue(
  argv: string[],
  ctx: AppContext,
  title: string,
  items: PickerItem[],
  opts?: PickOptions<string>,
): Promise<string | null> {
  const requested = argv[0];
  return requested === undefined ? ctx.view.pick(title, items, opts) : Promise.resolve(requested);
}

export function findBySlug<T extends { slug: string }>(input: string, items: T[]): T | undefined {
  const query = input.toLocaleLowerCase();
  return items.find(item => item.slug.toLocaleLowerCase() === query);
}
