import { describe, expect, it, vi } from 'vitest'
import { commands } from '~/terminal/commands'
import { navigateFor, parseCount, readInput, reportFsError } from '~/terminal/commands/_util'
import { FsError } from '~/terminal/fs/errors'
import { makeShell } from '../../fixtures/context'

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
    const s = makeShell(commands)
    const navigate = vi.fn()
    navigateFor({ fs: s.deps.fs, panel: { navigate, toggle: () => {} } } as never, 'nope')
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
