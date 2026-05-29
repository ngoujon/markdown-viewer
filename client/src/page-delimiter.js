/**
 * Saut de page Markdown (ligne seule) :
 *   <!-- mdv:page -->
 */
export const PAGE_DELIMITER_LINE = /^\s*<!--\s*mdv:page\s*-->\s*$/;

const OFFRE_HEADING = /^##\s+Offre\s+\d+/m;

const SOCLE_HEADING = /^##\s+Ce que comprend une prestation(?:\s*\([^)]*\))?/m;

const CONSEILS_HEADING = /^##\s+Conseils\b/m;

/** @param {string} text */
export function isCompactPageChunk(text) {
  return OFFRE_HEADING.test(text.trim());
}

/** @param {string} text */
export function isSoclePageChunk(text) {
  return SOCLE_HEADING.test(text.trim());
}

/** @param {string} text */
export function isConseilsPageChunk(text) {
  return CONSEILS_HEADING.test(text.trim());
}

/**
 * @param {string} markdown
 * @returns {{ content: string, compact: boolean, socle: boolean, conseils: boolean }[]}
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
        compact: isCompactPageChunk(text) || isConseilsPageChunk(text),
        socle: isSoclePageChunk(text),
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
    : [
        {
          content: trimmed,
          compact: isCompactPageChunk(trimmed) || isConseilsPageChunk(trimmed),
          socle: isSoclePageChunk(trimmed),
          conseils: isConseilsPageChunk(trimmed),
        },
      ];
}
