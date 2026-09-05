import type { ContactMessage } from '#shared/schemas/contact';
import { DEFAULT_SITE_HOST } from '#shared/site-host';

export interface NotifyConfig {
  discordWebhookUrl: string;
}

export type Delivery = 'sent' | 'logged';

const MAX_DESCRIPTION = 4000;
const EMBED_COLOUR = 0xe3b341;

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function discordPayload(msg: ContactMessage): Record<string, unknown> {
  return {
    username: DEFAULT_SITE_HOST,
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: `New message from ${msg.name}`,
        description: truncate(msg.message, MAX_DESCRIPTION),
        color: EMBED_COLOUR,
        fields: [{ name: 'Reply to', value: msg.email, inline: true }],
        footer: { text: `contact form · ${DEFAULT_SITE_HOST}` },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export async function sendContact(
  msg: ContactMessage,
  cfg: NotifyConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<Delivery> {
  if (!cfg.discordWebhookUrl) {
    console.warn('[contact] no webhook configured, message logged:', {
      name: msg.name,
      email: msg.email,
      message: msg.message,
    });
    return 'logged';
  }
  const res = await fetchImpl(`${cfg.discordWebhookUrl}?wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(discordPayload(msg)),
  });
  if (!res.ok) throw new Error(`discord webhook responded ${res.status}`);
  return 'sent';
}
