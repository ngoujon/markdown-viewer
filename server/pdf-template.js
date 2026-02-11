/** Template HTML pour la génération PDF (polices système uniquement, pas de réseau) */
const HTML_START = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: 'Source Serif 4', Georgia, serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; }
    .markdown h1 { font-size: 1.75rem; font-weight: 600; margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #ccc; page-break-after: avoid; page-break-before: always; }
    .markdown h1:first-child { page-break-before: auto; }
    .markdown h2 { font-size: 1.35rem; font-weight: 600; margin: 1.5rem 0 0.75rem; page-break-after: avoid; }
    .markdown h3 { font-size: 0.95rem; font-weight: 600; margin: 0.5rem 0 0.25rem; page-break-after: avoid; }
    .markdown p { margin: 0 0 1rem; text-align: justify; }
    .markdown ul, .markdown ol { margin: 0 0 0.5rem; padding-left: 1.5rem; }
    .markdown li { margin-bottom: 0.1rem; text-align: justify; }
    .markdown table { width: 100%; border-collapse: collapse; margin: 1rem 0; page-break-inside: avoid; table-layout: auto; }
    .markdown th, .markdown td { border: 1px solid #ccc; padding: 0.25rem 0.5rem; }
    .markdown th:first-child, .markdown td:first-child { width: auto; }
    .markdown td:first-child { text-align: justify; }
    .markdown th:not(:first-child), .markdown td:not(:first-child) { width: 1%; white-space: nowrap; text-align: right; }
    .markdown th { background: #f0f0f0; }
    .markdown code { background: #f0f0f0; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; font-family: monospace; }
    .markdown pre { overflow-x: auto; padding: 1rem; background: #f5f5f5; border-radius: 6px; margin: 1rem 0; page-break-inside: avoid; }
    .markdown pre code { background: none; padding: 0; }
    .page { padding: 0; }
  </style>
</head>
<body>
  <div class="page">
    <div class="markdown">`;

const HTML_END = `</div>
  </div>
</body>
</html>`;

export function getPrintHtml(bodyHtml) {
  return HTML_START + bodyHtml + HTML_END;
}
