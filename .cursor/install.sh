#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for the niroomand.dev (cv) project.
# Installs the pinned Bun runtime and the Vite+ (vp) CLI, refreshes project
# dependencies, and prepares the Playwright Chromium browser used by the e2e
# suite. Safe to run repeatedly and against cached state.
set -euo pipefail

BUN_VERSION="1.4.2"

# Bun (pinned to package.json "packageManager"). The installer writes to
# ~/.bun and appends the bin dir to the shell profile.
if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash -s "bun-v${BUN_VERSION}"
fi
export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

# Vite+ (vp) global CLI. Manages the Node.js runtime (Node 24 via .node-version)
# and drives lint/format/type-check/test/build.
if ! command -v vp >/dev/null 2>&1; then
  curl -fsSL https://vite.plus | bash
fi
export PATH="$HOME/.local/share/vite-plus/bin:$PATH"

# Project dependencies. The `postinstall` script runs `nuxt prepare`, which
# generates .nuxt types and fetches project READMEs / dotfile gists (falling
# back to committed content when offline).
vp install --frozen-lockfile

# Playwright Chromium + system libraries for the browser (e2e) test suite.
bunx playwright install --with-deps chromium
