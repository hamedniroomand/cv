export class ShellSyntaxError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ShellSyntaxError'
  }
}
