import { githubUrl, mailtoUrl, stripScheme } from '#shared/cv/links';
import type { Command } from '~/terminal/types';

import { writeLink } from './_util';

export default {
  name: 'contact',
  description: 'Get in touch',
  usage: 'contact',
  async run(_argv, ctx) {
    const { links } = ctx.cv.profile;
    writeLink(ctx.stdout, 'Email:    ', links.email, mailtoUrl(links.email));
    writeLink(ctx.stdout, 'GitHub:   ', `github.com/${links.github}`, githubUrl(links.github));
    writeLink(ctx.stdout, 'LinkedIn: ', stripScheme(links.linkedin), links.linkedin);
    ctx.panel.navigate({ section: 'contact' });
    await ctx.ui.openModal('contact');
    return 0;
  },
} satisfies Command;
