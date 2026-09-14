import { unknownValueMessage } from '~/terminal/messages';
import { chooseValue, findBySlug } from '~/tui/choose';
import { openInPanel } from '~/tui/panel';
import type { AppCommand, AppContext, PickerItem } from '~/tui/types';
import { EXIT_CANCELLED } from '~/tui/types';

function choices(ctx: AppContext): PickerItem[] {
  return ctx.cv.projects.map(project => ({
    value: project.slug,
    label: project.name,
    description: project.tagline,
    keywords: [project.slug, ...project.stack],
  }));
}

export default {
  name: 'projects',
  description: 'Browse projects and links',
  args: '[name]',
  complete: (_argv, ctx) => choices(ctx),
  async run(argv, ctx) {
    const { projects } = ctx.cv;
    const requested = await chooseValue(argv, ctx, 'Choose a project', choices(ctx), {
      placeholder: 'Filter projects',
    });
    if (requested === null) return EXIT_CANCELLED;

    const project = findBySlug(requested, projects);
    if (!project) {
      const slugs = projects.map(item => item.slug);
      ctx.view.print(unknownValueMessage('projects', 'project', requested, slugs), 'error');
      return 1;
    }

    openInPanel(
      ctx,
      project.name,
      { section: 'projects', slug: project.slug },
      `bat ~/projects/${project.slug}/README.md`,
    );
    return 0;
  },
} satisfies AppCommand;
