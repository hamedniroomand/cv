import type { AppContext, PickerItem, PickOptions } from './types'

export function chooseValue(
  argv: string[],
  ctx: AppContext,
  title: string,
  items: PickerItem[],
  opts?: PickOptions<string>,
): Promise<string | null> {
  const requested = argv[0]
  return requested === undefined ? ctx.view.pick(title, items, opts) : Promise.resolve(requested)
}
