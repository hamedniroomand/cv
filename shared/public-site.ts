export interface ProjectStory {
  category: string;
  headline: string;
  introduction: string;
  sections: { title: string; body: string }[];
}

const STORIES: Record<string, ProjectStory> = {
  cpm: {
    category: 'Client work / Asset management',
    headline: 'One book for every customer.',
    introduction:
      'A private platform for Thales asset managers. Connect a customer’s exchanges, brokers, and wallets, then watch positions, orders, and risk in one place.',
    sections: [
      {
        title: 'Every venue in one account',
        body: 'Operators attach exchange API keys, MT5 broker accounts, and wallet addresses. Scanners sync spot, futures, and options from Binance, Bybit, Deribit, Coinbase, Kraken, and more, and read wallets on Bitcoin, EVM chains, Solana, Polkadot, Sui, TON, Tron, and XRP.',
      },
      {
        title: 'Live positions, orders, and risk',
        body: 'Scheduled syncs keep the book current and Socket.IO pushes each change to the dashboard. Risk sits beside the balances: a portfolio reference value, a max-drawdown limit, and the non-cash exposure, so an advisor can see what a move would do.',
      },
      {
        title: 'A private product, end to end',
        body: 'Nuxt in the browser, NestJS on Bun behind it, PostgreSQL and TimescaleDB for the book, and a Telegram bot for login and alerts. The source stays private. The company site is the public face.',
      },
    ],
  },
  cue: {
    category: 'Open source / CLI',
    headline: 'From an issue to a reviewed pull request.',
    introduction:
      'A home for coding agents inside a workflow you already know. Cue uses GitHub issues and labels to move work through planning, implementation, and review.',
    sections: [
      {
        title: 'GitHub is the interface',
        body: 'Labels hold the state. Issue comments hold the plan. Draft pull requests hold the result. The workflow stays close to the repository, so there is less context to move between tools.',
      },
      {
        title: 'An agent is one part of the process',
        body: 'Cue supports Claude Code, Codex, and Antigravity through engine adapters. Work happens in isolated git worktrees, with test and lint commands as quality gates and human approval before implementation and merge.',
      },
      {
        title: 'Keep the work inspectable',
        body: 'A local dashboard brings transcripts and cost tracking together. The aim is to make the path from issue to pull request something you can follow, review, and improve.',
      },
    ],
  },
  waverune: {
    category: 'Open source / Audio library',
    headline: 'Hidden data in sound.',
    introduction:
      'WaveRune embeds a 32-bit identifier in WAV audio and reads it back with a key. Detection is blind, so it never needs the original recording. Use it as a library, from the command line, or in the browser.',
    sections: [
      {
        title: 'Classical signal processing, no models',
        body: 'A keyed signal is spread across frequency slots under a simplified masking model and recovered through spectral correlation. There are no model downloads and no runtime dependencies, and the implementation is small enough to read in one sitting.',
      },
      {
        title: 'One library, four ways to run it',
        body: 'Import the ESM package in Node.js or Bun, script the CLI with its exit codes, install a standalone executable that embeds the Bun runtime, or open the browser demo. The demo processes files locally and uploads nothing.',
      },
      {
        title: 'Measured, with the limits written down',
        body: 'A reliability report records how often the detector recovered the identifier from clean, resampled and trimmed audio, and that no wrong payload was accepted in 585 rejection trials. Short clips and heavy edits are less reliable, and the documentation says so first.',
      },
    ],
  },
  kitdev: {
    category: 'Web app / Developer tools',
    headline: 'The little tools you keep needing.',
    introduction:
      'A collection of focused utilities for the everyday work between bigger tasks. Format some JSON, inspect a color, convert an image, and get back to what you were building.',
    sections: [
      {
        title: 'Organized around the task',
        body: 'Tools live in six labs: data, crypto, color, network, image, and dev. Each lab brings related utilities together, from JSON-to-TypeScript conversion to contrast checks and image resizing.',
      },
      {
        title: 'Useful inputs, useful outputs',
        body: 'Inspect DNS records and HTTP headers, compare text, convert between data formats, or strip image metadata. Tools run in the browser or on the server without persisting the submitted data.',
      },
      {
        title: 'Room to keep growing',
        body: 'KitDev Space is built with Nuxt, TypeScript, and Bun, and the source is open. Use the tools on the live site, or read how they work in the repository. New labs and utilities are added over time.',
      },
    ],
  },
};

/** A project without a story falls back to its tagline. */
export function projectStory(project: { slug: string; tagline: string }): ProjectStory {
  return (
    STORIES[project.slug] ?? {
      category: 'Project',
      headline: project.tagline,
      introduction: project.tagline,
      sections: [],
    }
  );
}
