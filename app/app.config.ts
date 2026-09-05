export default defineAppConfig({
  site: {
    /** Repository shown as "Source" in the resume header. */
    repo: 'https://github.com/hamedniroomand/cv',
  },
  terminal: {
    /** Number of commands that survive a page reload. */
    historySize: 10,
    /** Number of commands kept in memory during one session. */
    sessionHistorySize: 500,
    boot: {
      /** Delay between two boot lines, in milliseconds. */
      stepMs: 220,
      /** Delay after the last boot line, in milliseconds. */
      finishDelayMs: 150,
    },
  },
  panel: {
    /** Time a section stays highlighted after navigation, in milliseconds. */
    highlightMs: 1200,
    /** Ratio change for one arrow key on the divider. */
    splitKeyStep: 0.02,
  },
  feedback: {
    /** Time a Copy or Share confirmation stays visible, in milliseconds. */
    statusMs: 1500,
  },
});
