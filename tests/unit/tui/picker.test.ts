import { describe, expect, it } from 'vite-plus/test';

import { pickerItemMatches } from '~/tui/picker';

const item = {
  value: 'acme',
  label: 'Acme',
  description: 'Team Lead',
  keywords: ['acme', 'Vue 3'],
};

describe('pickerItemMatches', () => {
  it('matches everything for an empty query', () => {
    expect(pickerItemMatches(item, '')).toBe(true);
    expect(pickerItemMatches(item, '   ')).toBe(true);
  });

  it('matches label, description and keywords without case', () => {
    expect(pickerItemMatches(item, 'ACME')).toBe(true);
    expect(pickerItemMatches(item, 'lead')).toBe(true);
    expect(pickerItemMatches(item, 'vue')).toBe(true);
    expect(pickerItemMatches(item, 'react')).toBe(false);
  });

  it('works without optional fields', () => {
    expect(pickerItemMatches({ value: 'x', label: 'Only' }, 'only')).toBe(true);
  });
});
