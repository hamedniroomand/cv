import type { Ref } from 'vue';

/** Marks each section one time when it enters the viewport. Without JS the content stays visible. */
export function useSectionReveals(root: Ref<HTMLElement | null>): void {
  let observer: IntersectionObserver | undefined;
  const seen = new WeakSet<Element>();
  const nuxt = useNuxtApp();

  function observe(): void {
    if (!observer || !root.value) return;
    observer.disconnect();
    const sections = root.value.querySelectorAll(
      '.home-page > section:not(.home-hero), .project-story, .index__list > li',
    );
    for (const section of sections) {
      if (!seen.has(section)) observer.observe(section);
    }
  }

  const unhook = nuxt.hook('page:finish', () => nextTick(observe));
  onMounted(() => {
    if (!('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          seen.add(entry.target);
          entry.target.classList.add('section-revealed');
          observer?.unobserve(entry.target);
        }
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    );
    observe();
  });
  onBeforeUnmount(() => {
    observer?.disconnect();
    unhook();
  });
}
