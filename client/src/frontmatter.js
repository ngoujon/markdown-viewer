/** Retire le bloc frontmatter YAML pour l’affichage à l’écran. */
export function stripFrontmatter(raw) {
  const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? raw.slice(match[0].length) : raw;
}
