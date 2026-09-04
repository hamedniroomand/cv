/** In-memory command history with bash-like ↑/↓ navigation. */
export class History {
  private entries: string[] = []
  /** Index into entries while navigating; equals entries.length when at the draft. */
  private cursor = 0
  private draft = ''

  constructor(private readonly max = 500) {}

  push(line: string): void {
    const trimmed = line.trim()
    if (trimmed && this.entries[this.entries.length - 1] !== trimmed) {
      this.entries.push(trimmed)
      if (this.entries.length > this.max)
        this.entries.splice(0, this.entries.length - this.max)
    }
    this.cursor = this.entries.length
  }

  /** Move to the previous entry. Saves `draft` when leaving the prompt. Null at the oldest entry. */
  up(draft: string): string | null {
    if (this.cursor === 0)
      return null
    if (this.cursor === this.entries.length)
      this.draft = draft
    this.cursor--
    return this.entries[this.cursor] ?? null
  }

  /** Move to the next entry; returns the saved draft when passing the newest entry. Null at the draft. */
  down(): string | null {
    if (this.cursor >= this.entries.length)
      return null
    this.cursor++
    return this.cursor === this.entries.length ? this.draft : (this.entries[this.cursor] ?? null)
  }

  list(): readonly string[] {
    return this.entries
  }
}
