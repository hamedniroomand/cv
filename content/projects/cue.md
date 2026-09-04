---
name: Cue
repo: hamedniroomand/cue
docs: https://hamedniroomand.github.io/cue
tagline: Drive headless coding agents through a GitHub-issue label pipeline.
stack:
  - TypeScript
  - Bun
  - GitHub API
---

Cue is a TypeScript / Bun CLI that drives headless coding agents (Claude Code, Codex, Antigravity) through a GitHub-issue pipeline. It uses a deterministic state machine with GitHub labels as state, issue comments for implementation plans, and draft PRs for delivery, with human approval gates before code is written and before merge.

The multi-engine adapter layer supports Claude Code, OpenAI Codex, and Google Antigravity, with isolated git worktrees, secret scrubbing in agent subprocesses, real test/lint commands as quality gates, and a local dashboard for transcripts and cost tracking.

This is the committed fallback description. When the site is built with network access, the live README from `github.com/hamedniroomand/cue` replaces it.
