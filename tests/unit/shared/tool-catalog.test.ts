import { expect, it } from 'vite-plus/test';

import { parseToolCatalog } from '#shared/cv/tool-catalog';

const SAMPLE = `# KitDev Space

> Developer tools for people who build things.

## Data Lab

Tools for data operations.

- [JSON Formatter](/hub/data/json-formatter): Format, minify, and validate JSON.
- [SQLite Studio](/hub/data/sqlite-studio): Inspect, query, and edit SQLite databases in memory.

## Color Lab

- [Contrast Checker](/hub/color/contrast-checker): Check the contrast ratio of two colors.

## Notes

- KitDev Space provides tools for developers.
`;

it('reads every lab and the tools inside it', () => {
  const catalog = parseToolCatalog(SAMPLE);
  expect(catalog.labs.map(lab => lab.name)).toEqual(['Data Lab', 'Color Lab']);
  expect(catalog.labs[0]!.tools.map(tool => tool.name)).toEqual([
    'JSON Formatter',
    'SQLite Studio',
  ]);
});

it('counts the tools across the labs', () => {
  expect(parseToolCatalog(SAMPLE).total).toBe(3);
});

it('leaves out a section that holds no tools', () => {
  expect(parseToolCatalog(SAMPLE).labs.map(lab => lab.name)).not.toContain('Notes');
});

it('keeps the address of each tool', () => {
  const [tool] = parseToolCatalog(SAMPLE).labs[0]!.tools;
  expect(tool).toEqual({
    name: 'JSON Formatter',
    path: '/hub/data/json-formatter',
    description: 'Format, minify, and validate JSON.',
  });
});

it('returns nothing when the file holds no tools', () => {
  expect(parseToolCatalog('# Empty\n\n## Notes\n\n- Nothing here.\n')).toEqual({
    labs: [],
    total: 0,
  });
});
