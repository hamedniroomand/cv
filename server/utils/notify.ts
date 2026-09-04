import type { ContactMessage } from '#shared/schemas/contact'

export interface NotifyConfig {
  /** Discord webhook URL (`https://discord.com/api/webhooks/<id>/<token>`). */
  discordWebhookUrl: string
}

const MAX_DESCRIPTION = 4000

/**
 * Post a contact message to a Discord channel through a webhook. Without a webhook URL the
 * message is logged to the server console instead, so the route keeps working in development.
 * Mentions are disabled so a visitor cannot ping the channel.
 */
export async function sendContact(msg: ContactMessage, cfg: NotifyConfig, fetchImpl: typeof fetch = fetch): Promise<'sent' | 'logged'> {
  if (!cfg.discordWebhookUrl) {
    console.warn('[contact] no webhook configured, message logged:', { name: msg.name, email: msg.email, message: msg.message })
    return 'logged'
  }
  const description = msg.message.length > MAX_DESCRIPTION ? `${msg.message.slice(0, MAX_DESCRIPTION - 1)}…` : msg.message
  const res = await fetchImpl(`${cfg.discordWebhookUrl}?wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'hamed.sh',
      allowed_mentions: { parse: [] },
      embeds: [
        {
          title: `New message from ${msg.name}`,
          description,
          color: 0xE3B341,
          fields: [{ name: 'Reply to', value: msg.email, inline: true }],
          footer: { text: 'contact form · hamed.sh' },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  })
  if (!res.ok)
    throw new Error(`discord webhook responded ${res.status}`)
  return 'sent'
}
