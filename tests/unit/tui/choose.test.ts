import { describe, expect, it, vi } from 'vite-plus/test';

import { chooseValue } from '~/tui/choose';
import type { AppContext } from '~/tui/types';

const items = [{ value: 'a', label: 'A' }];

describe('chooseValue', () => {
  it('returns the first argument without opening the picker', async () => {
    const pick = vi.fn();
    const ctx = { view: { pick } } as unknown as AppContext;
    expect(await chooseValue(['a'], ctx, 'Pick', items)).toBe('a');
    expect(pick).not.toHaveBeenCalled();
  });

  it('opens the picker when no argument is given', async () => {
    const pick = vi.fn().mockResolvedValue(null);
    const ctx = { view: { pick } } as unknown as AppContext;
    expect(await chooseValue([], ctx, 'Pick', items, { placeholder: 'Filter' })).toBeNull();
    expect(pick).toHaveBeenCalledWith('Pick', items, { placeholder: 'Filter' });
  });
});
