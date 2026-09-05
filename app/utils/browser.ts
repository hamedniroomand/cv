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
