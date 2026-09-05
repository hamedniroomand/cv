/** The top-level entries of `~` that `buildTree` creates. A dotfile path must not start with one of these names. */
export const RESERVED_HOME_NAMES: readonly string[] = [
  '.secrets',
  'about.md',
  'contact.sh',
  'education.md',
  'experience',
  'projects',
  'skills.json',
];
