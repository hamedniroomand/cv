---
name: WaveRune
order: 2
repo: hamedniroomand/waverune
site: https://hamedniroomand.github.io/waverune/
tagline: Blind audio watermarking for WAV files in Node.js, Bun, and the browser.
stack:
  - TypeScript
  - Signal processing
  - Bun
  - Node.js
screenshots:
  - src: /screenshots/waverune-demo.webp
    alt: The WaveRune browser demo. A drop zone for a WAV file, a key field, and Embed and Detect actions.
    caption: The browser demo embeds and detects a watermark locally. Nothing is uploaded.
    frame: hamedniroomand.github.io/waverune
    width: 2880
    height: 1620
---

WaveRune embeds a 32-bit identifier in WAV audio and reads it back using a key. Detection is blind: it does not need the original recording. A keyed signal is spread across frequency slots under a simplified masking model, then recovered through spectral correlation. The whole thing is classical signal processing with no model downloads and zero runtime dependencies.

It ships as an ESM package for Node.js and Bun with TypeScript declarations, a command-line tool with scriptable exit codes, standalone executables for macOS, Linux and Windows with the Bun runtime embedded, and a browser demo that processes files locally.

The repository carries a reliability report with the inputs, commands and per-file results. Clean synthetic audio, 16-bit round trips and sample-rate conversions recovered every identifier. Clean recorded audio recovered 24 of 27. Short excerpts are less reliable, and no wrong payload was accepted in 585 rejection trials. The limits are documented before anyone relies on it.

This is the committed fallback description. When the site is built with network access, the live README from `github.com/hamedniroomand/waverune` replaces it.
