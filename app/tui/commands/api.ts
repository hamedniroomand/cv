import { unknownValueMessage } from '~/terminal/messages';
import type { AppCommand, PickerItem } from '~/tui/types';

const ENDPOINTS = [{ name: 'cv', path: '/api/cv' }] as const;

const choices: PickerItem[] = ENDPOINTS.map(endpoint => ({
  value: endpoint.name,
  label: endpoint.name,
  description: endpoint.path,
}));

function pipeline(path: string): string {
  return `curl -s ${path} | jq .`;
}

export default {
  name: 'api',
  description: 'Explore JSON API endpoints',
  args: '[endpoint]',
  complete: () => choices,
  run(argv, ctx) {
    const requested = argv[0]?.toLocaleLowerCase();
    if (!requested) {
      ctx.view.print(`API endpoints at ${ctx.env.siteUrl}:`);
      for (const endpoint of ENDPOINTS)
        ctx.view.print(`/api ${endpoint.name}  ${pipeline(endpoint.path)}`);
      return 0;
    }

    const endpoint = ENDPOINTS.find(item => item.name === requested);
    if (!endpoint || argv.length > 1) {
      ctx.view.print(
        unknownValueMessage(
          'api',
          'endpoint',
          argv.join(' '),
          ENDPOINTS.map(item => item.name),
        ),
        'error',
      );
      return 1;
    }
    ctx.view.print(pipeline(endpoint.path));
    return 0;
  },
} satisfies AppCommand;
