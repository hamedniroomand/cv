import { describe, expect, it } from 'vite-plus/test';

import { commands } from '~/terminal/commands';
import { completeLine } from '~/terminal/shell/completion';
import { makeShell } from '~~/tests/unit/fixtures/context';

describe('ls', () => {
  it('lists the cwd on one line with dirs suffixed', async () => {
    const term = makeShell(commands);
    expect((await term.exec('ls')).code).toBe(0);
    expect(term.text()).toBe(
      'about.md  contact.sh  education.md  experience/  projects/  skills.json',
    );
    expect(term.lines[0]!.spans.find(sp => sp.text === 'experience/')?.style).toBe('accent');
    expect(term.calls.navigate).toEqual([]);
  });

  it('shows dotfiles with -a and long format with -l', async () => {
    const term = makeShell(commands);
    await term.exec('ls -la');
    const out = term.text();
    expect(out).toMatch(/^-rw------- {2}1 hamed hamed +\d+ \w{3} +\d{1,2} \d{4} \.secrets$/m);
    expect(out).toMatch(/^drwxr-xr-x .* experience$/m);
    expect(out).toMatch(/^-rwxr-xr-x .* contact\.sh$/m);
    expect(out).toMatch(/^-rw-r--r-- .* about\.md$/m);
  });

  it('lists a path and navigates the panel', async () => {
    const term = makeShell(commands);
    await term.exec('ls experience/acme');
    expect(term.text()).toBe('README.md  highlights/');
    expect(term.calls.navigate).toEqual([{ section: 'experience', slug: 'acme' }]);
  });

  it('prints a single file name', async () => {
    const term = makeShell(commands);
    await term.exec('ls about.md');
    expect(term.text()).toBe('about.md');
  });

  it('prints headers for multiple paths', async () => {
    const term = makeShell(commands);
    await term.exec('ls experience projects');
    expect(term.text()).toBe('experience:\nacme/  globex/\n\nprojects:\ncue/');
  });

  it('reports missing paths with exit 2', async () => {
    const term = makeShell(commands);
    expect((await term.exec('ls nope')).code).toBe(2);
    expect(term.text()).toBe("ls: cannot access 'nope': No such file or directory");
  });
});

describe('cd / pwd', () => {
  it('changes directory and navigates', async () => {
    const term = makeShell(commands);
    await term.exec('cd experience/acme');
    await term.exec('pwd');
    expect(term.text()).toBe('/home/hamed/experience/acme');
    expect(term.calls.navigate).toEqual([{ section: 'experience', slug: 'acme' }]);
  });

  it('cd without args goes home', async () => {
    const term = makeShell(commands);
    await term.exec('cd experience');
    await term.exec('cd');
    expect(term.deps.fs.cwd).toBe('/home/hamed');
  });

  it('reports errors', async () => {
    const term = makeShell(commands);
    expect((await term.exec('cd nope')).code).toBe(1);
    expect((await term.exec('cd about.md')).code).toBe(1);
    expect(term.text()).toBe('cd: nope: No such file or directory\ncd: about.md: Not a directory');
  });

  it('completes directories only', () => {
    const term = makeShell(commands);
    const ctx = term.completion;
    expect(completeLine('cd exp', ctx).line).toBe('cd experience/');
  });
});

describe('tree', () => {
  it('draws the tree with a summary', async () => {
    const term = makeShell(commands);
    await term.exec('tree experience');
    expect(term.text()).toBe(
      [
        'experience',
        '├── acme',
        '│   ├── README.md',
        '│   └── highlights',
        '│       └── shipped.md',
        '└── globex',
        '    └── README.md',
        '',
        '3 directories, 3 files',
      ].join('\n'),
    );
  });

  it('defaults to the cwd and hides dotfiles', async () => {
    const term = makeShell(commands);
    await term.exec('tree');
    expect(term.text()).toMatch(/^\./);
    expect(term.text()).not.toContain('.secrets');
  });

  it('errors on missing paths', async () => {
    const term = makeShell(commands);
    expect((await term.exec('tree nope')).code).toBe(1);
    expect(term.text()).toBe('tree: nope: No such file or directory');
  });

  it('prints a single file without walking', async () => {
    const term = makeShell(commands);
    expect((await term.exec('tree about.md')).code).toBe(0);
    expect(term.text()).toBe('about.md\n\n0 directories, 1 file');
  });

  it('completes directories', () => {
    const term = makeShell(commands);
    expect(completeLine('tree exp', term.completion).line).toBe('tree experience/');
  });
});
