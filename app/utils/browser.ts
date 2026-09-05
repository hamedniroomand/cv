export function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener');
}

export function downloadFile(url: string, filename = ''): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function hasTextSelection(): boolean {
  return Boolean(window.getSelection()?.toString());
}

export function isPlainKey(event: KeyboardEvent): boolean {
  return !event.ctrlKey && !event.altKey && !event.metaKey;
}

export function isControlKey(event: KeyboardEvent, key: string): boolean {
  return event.ctrlKey && !event.altKey && !event.metaKey && event.key.toLocaleLowerCase() === key;
}

export function selectContents(el: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(el);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

export async function waitForElement(id: string, frames: number): Promise<HTMLElement | null> {
  for (let i = 0; i < frames; i++) {
    const el = document.getElementById(id);
    if (el) return el;
    await nextFrame();
  }
  return null;
}
