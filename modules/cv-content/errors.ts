export class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`content validation failed in ${file}: ${detail}`);
    this.name = 'ContentError';
  }
}
