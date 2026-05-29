/**
 * Saut de page Markdown (ligne seule) :
 *   <!-- mdv:page -->
 */
export const PAGE_DELIMITER_LINE = /^\s*<!--\s*mdv:page\s*-->\s*$/;

const COMPACT_PAGE_HEADING =
  /^##\s+(?:Offre\s+\d+|Ce que comprend une prestation(?:\s*\([^)]*\))?|Conseils\b)/m;

const CONSEILS_HEADING = /^##\s+Conseils\b/m;

/** @param {string} text */
export function isCompactPageChunk(text) {
  return COMPACT_PAGE_HEADING.test(text.trim());
}

/** @param {string} text */
export function isConseilsPageChunk(text) {
  return CONSEILS_HEADING.test(text.trim());
}

/**
 * @param {string} markdown
 * @returns {{ content: string, compact: boolean, conseils: boolean }[]}
 */
export function splitMarkdownByPages(markdown) {
  const lines = markdown.split(/\r?\n/);
  const chunks = [];
  let current = [];

  const flush = () => {
    const text = current.join('\n').trim();
    if (text) {
      chunks.push({
        content: text,
        compact: isCompactPageChunk(text),
        conseils: isConseilsPageChunk(text),
      });
    }
    current = [];
  };

  for (const line of lines) {
    if (PAGE_DELIMITER_LINE.test(line)) {
      flush();
    } else {
      current.push(line);
    }
  }
  flush();

  const trimmed = markdown.trim();
  return chunks.length > 0
    ? chunks
    : [{ content: trimmed, compact: isCompactPageChunk(trimmed), conseils: isConseilsPageChunk(trimmed) }];
}
