---
name: Cue
repo: hamedniroomand/cue
docs: https://hamedniroomand.github.io/cue
tagline: Drive headless coding agents through a GitHub-issue label pipeline.
stack:
  - TypeScript
  - Bun
  - GitHub API
screenshots:
  - src: /screenshots/cue-issue.webp
    alt: GitHub issue 29 in the cue repository, closed, labelled agent:done, linked to pull request 32.
    caption: The interface is the issue. Cue moved this one from agent:ready to agent:done and opened the pull request.
    frame: github.com/hamedniroomand/cue
    width: 3024
    height: 1644
  - src: /screenshots/cue-dashboard.webp
    alt: The Cue dashboard. Total spend, token count, agent time and a cost breakdown for each pipeline stage.
    caption: The local dashboard keeps the work inspectable — spend, tokens and wall-clock across every recorded run.
    frame: cue dashboard
    width: 3024
    height: 1606
---

Cue is a TypeScript / Bun CLI that drives headless coding agents (Claude Code, Codex, Antigravity) through a GitHub-issue pipeline. It uses a deterministic state machine with GitHub labels as state, issue comments for implementation plans, and draft PRs for delivery, with human approval gates before code is written and before merge.

The multi-engine adapter layer supports Claude Code, OpenAI Codex, and Google Antigravity, with isolated git worktrees, secret scrubbing in agent subprocesses, real test/lint commands as quality gates, and a local dashboard for transcripts and cost tracking.

This is the committed fallback description. When the site is built with network access, the live README from `github.com/hamedniroomand/cue` replaces it.
