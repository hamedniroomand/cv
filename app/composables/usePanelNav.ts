import type { PanelTarget } from '#shared/cv/panel-target';
import { panelRoute, panelTargetId } from '#shared/cv/panel-target';

const HIGHLIGHT_MS = 1200;
const MAX_FRAMES = 30;

export function usePanelNav() {
  const active = useState<string | null>('panel-active', () => null);
  const reduced = useReducedMotion();
  const router = useRouter();
  let timer: ReturnType<typeof setTimeout> | undefined;

  function highlight(id: string): void {
    active.value = id;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (active.value === id) active.value = null;
    }, HIGHLIGHT_MS);
  }

  async function navigate(target: PanelTarget): Promise<void> {
    if (!import.meta.client) return;
    const id = panelTargetId(target);
    let el = document.getElementById(id);
    if (!el) {
      const route = panelRoute(target);
      if (router.currentRoute.value.path === route) return;
      await router.push(route);
      el = await waitForElement(id, MAX_FRAMES);
      if (!el) return;
    }
    el.scrollIntoView({ block: 'start', behavior: reduced.value ? 'auto' : 'smooth' });
    highlight(id);
  }

  return { navigate, active: readonly(active) };
}

export function usePanelHighlight(id: MaybeRefOrGetter<string>) {
  const { active } = usePanelNav();
  return computed(() => active.value === toValue(id));
}
