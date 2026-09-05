export type ShareResult = 'shared' | 'copied' | 'failed';

export function useShare() {
  const { copy } = useClipboard();

  async function share(title: string, url: string): Promise<ShareResult> {
    if (typeof navigator.share === 'function') {
      const shared = await navigator.share({ title, url }).then(
        () => true,
        () => false,
      );
      if (shared) return 'shared';
    }
    return (await copy(url)) ? 'copied' : 'failed';
  }

  return { share };
}
