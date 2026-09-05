export interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onTurnstileLoad?: () => void;
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';

function appendScript(onError: () => void): void {
  if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
  const script = document.createElement('script');
  script.src = SCRIPT_SRC;
  script.async = true;
  script.onerror = onError;
  document.head.appendChild(script);
}

export function loadTurnstile(): Promise<TurnstileApi> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile);
      return;
    }
    const previous = window.onTurnstileLoad;
    window.onTurnstileLoad = () => {
      previous?.();
      if (window.turnstile) resolve(window.turnstile);
    };
    appendScript(() => reject(new Error('turnstile script failed to load')));
  });
}

export function turnstileTheme(): 'light' | 'dark' | 'auto' {
  const explicit = document.documentElement.dataset.theme;
  if (!explicit) return 'auto';
  return explicit === 'light' ? 'light' : 'dark';
}
