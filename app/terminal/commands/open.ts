import { githubUrl, mailtoUrl, projectUrl } from '#shared/cv/links';
import { PDF_FILE, PDF_PATH } from '#shared/pdf';
import type { CvData } from '#shared/schemas/cv';
import type { Command, CommandContext } from '~/terminal/types';

import { writeLink } from './_util';

type Links = CvData['profile']['links'];

const LINK_TARGETS: Record<string, (links: Links) => string> = {
  github: links => githubUrl(links.github),
  linkedin: links => links.linkedin,
  email: links => mailtoUrl(links.email),
};
const PROJECT_TARGETS = ['cpm', 'cue', 'waverune', 'kitdev'];
const TARGETS = [...Object.keys(LINK_TARGETS), ...PROJECT_TARGETS, 'pdf'];

function urlFor(target: string, ctx: CommandContext): string | null {
  const link = LINK_TARGETS[target];
  if (link) return link(ctx.cv.profile.links);
  if (PROJECT_TARGETS.includes(target)) {
    const project = ctx.cv.projects.find(item => item.slug === target) ?? ctx.cv.projects[0];
    return project ? projectUrl(project) : null;
  }
  return /^https?:\/\//.test(target) ? target : null;
}

export default {
  name: 'open',
  description: 'Open a link in a new tab',
  usage: `open <${TARGETS.join('|')}|url>`,
  complete: () => [...TARGETS],
  run(argv, ctx) {
    const target = argv[0];
    if (target === 'pdf') {
      ctx.ui.download(PDF_PATH, PDF_FILE);
      return 0;
    }
    const url = target ? urlFor(target, ctx) : null;
    if (!url) {
      ctx.stderr.line(
        `open: unknown target${target ? ` '${target}'` : ''}. Try one of: ${TARGETS.join(', ')}, or a URL.`,
      );
      return 1;
    }
    writeLink(ctx.stdout, 'Opening ', url, url);
    ctx.ui.openUrl(url);
    return 0;
  },
} satisfies Command;
