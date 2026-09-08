import { githubUrl, mailtoUrl, projectUrl } from '#shared/cv/links';

import type { Command } from './types';

const whoami: Command = {
  name: 'whoami',
  description: 'Meet the person behind the workshop',
  usage: 'whoami',
  run(_argv, ctx) {
    ctx.stdout.line(ctx.cv.profile.name, 'accent');
    ctx.stdout.line('I make tools for the way I like to work.');
    ctx.stdout.line('Read my projects, my work history and my dotfiles here.');
    ctx.stdout.line("Try 'ls projects', 'ls experience', or 'menu' for guided mode.", 'dim');
    return 0;
  },
};

const open: Command = {
  name: 'open',
  description: 'Open a project or contact link',
  usage: 'open <github|email|project|url>',
  complete: (_argv, ctx) => ['github', 'email', ...ctx.cv.projects.map(project => project.slug)],
  run(argv, ctx) {
    const target = argv[0] ?? '';
    const project = ctx.cv.projects.find(entry => entry.slug === target);
    const url =
      target === 'github'
        ? githubUrl(ctx.cv.profile.links.github)
        : target === 'email'
          ? mailtoUrl(ctx.cv.profile.links.email)
          : project
            ? projectUrl(project)
            : /^https?:\/\//.test(target)
              ? target
              : null;
    if (!url) {
      ctx.stderr.line(
        `open: choose github, email, or a project: ${ctx.cv.projects.map(entry => entry.slug).join(', ')}`,
      );
      return 1;
    }
    ctx.stdout.link(url, url);
    ctx.stdout.line();
    ctx.ui.openUrl(url);
    return 0;
  },
};

export function publicCommands(commands: Command[]): Command[] {
  return [
    ...commands.filter(
      command => !['cv', 'whoami', 'skills', 'neofetch', 'open'].includes(command.name),
    ),
    whoami,
    open,
  ];
}
