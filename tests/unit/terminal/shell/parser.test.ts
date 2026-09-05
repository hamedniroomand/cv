import { describe, expect, it } from 'vite-plus/test';

import { ShellSyntaxError } from '~/terminal/shell/errors';
import { parse } from '~/terminal/shell/parser';

describe('parse', () => {
  it('parses a simple command', () => {
    expect(parse('ls -la')).toEqual({ segments: [{ argv: ['ls', '-la'], sudo: false }] });
  });

  it('parses pipelines', () => {
    expect(parse('cat skills.json | jq .').segments.map(s => s.argv)).toEqual([
      ['cat', 'skills.json'],
      ['jq', '.'],
    ]);
  });

  it('extracts sudo prefix', () => {
    expect(parse('sudo cat .secrets')).toEqual({
      segments: [{ argv: ['cat', '.secrets'], sudo: true }],
    });
    expect(parse('sudo sudo ls')).toEqual({ segments: [{ argv: ['ls'], sudo: true }] });
  });

  it('bare sudo is a segment with empty argv and sudo=true', () => {
    expect(parse('sudo')).toEqual({ segments: [{ argv: [], sudo: true }] });
  });

  it('rejects empty segments', () => {
    expect(() => parse('| grep x')).toThrow(ShellSyntaxError);
    expect(() => parse('ls |')).toThrow(/unexpected token `\|'/);
    expect(() => parse('ls || grep')).toThrow(ShellSyntaxError);
  });

  it('empty input → no segments', () => expect(parse('')).toEqual({ segments: [] }));
});
