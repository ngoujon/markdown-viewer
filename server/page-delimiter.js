/**
 * Saut de page Markdown (ligne seule) :
 *   <!-- mdv:page -->
 *
 * Découpe le document en sections (une section = une page à l’écran et au PDF).
 * Les sections « ## Offre N » activent automatiquement la mise en page compacte.
 */
export const PAGE_DELIMITER_LINE = /^\s*<!--\s*mdv:page\s*-->\s*$/;

const OFFRE_HEADING = /^##\s+Offre\s+\d+/m;

/** @param {string} text */
export function isOfferPageChunk(text) {
  return OFFRE_HEADING.test(text.trim());
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
        compact: isOfferPageChunk(text),
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
  return chunks.length > 0 ? chunks : [{ content: trimmed, compact: isOfferPageChunk(trimmed) }];
}
