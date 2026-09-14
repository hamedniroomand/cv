import { githubUrl, mailtoUrl, projectUrl } from '#shared/cv/links';
import type { CvData } from '#shared/schemas/cv';

import type { Command } from './types';

const PRIVATE_COMMANDS = new Set(['cv', 'whoami', 'skills', 'neofetch', 'open']);

const whoami: Command = {
  name: 'whoami',
  description: 'Get to know Hamed Niroomand',
  usage: 'whoami',
  run(_argv, ctx) {
    ctx.stdout.line(ctx.cv.profile.name, 'accent');
    ctx.stdout.line('I make tools for the way I like to work.');
    ctx.stdout.line('Read my projects, my work history and my dotfiles here.');
    ctx.stdout.line("Try 'ls projects', 'ls experience', or 'menu' for guided mode.", 'dim');
    return 0;
  },
};

function openUrl(target: string, cv: CvData): string | null {
  if (target === 'github') return githubUrl(cv.profile.links.github);
  if (target === 'email') return mailtoUrl(cv.profile.links.email);
  const project = cv.projects.find(entry => entry.slug === target);
  if (project) return projectUrl(project);
  return /^https?:\/\//.test(target) ? target : null;
}

const open: Command = {
  name: 'open',
  description: 'Open a project or contact link',
  usage: 'open <github|email|project|url>',
  complete: (_argv, ctx) => ['github', 'email', ...ctx.cv.projects.map(project => project.slug)],
  run(argv, ctx) {
    const url = openUrl(argv[0] ?? '', ctx.cv);
    if (!url) {
      const slugs = ctx.cv.projects.map(entry => entry.slug).join(', ');
      ctx.stderr.line(`open: choose github, email, or a project: ${slugs}`);
      return 1;
    }
    ctx.stdout.link(url, url);
    ctx.stdout.line();
    ctx.ui.openUrl(url);
    return 0;
  },
};

export function publicCommands(commands: Command[]): Command[] {
  return [...commands.filter(command => !PRIVATE_COMMANDS.has(command.name)), whoami, open];
}
