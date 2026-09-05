export function githubUrl(handle: string): string {
  return `https://github.com/${handle}`;
}

export function gistUrl(owner: string, id: string): string {
  return `https://gist.github.com/${owner}/${id}`;
}

export function mailtoUrl(email: string): string {
  return `mailto:${email}`;
}

export function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//, '');
}

export function linkLabel(url: string): string {
  return stripScheme(url).replace(/^www\./, '');
}
