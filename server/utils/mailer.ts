import type { ContactMessage } from '#shared/schemas/contact'

export interface MailerConfig {
  resendApiKey: string
  to: string
  from: string
}

/**
 * Deliver a contact message through Resend. Without an API key and recipient the message is
 * logged to the server console instead, so the route keeps working in development.
 */
export async function sendContact(msg: ContactMessage, cfg: MailerConfig, fetchImpl: typeof fetch = fetch): Promise<'sent' | 'logged'> {
  if (!cfg.resendApiKey || !cfg.to) {
    console.warn('[contact] no mail provider configured, message logged:', { name: msg.name, email: msg.email, message: msg.message })
    return 'logged'
  }
  const res = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${cfg.resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: cfg.from,
      to: [cfg.to],
      reply_to: msg.email,
      subject: `[cv] ${msg.name}`,
      text: `From: ${msg.name} <${msg.email}>\n\n${msg.message}`,
    }),
  })
  if (!res.ok)
    throw new Error(`mail provider responded ${res.status}`)
  return 'sent'
}
