import { describe, expect, it, vi } from 'vitest'
import { makeShell } from '~~/tests/unit/fixtures/context'
import { commands } from '~/terminal/commands'
import { navigateFor, parseCount, printUsage, readInput, reportFsError, visibleCommands, writeLink } from '~/terminal/commands/_util'
import { FsError } from '~/terminal/fs/errors'
import { LineWriter } from '~/terminal/io/writer'
import { createRegistry } from '~/terminal/shell/registry'

describe('reportFsError', () => {
  it('prints filesystem errors and rethrows anything else', () => {
    const stderr = { line: vi.fn() }
    expect(reportFsError({ argv0: 'cat', stderr } as never, new FsError('ENOENT', 'x'))).toBe(1)
    expect(stderr.line).toHaveBeenCalledWith('cat: x: No such file or directory')
    expect(() => reportFsError({ argv0: 'cat', stderr } as never, new Error('boom'))).toThrow('boom')
  })
})

describe('navigateFor', () => {
  it('no-ops when the path is missing', () => {
    const term = makeShell(commands)
    const navigate = vi.fn()
    navigateFor({ fs: term.deps.fs, panel: { navigate, toggle: () => {} } } as never, 'nope')
    expect(navigate).not.toHaveBeenCalled()
  })
})

describe('parseCount / readInput', () => {
  it('falls back on invalid counts and prints usage without stdin', () => {
    expect(parseCount('nope', 10)).toBe(10)
    expect(parseCount(undefined, 10)).toBe(10)
    const stderr = { line: vi.fn() }
    expect(readInput({ stdin: null, registry: { get: () => undefined }, argv0: 'tail', stderr } as never, [])).toBeNull()
    expect(stderr.line).toHaveBeenCalledWith('usage: tail')
  })
})

describe('writeLink', () => {
  it('writes a label, a link and a line break', () => {
    const term = makeShell(commands)
    const writer = new LineWriter(line => term.lines.push(line), () => 1)
    writeLink(writer, 'Email: ', 'me@example.com', 'mailto:me@example.com')
    writer.flush()
    expect(term.lines).toHaveLength(1)
    expect(term.lines[0]!.spans).toEqual([
      { text: 'Email: ' },
      { text: 'me@example.com', style: 'accent', href: 'mailto:me@example.com' },
    ])
  })
})

describe('printUsage', () => {
  it('prints the usage of the running command and returns the code', () => {
    const term = makeShell(commands)
    const stderr = { line: vi.fn() }
    const ctx = { argv0: 'ls', registry: term.deps.registry, stderr } as never
    expect(printUsage(ctx, 2)).toBe(2)
    expect(stderr.line).toHaveBeenCalledWith('usage: ls [-la] [path...]')
  })
})

describe('visibleCommands', () => {
  it('lists command names without hidden ones', () => {
    const registry = createRegistry([
      { name: 'b', description: '', usage: '', run: () => 0 },
      { name: 'a', description: '', usage: '', run: () => 0, hidden: true },
    ])
    expect(visibleCommands({ registry })).toEqual(['b'])
  })
})
