/** One editor extension, as `code --list-extensions` prints it. */
export interface EditorExtension {
  id: string;
  publisher: string;
  name: string;
}

const MARKETPLACE = 'https://marketplace.visualstudio.com/items?itemName=';

/** The address of an extension in the Visual Studio Marketplace. */
export function marketplaceUrl(id: string): string {
  return `${MARKETPLACE}${id}`;
}

/**
 * Reads the output of `code --list-extensions`.
 * Each line holds one identifier, in the form `publisher.name`. The function
 * ignores empty lines and comment lines, and it drops a line of another form.
 */
export function parseExtensions(content: string): EditorExtension[] {
  const extensions: EditorExtension[] = [];
  for (const line of content.split('\n')) {
    const id = line.trim();
    if (id === '' || id.startsWith('#')) continue;
    const dot = id.indexOf('.');
    if (dot <= 0 || dot === id.length - 1) continue;
    extensions.push({ id, publisher: id.slice(0, dot), name: id.slice(dot + 1) });
  }
  return extensions;
}
