import { describe, expect, it } from 'vite-plus/test';

import { gistUrl, githubUrl, linkLabel, mailtoUrl, stripScheme } from '#shared/cv/links';

describe('links', () => {
  it('builds github and mailto urls', () => {
    expect(githubUrl('hamed')).toBe('https://github.com/hamed');
    expect(mailtoUrl('me@example.com')).toBe('mailto:me@example.com');
  });

  it('strips the scheme but keeps www', () => {
    expect(stripScheme('https://www.linkedin.com/in/x')).toBe('www.linkedin.com/in/x');
    expect(stripScheme('http://example.com')).toBe('example.com');
    expect(stripScheme('example.com')).toBe('example.com');
  });

  it('builds a short label without scheme or www', () => {
    expect(linkLabel('https://www.linkedin.com/in/x')).toBe('linkedin.com/in/x');
    expect(linkLabel('https://linkedin.com/in/x')).toBe('linkedin.com/in/x');
  });

  it('builds gist urls', () => {
    expect(gistUrl('hamedniroomand', 'dc74c846d1e701c65779fdaf7d58e1bf')).toBe(
      'https://gist.github.com/hamedniroomand/dc74c846d1e701c65779fdaf7d58e1bf',
    );
  });
});
