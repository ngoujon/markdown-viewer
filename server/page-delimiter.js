/**
 * Saut de page Markdown (ligne seule) :
 *   <!-- mdv:page -->
 *
 * Découpe le document en sections (une section = une page à l’écran et au PDF).
 */
export const PAGE_DELIMITER_LINE = /^\s*<!--\s*mdv:page\s*-->\s*$/;

/** @param {string} markdown */
export function splitMarkdownByPages(markdown) {
  const lines = markdown.split(/\r?\n/);
  const chunks = [];
  let current = [];

  for (const line of lines) {
    if (PAGE_DELIMITER_LINE.test(line)) {
      const text = current.join('\n').trim();
      if (text) chunks.push(text);
      current = [];
    } else {
      current.push(line);
    }
  }

  const tail = current.join('\n').trim();
  if (tail) chunks.push(tail);

  return chunks.length > 0 ? chunks : [markdown.trim()];
}
