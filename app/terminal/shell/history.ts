export class History {
  private entries: string[] = [];
  private cursor = 0;
  private draft = '';

  constructor(private readonly max = 500) {}

  push(line: string): void {
    const trimmed = line.trim();
    if (trimmed && this.entries[this.entries.length - 1] !== trimmed) {
      this.entries.push(trimmed);
      if (this.entries.length > this.max) this.entries.splice(0, this.entries.length - this.max);
    }
    this.cursor = this.entries.length;
  }

  up(draft: string): string | null {
    if (this.cursor === 0) return null;
    if (this.cursor === this.entries.length) this.draft = draft;
    this.cursor--;
    return this.entries[this.cursor] ?? null;
  }

  down(): string | null {
    if (this.cursor >= this.entries.length) return null;
    this.cursor++;
    return this.cursor === this.entries.length ? this.draft : (this.entries[this.cursor] ?? null);
  }

  list(): readonly string[] {
    return this.entries;
  }
}
