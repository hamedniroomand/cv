<script setup lang="ts">
/**
 * Cloudflare Turnstile in explicit-render mode. Loads the API script once, renders the widget into
 * this element and reports the token through v-model. An empty token means "not verified yet".
 */
interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
    onTurnstileLoad?: () => void
  }
}

const props = defineProps<{ siteKey: string }>()
const token = defineModel<string>({ default: '' })

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad'

const el = ref<HTMLElement | null>(null)
let widgetId: string | undefined

function loadApi(): Promise<TurnstileApi> {
  return new Promise((resolve, reject) => {
    if (window.turnstile)
      return resolve(window.turnstile)
    const previous = window.onTurnstileLoad
    window.onTurnstileLoad = () => {
      previous?.()
      if (window.turnstile)
        resolve(window.turnstile)
    }
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`))
      return
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onerror = () => reject(new Error('turnstile script failed to load'))
    document.head.appendChild(script)
  })
}

/** Match the page: an explicit theme choice wins, otherwise Cloudflare follows the OS preference like our CSS does. */
function widgetTheme(): 'light' | 'dark' | 'auto' {
  const explicit = document.documentElement.dataset.theme
  if (!explicit)
    return 'auto'
  return explicit === 'light' ? 'light' : 'dark'
}

onMounted(async () => {
  let api: TurnstileApi
  try {
    api = await loadApi()
  }
  catch {
    return
  }
  if (!el.value)
    return
  widgetId = api.render(el.value, {
    'sitekey': props.siteKey,
    'theme': widgetTheme(),
    'size': 'flexible',
    'callback': (value: string) => { token.value = value },
    'expired-callback': () => { token.value = '' },
    'error-callback': () => { token.value = '' },
  })
})

onBeforeUnmount(() => {
  if (widgetId)
    window.turnstile?.remove(widgetId)
})

/** Ask for a fresh token, e.g. after a failed submit consumed the previous one. */
function reset(): void {
  token.value = ''
  if (widgetId)
    window.turnstile?.reset(widgetId)
}

defineExpose({ reset })
</script>

<template>
  <div ref="el" class="turnstile" />
</template>

<style scoped>
.turnstile {
  min-height: 65px;
}
</style>
