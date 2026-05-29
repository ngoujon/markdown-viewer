/**
 * Saut de page Markdown (ligne seule) :
 *   <!-- mdv:page -->
 *
 * Découpe le document en sections (une section = une page à l’écran et au PDF).
 * Les sections « ## Offre N », « ## Ce que comprend une prestation… »
 * et « ### Conseils » activent automatiquement la mise en page compacte.
 */
export const PAGE_DELIMITER_LINE = /^\s*<!--\s*mdv:page\s*-->\s*$/;

const COMPACT_PAGE_HEADING =
  /^##\s+(?:Offre\s+\d+|Ce que comprend une prestation(?:\s*\([^)]*\))?)|^###\s+Conseils\b/m;

/** @param {string} text */
export function isCompactPageChunk(text) {
  return COMPACT_PAGE_HEADING.test(text.trim());
}

/** @deprecated Utiliser isCompactPageChunk */
export function isOfferPageChunk(text) {
  return isCompactPageChunk(text);
}

/**
 * @param {string} markdown
 * @returns {{ content: string, compact: boolean }[]}
 */
export function splitMarkdownByPages(markdown) {
  const lines = markdown.split(/\r?\n/);
  /** @type {{ content: string, compact: boolean }[]} */
  const chunks = [];
  let current = [];

  const flush = () => {
    const text = current.join('\n').trim();
    if (text) {
      chunks.push({
        content: text,
        compact: isCompactPageChunk(text),
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
  return chunks.length > 0 ? chunks : [{ content: trimmed, compact: isCompactPageChunk(trimmed) }];
}
