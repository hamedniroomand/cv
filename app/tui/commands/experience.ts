import { formatRange } from '#shared/cv/format';
import type { Experience } from '#shared/schemas/experience';
import { unknownValueMessage } from '~/terminal/messages';
import { chooseValue } from '~/tui/choose';
import { openInPanel } from '~/tui/panel';
import type { AppCommand, AppContext, PickerItem } from '~/tui/types';
import { EXIT_CANCELLED } from '~/tui/types';

function choices(ctx: AppContext): PickerItem[] {
  return [...ctx.cv.experience]
    .sort((a, b) => a.order - b.order)
    .map(experience => ({
      value: experience.slug,
      label: experience.company,
      description: experience.roles
        .map(role => `${role.title} · ${formatRange(role.start, role.end)}`)
        .join('; '),
      keywords: [experience.slug, ...experience.stack],
    }));
}

function resolveExperience(input: string, experiences: Experience[]): Experience | undefined {
  const query = input.toLocaleLowerCase();
  const exact = experiences.find(experience => experience.slug.toLocaleLowerCase() === query);
  if (exact) return exact;
  const byCompany = experiences.filter(experience =>
    experience.company.toLocaleLowerCase().startsWith(query),
  );
  return byCompany.length === 1 ? byCompany[0] : undefined;
}

export default {
  name: 'experience',
  description: 'Browse roles and highlights',
  args: '[company]',
  complete: (_argv, ctx) => choices(ctx),
  async run(argv, ctx) {
    const requested = await chooseValue(argv, ctx, 'Choose a company', choices(ctx), {
      placeholder: 'Filter companies',
    });
    if (requested === null) return EXIT_CANCELLED;

    const experience = resolveExperience(requested, ctx.cv.experience);
    if (!experience) {
      const slugs = ctx.cv.experience.map(item => item.slug);
      ctx.view.print(unknownValueMessage('experience', 'company', requested, slugs), 'error');
      return 1;
    }

    openInPanel(
      ctx,
      experience.company,
      { section: 'experience', slug: experience.slug },
      `bat ~/experience/${experience.slug}/README.md`,
    );
    return 0;
  },
} satisfies AppCommand;
