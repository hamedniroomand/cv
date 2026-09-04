import type { PickerItem, PickOptions, View } from '~/tui/types'

export interface PickerState {
  title: string
  items: PickerItem<unknown>[]
  initial?: unknown
  placeholder?: string
  resolve: (value: unknown | null) => void
}

export function useTuiPicker(onSettled: () => void) {
  const picker = ref<PickerState | null>(null)

  function settle(result: unknown | null): void {
    const current = picker.value
    if (!current)
      return
    picker.value = null
    current.resolve(result)
    onSettled()
  }

  const pick: View['pick'] = <T>(title: string, items: PickerItem<T>[], opts: PickOptions<T> = {}) => {
    settle(null)
    return new Promise<T | null>((resolve) => {
      picker.value = {
        title,
        items: items as PickerItem<unknown>[],
        initial: opts.initial,
        placeholder: opts.placeholder,
        resolve: result => resolve(result as T | null),
      }
    })
  }

  return { picker: readonly(picker), pick, settle }
}
