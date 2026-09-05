import type { PanelTarget } from '#shared/cv/panel-target';

import type { AppContext } from './types';

/** Shows a section in the panel and tells the visitor how to read the raw text in the shell. */
export function openInPanel(
  ctx: AppContext,
  label: string,
  target: PanelTarget,
  rawCommand: string,
): void {
  ctx.view.print(`Opened ${label} in the panel.`);
  ctx.view.print(`Raw text: ${rawCommand}`, 'dim');
  ctx.panel.reveal();
  ctx.panel.navigate(target);
}
