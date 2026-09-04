import type { ModalKind } from '~/terminal/types'

interface ModalRequest {
  kind: ModalKind
  resolve: () => void
}

export function useModalRequest() {
  const modal = ref<ModalRequest | null>(null)

  function request(kind: ModalKind): Promise<void> {
    return new Promise<void>((resolve) => {
      modal.value = { kind, resolve }
    })
  }

  function close(): void {
    modal.value?.resolve()
    modal.value = null
  }

  const kind = computed(() => modal.value?.kind ?? null)

  return { kind, request, close }
}
