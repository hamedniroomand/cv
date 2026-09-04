# hamed.sh — a resume you can `cat`

Personal site of Hamed Niroomand. It is a real-feeling terminal for engineers and a readable resume
panel for everyone else, both rendered from one content source. Whatever runs in the terminal, the
panel scrolls to the matching section. The same data is served as JSON under `/api`, and a PDF
version of the resume is available for download.

Live: `<FILL: domain>` · Source: this repository · Screenshot: `<FILL>`

## Architecture

```
content/  ──Zod──▶  modules/cv-content.ts  ──▶  virtual `#cv`  ──┬─▶ app/terminal  (virtual filesystem)
                     (local Nuxt module)         typed CvData     ├─▶ app/components/panel  (SSR resume)
                                                                  └─▶ server/api/*  (JSON, CORS)
public/hamed-niroomand-cv.pdf  ──▶  served as-is at /hamed-niroomand-cv.pdf (Download PDF, `cv --pdf`)
```

- **`content/`** is the single source of truth: Markdown with frontmatter for narrative, JSON for
  structured data. Nothing is copied twice.
- **`modules/cv-content.ts`** reads `content/`, validates every file with the Zod schemas in
  `shared/schemas/`, fetches project READMEs from GitHub (falling back to the committed copy when
  offline), renders Markdown to HTML, and exposes the result as the virtual module `#cv`. In dev it
  hot-reloads when content changes. Invalid content fails the build with the offending file path.
- **`shared/cv/build-tree.ts`** turns the data into the virtual filesystem the terminal mounts at `~`.
  Every node is stamped with the panel section it represents, which is how `cd experience/thales`
  scrolls the panel to Thales.
- **`app/terminal/`** is the shell: tokenizer → parser (pipes, `sudo` prefix) → executor → commands.
  It is plain TypeScript with no Vue imports, so all of it runs under Vitest in Node.
- **`app/components/terminal/`** renders the shell. It is client-only and lazy-loaded; the panel and
  every page are prerendered to static HTML at build time, so recruiters and crawlers see the full
  resume without JavaScript and the CDN serves it without invoking the server.
- **`server/api/`** serves the same data as JSON with CORS enabled for GET.
- **`public/hamed-niroomand-cv.pdf`** is the downloadable resume. It is a committed static file,
  replaced by hand when the resume changes; nothing generates it at build time.

## Run locally

Requirements: [Bun](https://bun.sh) 1.4+.

```bash
bun install
bun run dev            # http://localhost:3000
bun run test           # Vitest: shell core, filesystem, commands, schemas, API utils
bun run build          # Nitro build (Bun preset)
bun run preview
bunx playwright install chromium   # once, for e2e and `bun run icons`
bun run test:e2e
```

Copy `.env.example` to `.env` and set `NUXT_PUBLIC_SITE_URL`. Without `NUXT_DISCORD_WEBHOOK_URL` the
contact form logs messages to the server console instead of posting them to Discord.

## Interactive app

Type `hamed` in the terminal (aliases: `app`, `tui`) to replace the shell with a guided full-pane
interface. Type `/` to filter slash commands; plain text still runs as a shell command.

Slash commands: `/about`, `/api`, `/clear`, `/contact`, `/education`, `/exit`, `/experience`,
`/help`, `/pdf` (alias `/export`), `/projects`, `/skills`, `/theme`. `/exit` is also `/quit` and
`/q`. Leave with `/exit`, Esc on an empty prompt with the menu closed, or Ctrl+D.

The app is English-only; there is no `/lang` command.

## Add a command

Create `app/terminal/commands/<name>.ts` exporting a `Command`. That is the whole change; the
registry globs the directory. The shell core never needs to know about individual commands.

```ts
import type { Command } from '../types'

export default {
  name: 'uptime',
  description: 'How long this has been running',
  usage: 'uptime',
  run(_argv, ctx) {
    ctx.stdout.line(`up ${ctx.cv.experience.length} companies, 0 outages caused by the frontend`)
    ctx.panel.navigate({ section: 'experience' })
    return 0
  },
} satisfies Command
```

`ctx` gives you the virtual filesystem, `stdin` (when piped into), `stdout`/`stderr` writers, the
resume data, panel navigation, theme and language setters, history, the registry, UI hooks
(clear, modals, open URL, download) and an `AbortSignal` for Ctrl+C. Optional `complete(argv, ctx)`
powers Tab. Set `hidden: true` for easter eggs. Add a test in `tests/unit/terminal/commands/` using
the `makeShell` fixture, which records every side effect.

## Content

| File                                                     | Becomes                                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `content/profile.json`                                   | Header, `whoami`, `man hamed`, JSON-LD                                               |
| `content/about.md`                                       | `~/about.md`, About section                                                          |
| `content/experience/<slug>/index.md` + `highlights/*.md` | `~/experience/<slug>/`, Experience entries                                           |
| `content/projects/*.md`                                  | `~/projects/<slug>/README.md` (live from GitHub when reachable), Open source section |
| `content/skills.json`                                    | `~/skills.json`, `skills`, Skills section                                            |
| `content/education.md`                                   | `~/education.md`, Education section                                                  |
| `content/secrets.md`                                     | `~/.secrets` (needs `sudo`)                                                          |

Copy rules: no invented metrics, no design-pattern name-dropping. Unknown facts are literally `<FILL>`.

## API

| Route               | Returns                                        |
| ------------------- | ---------------------------------------------- |
| `GET /api/cv`       | Everything except `.secrets`                   |
| `POST /api/contact` | `{ name, email, message }`, 10 per hour per IP |

```bash
curl -s https://niroomand.dev/api/cv | jq .profile
```

## Deploy

The site is a single Nitro server built with the `bun` preset.

```bash
docker build -t cv --build-arg NUXT_PUBLIC_SITE_URL=https://example.com .
docker run -p 3000:3000 -e NUXT_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... cv
```

Both stages are plain Bun images; the PDF is a static file in `public/`, so the build needs no
browser. Later phases add separate Bun containers for the WebSocket (`who`) and SSH services.

## Still to fill in

- `content/education.md`: exact start and end months (currently Sep 2018 – Jun 2022; CV lists years only)
- Domain (`NUXT_PUBLIC_SITE_URL`) and deploy target
- Open Graph image (`public/og.png`) / README screenshot
- Discord webhook URL for contact-form notifications

## Roadmap

1. Core (this): content pipeline, shell, panel, PDF, API, deploy config ✔
2. Polish: pipes with `jq`/`wc`, themes, `lang fa`, mobile, easter eggs, `neofetch`, a11y pass, Lighthouse CI
3. Wow: `cue demo`, `curl` from inside the terminal, `who` over WebSocket, OpenAPI
4. Legend: `ssh` TUI server

## License

MIT
