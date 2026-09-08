# niroomand.dev

A personal workshop for projects, developer tools, and dotfiles. The public homepage leads with
Cue and KitDev Space. Each project has a dedicated overview, real links, and a visual explanation.

Live site: <https://niroomand.dev>

## Explore

- `/` — selected projects, a short work history, a look at my setup, and contact links.
- `/projects/cue` and `/projects/kitdev` — project overviews and links.
- `/dotfiles` — configuration files with highlighted code, Copy, Share, and gist links.
- `/cv` — the full résumé and original split terminal experience. This route is unlisted and
  marked `noindex`, not password-protected. The PDF and `/api/cv` remain available by direct URL.

The work history is public, but it gives only the company, the place, the dates and one line each.
Role titles, skills, education and the PDF stay on `/cv`, which I send to a company by direct link.

The public terminal loads only when opened. Try `ls projects`, `ls experience`, `dotfiles`, or
`menu`. It has a public filesystem and command selection; career commands belong to the résumé
terminal. Use Ctrl+backtick to toggle it, or Escape to close it. The window minimizes and maximizes
from its own controls, and the shell session survives both. History stays available when you reopen
it. Five color themes are available from the header and from `theme` in the terminal.

On the public site the terminal opens the page of a project or a dotfile, and otherwise leaves the
page and the scroll position alone.

## Content and presentation

Project links, names, and stacks come from `content/projects`. Curated public project descriptions
live in `shared/public-site.ts`; résumé content stays in `content`. Shared public layout and
responsive styling live in `app/components/site` and `app/assets/css/public.css`.

## Technical notes

These are the decisions in this repository that I think are worth your attention.

**One content source.** All resume data lives in Markdown and JSON files. A local Nuxt module reads
the files at build time and validates them with Zod schemas. Invalid content stops the build and
reports the file path. The terminal, the panel, the JSON API and the SEO tags all read the same typed
data.

**Dotfiles from gists.** Each config file is one entry in `content/dotfiles/*.md` with a mount path
and an optional gist id. The build fetches the gist. When the fetch fails, the build uses the
committed body, so a build never depends on GitHub. [rangi](https://github.com/pi0/rangi) highlights
each file at build time into HTML with classes. One stylesheet maps those classes onto the theme
tokens, so the five themes recolor the code without a client-side highlighter.

**A framework-free shell.** The terminal core is plain TypeScript: a tokenizer, a parser for pipes and
`sudo`, an executor and a command registry. It does not import Vue. Because of this, all of it runs
under Vitest in Node without a browser. Each command is one file. The registry finds new commands
automatically.

**Fast first paint.** Every page is prerendered to static HTML at build time: the home page, both
project pages, the dotfile pages and the résumé. A visitor without JavaScript, and a search engine,
sees the whole page. The public terminal is client-only and loads on request. A small inline script restores the saved theme, the split position and the panel state
before the first frame, so hydration never moves the layout.

**A contact form that resists bots.** The form has three layers: a honeypot field, a rate limit of ten
messages per hour per IP, and a Cloudflare Turnstile check. The server verifies the Turnstile token
and fails closed: a network error counts as "not verified". The form validates with the same Zod
schema as the API and shows one error message under each invalid field.

**Accessible by default.** The terminal output is a live region. The divider between the terminal and
the panel is a keyboard-operable separator. Every modal and menu has a role, a name and focus
management. Browser tests check the keyboard paths.

**Quality gates in CI.** Every push runs `vp check` (Oxfmt, Oxlint and type-aware lint), type check, unit
tests with coverage, a production build and the browser tests. Coverage thresholds are 90 percent for lines, branches, functions and
statements. There are more than 300 unit tests and about 50 Playwright tests. Commits follow the
Conventional Commits format and a commitlint hook rejects other formats. A pre-commit hook runs
`vp check --fix` on staged files.

## Stack

| Layer      | Choice                                    |
| ---------- | ----------------------------------------- |
| Framework  | Nuxt 5 (nightly) on Vue 3, Nitro 3 server |
| Runtime    | Bun                                       |
| Language   | TypeScript, strict mode                   |
| Validation | Zod                                       |
| Tests      | Vitest (unit), Playwright (browser)       |
| Tooling    | Vite+ (`vp`): Oxlint, Oxfmt, hooks        |
| CI         | GitHub Actions                            |

I chose the Nuxt 5 nightly on purpose. It let me work with the new Nitro 3 and h3 v2 APIs early and
find the differences from the stable release.

## Run the site locally

You need [Bun](https://bun.sh) 1.4 or later.

1. Install the dependencies:

   ```bash
   vp install
   ```

2. Start the development server:

   ```bash
   vp run dev
   ```

3. Open <http://localhost:3000>.

To run the tests:

```bash
bun run test        # unit tests
bun run build       # production build, required once before the browser tests
bunx playwright install chromium
vp run test:e2e     # builds the e2e app, then runs browser tests
```

The contact form works without configuration. It logs messages to the server console. Copy
`.env.example` to `.env` to connect it to Discord and to turn on the Turnstile check.

## License

MIT
