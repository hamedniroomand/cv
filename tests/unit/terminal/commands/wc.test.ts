import type { Command } from '~/terminal/types'
import { describe, expect, it } from 'vitest'
import { commands } from '~/terminal/commands'
import { makeShell } from '../../fixtures/context'

const exactInput = {
  name: 'test-input',
  description: 'Emit exact test input',
  usage: 'test-input <case>',
  run(argv, ctx) {
    const inputs: Record<string, string> = {
      empty: '',
      plain: 'abc',
      partial: 'a\nb',
    }
    ctx.stdout.write(inputs[argv[0] ?? ''] ?? '')
    return 0
  },
} satisfies Command

const testCommands = [...commands, exactInput]

describe('wc', () => {
  it('counts lines from pipeline input', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('echo "a\nb\nc" | wc -l')).code).toBe(0)
    expect(s.text()).toBe('3')
  })

  it('counts lines in a file and labels the result', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('wc -l about.md')).code).toBe(0)
    expect(s.text()).toBe('2 about.md')
  })

  it.each([
    ['empty', '0'],
    ['plain', '0'],
    ['partial', '1'],
  ])('counts newline characters for %s input', async (input, expected) => {
    const s = makeShell(testCommands)
    expect((await s.shell.exec(`test-input ${input} | wc -l`)).code).toBe(0)
    expect(s.text()).toBe(expected)
  })

  it('supports word and UTF-8 byte counts', async () => {
    const words = makeShell(commands)
    expect((await words.shell.exec('echo "one two" | wc -w')).code).toBe(0)
    expect(words.text()).toBe('2')

    const bytes = makeShell(commands)
    expect((await bytes.shell.exec('echo "é" | wc -c')).code).toBe(0)
    expect(bytes.text()).toBe('3')
  })

  it('supports combined flags in canonical output order', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('echo "é two" | wc -lwc')).code).toBe(0)
    expect(s.text()).toBe('      1       2       7')
  })

  it('prints each file and a total for multiple files', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('wc -l experience/acme/README.md experience/globex/README.md')).code).toBe(0)
    expect(s.text()).toBe([
      '6 experience/acme/README.md',
      '5 experience/globex/README.md',
      '11 total',
    ].join('\n'))
  })

  it('prints line, word, and byte counts by default', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('echo hi | wc')).code).toBe(0)
    expect(s.text()).toBe('      1       1       3')
  })

  it('reports missing files', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('wc nope')).code).toBe(1)
    expect(s.text()).toBe('wc: nope: No such file or directory')
  })
})
