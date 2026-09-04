import type { Command, OutputLine } from '~/terminal/types'
import { describe, expect, it } from 'vitest'
import { makeShell } from '../../fixtures/context'

const echo: Command = {
  name: 'echo',
  description: '',
  usage: 'echo',
  run: (argv, ctx) => {
    ctx.stdout.line(argv.join(' '))
    return 0
  },
}
const upper: Command = {
  name: 'upper',
  description: '',
  usage: 'upper',
  run: (_a, ctx) => {
    ctx.stdout.line((ctx.stdin ?? '').trim().toUpperCase())
    return 0
  },
}
const fail: Command = {
  name: 'fail',
  description: '',
  usage: 'fail',
  run: () => {
    throw new Error('boom')
  },
}
const exit3: Command = { name: 'exit3', description: '', usage: '', run: () => 3 }
const needsSudo: Command = {
  name: 'needs-sudo',
  description: '',
  usage: '',
  run: (_a, ctx) => {
    ctx.stdout.line(ctx.sudo ? 'root' : 'user')
    return 0
  },
}
const slow: Command = {
  name: 'slow',
  description: '',
  usage: '',
  run: (_a, ctx) => new Promise<number>((resolve) => {
    ctx.signal.addEventListener('abort', () => resolve(130))
  }),
}
const partial: Command = {
  name: 'partial',
  description: '',
  usage: '',
  run: (_a, ctx) => {
    ctx.stdout.write('no newline')
    return 0
  },
}
const whoCalled: Command = {
  name: 'real',
  aliases: ['alias'],
  description: '',
  usage: '',
  run: (_a, ctx) => {
    ctx.stdout.line(ctx.argv0)
    return 0
  },
}
const stderrCmd: Command = {
  name: 'warn',
  description: '',
  usage: '',
  run: (_a, ctx) => {
    ctx.stderr.line('careful')
    ctx.stdout.line('ok')
    return 0
  },
}

describe('shell.exec', () => {
  it('runs a command and returns its exit code', async () => {
    const { shell, text } = makeShell([echo, exit3])
    expect(await shell.exec('echo hi there')).toEqual({ code: 0 })
    expect(text()).toBe('hi there')
    expect((await shell.exec('exit3')).code).toBe(3)
  })
  it('pipes stdout into stdin and returns the last exit code', async () => {
    const { shell, text } = makeShell([echo, upper])
    expect((await shell.exec('echo hi | upper')).code).toBe(0)
    expect(text()).toBe('HI')
  })
  it('reports unknown commands with 127', async () => {
    const { shell, text, lines } = makeShell([])
    expect((await shell.exec('nope')).code).toBe(127)
    expect(text()).toBe('bash: nope: command not found')
    expect(lines[0]!.spans[0]!.style).toBe('error')
  })
  it('turns thrown errors into stderr with exit 1', async () => {
    const { shell, text } = makeShell([fail])
    expect((await shell.exec('fail')).code).toBe(1)
    expect(text()).toBe('fail: boom')
  })
  it('reports syntax errors with exit 2', async () => {
    const { shell, text } = makeShell([])
    expect((await shell.exec('echo "x')).code).toBe(2)
    expect(text()).toMatch(/unterminated/)
  })
  it('passes the sudo flag; bare sudo prints usage', async () => {
    const { shell, text } = makeShell([needsSudo])
    await shell.exec('sudo needs-sudo')
    expect(text()).toBe('root')
    const s2 = makeShell([])
    expect((await s2.shell.exec('sudo')).code).toBe(1)
    expect(s2.text()).toMatch(/usage: sudo <command>/)
  })
  it('blank line is a no-op', async () => {
    const { shell, lines } = makeShell([])
    expect(await shell.exec('   ')).toEqual({ code: 0 })
    expect(lines).toEqual([])
  })
  it('aborts through the signal', async () => {
    const { shell } = makeShell([slow])
    const ac = new AbortController()
    const p = shell.exec('slow', ac.signal)
    ac.abort()
    expect((await p).code).toBe(130)
  })
  it('flushes partial output when a command ends', async () => {
    const { shell, text } = makeShell([partial])
    await shell.exec('partial')
    expect(text()).toBe('no newline')
  })
  it('passes the typed alias as argv0', async () => {
    const { shell, text } = makeShell([whoCalled])
    await shell.exec('alias')
    expect(text()).toBe('alias')
  })
  it('stderr is not piped', async () => {
    const { shell, text } = makeShell([stderrCmd, upper])
    await shell.exec('warn | upper')
    expect(text()).toBe('careful\nOK')
  })
  it('routes one execution to paired output overrides without changing constructor output', async () => {
    const { shell, lines: normalLines } = makeShell([stderrCmd])
    const appLines: OutputLine[] = []
    let appId = 40
    const signal = new AbortController().signal

    await shell.exec('warn', signal, {
      sink: line => appLines.push(line),
      nextId: () => ++appId,
    })

    expect(appLines.map(line => line.spans.map(span => span.text).join(''))).toEqual(['careful', 'ok'])
    expect(appLines.map(line => line.id)).toEqual([41, 42])
    expect(appLines[0]!.spans[0]!.style).toBe('error')
    expect(normalLines).toEqual([])

    await shell.exec('warn', signal)
    expect(normalLines.map(line => line.id)).toEqual([1, 2])
    expect(appLines).toHaveLength(2)
  })
})

describe('tty flag', () => {
  it('is true for the last segment and false when piped', async () => {
    const seen: boolean[] = []
    const probe: Command = {
      name: 'probe',
      description: '',
      usage: 'probe',
      run: (_a, ctx) => {
        seen.push(ctx.tty)
        ctx.stdout.line('x')
        return 0
      },
    }
    const s = makeShell([probe])
    await s.shell.exec('probe | probe')
    expect(seen).toEqual([false, true])
  })
})
