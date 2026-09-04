import type { Ref } from 'vue'
import type { AppCommand, AppContext, AppRegistry } from '~/tui/types'
import { pickerItemMatches } from '~/tui/picker'
import { filterCommands, parseSlashInput, slashOptionId } from '~/tui/slash'

export interface SlashMenuItem {
  key: string
  label: string
  detail?: string
  description?: string
  completion: string
  runLine: string
}

interface SlashMenuDeps {
  value: Ref<string>
  registry: AppRegistry
  blocked: () => boolean
  completionContext: (command: AppCommand) => AppContext
}

function commandItem(command: AppCommand): SlashMenuItem {
  return {
    key: command.name,
    label: `/${command.name}`,
    detail: command.args,
    description: command.description,
    completion: `/${command.name}${command.args ? ' ' : ''}`,
    runLine: `/${command.name}`,
  }
}

export function useSlashMenu({ value, registry, blocked, completionContext }: SlashMenuDeps) {
  const suppressed = ref(false)
  const parsed = computed(() => parseSlashInput(value.value))

  const visible = computed(() => {
    if (blocked() || suppressed.value || !parsed.value)
      return false
    if (parsed.value.partial)
      return true
    return Boolean(registry.get(parsed.value.name)?.complete)
  })

  const items = computed<SlashMenuItem[]>(() => {
    const slash = parsed.value
    if (!visible.value || !slash)
      return []
    if (slash.partial)
      return filterCommands(slash.name, registry.list()).map(commandItem)

    const command = registry.get(slash.name)
    const choices = command?.complete?.(slash.argv, completionContext(command))
    if (!command || !choices)
      return []
    const query = value.value.endsWith(' ') ? '' : (slash.argv.at(-1) ?? '')
    return choices
      .filter(item => pickerItemMatches(item, query))
      .map(item => ({
        key: `argument-${String(item.value)}`,
        label: item.label,
        description: item.description,
        completion: `/${command.name} ${String(item.value)}`,
        runLine: `/${command.name} ${String(item.value)}`,
      }))
  })

  const { selected, move, reset } = useListSelection(() => items.value.length)
  const current = computed(() => items.value[selected.value])
  const activeId = computed(() => (visible.value && current.value ? slashOptionId(current.value.key) : undefined))

  watch(value, reset)

  function suppress(): void {
    suppressed.value = true
  }

  function reveal(): void {
    suppressed.value = false
  }

  return { visible, items, selected, current, activeId, move, suppress, reveal }
}
