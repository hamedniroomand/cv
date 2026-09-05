import { isThemeName, THEMES } from '#shared/theme';
import type { Command } from '~/terminal/types';

export default {
  name: 'theme',
  description: 'List or change the colour theme',
  usage: `theme [${THEMES.join('|')}]`,
  complete: () => [...THEMES],
  run(argv, ctx) {
    const [name] = argv;
    if (!name) {
      for (const theme of THEMES)
        ctx.stdout.line(`${theme === ctx.env.theme ? '*' : ' '} ${theme}`);
      return 0;
    }
    if (!isThemeName(name)) {
      ctx.stderr.line(`theme: unknown theme '${name}' (${THEMES.join(', ')})`);
      return 1;
    }
    ctx.theme.set(name);
    ctx.stdout.line(`theme: ${name}`);
    return 0;
  },
} satisfies Command;
