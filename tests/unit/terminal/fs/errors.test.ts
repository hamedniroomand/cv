import { describe, expect, it } from 'vite-plus/test';

import { FsError, fsErrorMessage, fsErrorReason, isFsError } from '~/terminal/fs/errors';

describe('fsError', () => {
  it('formats the reason for a command', () => {
    const err = new FsError('EACCES', '.secrets');
    expect(fsErrorReason(err)).toBe('Permission denied');
    expect(fsErrorMessage('cat', err)).toBe('cat: .secrets: Permission denied');
    expect(err.message).toBe('.secrets: Permission denied');
    expect(err.name).toBe('FsError');
  });

  it('recognises its own instances', () => {
    expect(isFsError(new FsError('ENOENT', 'x'))).toBe(true);
    expect(isFsError(new Error('x'))).toBe(false);
  });
});
