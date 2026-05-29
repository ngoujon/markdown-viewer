/** Template HTML pour la génération PDF (polices système uniquement, pas de réseau) */

const HTML_LIGHT_START = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: 'Source Serif 4', Georgia, serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; text-align: justify; background: #fff; }
    .markdown h1 { font-size: 1.75rem; font-weight: 600; margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #ccc; page-break-after: avoid; page-break-before: always; }
    .markdown h1:first-child { page-break-before: auto; }
    .markdown h2 { font-size: 1.35rem; font-weight: 600; margin: 1.5rem 0 0.75rem; page-break-after: avoid; }
    .markdown h3 { font-size: 1.15rem; font-weight: 600; margin: 1.25rem 0 0.5rem; page-break-after: avoid; }
    .markdown p { margin: 0 0 1rem; text-align: justify; }
    .markdown ul, .markdown ol { margin: 0 0 1rem; padding-left: 1.5rem; }
    .markdown table { width: 100%; border-collapse: collapse; margin: 1rem 0; page-break-inside: avoid; }
    .markdown table:has(td:nth-child(2):last-child) { table-layout: fixed; }
    .markdown table:has(td:nth-child(2):last-child) td:first-child,
    .markdown table:has(td:nth-child(2):last-child) th:first-child,
    .markdown table:has(td:nth-child(2):last-child) td:last-child,
    .markdown table:has(td:nth-child(2):last-child) th:last-child { width: 50%; }
    .markdown th, .markdown td { border: 1px solid #ccc; padding: 0.5rem 0.75rem; text-align: left; }
    .markdown th { background: #f0f0f0; }
    .markdown code { background: #f0f0f0; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; font-family: monospace; }
    .markdown pre { overflow-x: auto; padding: 1rem; background: #f5f5f5; border-radius: 6px; margin: 1rem 0; page-break-inside: avoid; }
    .markdown pre code { background: none; padding: 0; }
    .markdown a { color: #2563eb; }
    .page { padding: 0; }
    body.paged-document { margin: 0; padding: 0; }
    body.paged-document > .page { page-break-after: always; }
    body.paged-document > .page:last-child { page-break-after: auto; }
  </style>
</head>
<body>`;

const HTML_LIGHT_SINGLE_PAGE = `
  <div class="page">
    <div class="markdown">`;

/** Aligné sur l’UI (index.css : --bg, --surface, --text, --border, --accent) */
const HTML_DARK_START = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; }
    /* Marges PDF Chromium = zone blanche hors HTML : on les met à 0 côté serveur et on simule ici */
    /* Fond de chaque feuille entière (évite le cadre blanc sous le contenu ou entre pages) */
    @page {
      size: A4;
      margin: 0;
      background: #3d434c;
    }
    html {
      background: #3d434c;
      min-height: 100%;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      /* Remplace les marges PDF (mises à 0 côté Puppeteer) */
      padding: 15mm;
      /* Au moins une hauteur A4 : sinon Chromium laisse le bas de page blanc si peu de texte */
      min-height: 297mm;
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #e8eaed;
      text-align: justify;
      background: #3d434c;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .markdown h1 { font-size: 1.75rem; font-weight: 600; margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #5c6570; page-break-after: avoid; page-break-before: always; color: #e8eaed; }
    .markdown h1:first-child { page-break-before: auto; }
    .markdown h2 { font-size: 1.35rem; font-weight: 600; margin: 1.5rem 0 0.75rem; page-break-after: avoid; color: #e8eaed; }
    .markdown h3 { font-size: 1.15rem; font-weight: 600; margin: 1.25rem 0 0.5rem; page-break-after: avoid; color: #e8eaed; }
    .markdown p { margin: 0 0 1rem; text-align: justify; color: #e8eaed; }
    .markdown ul, .markdown ol { margin: 0 0 1rem; padding-left: 1.5rem; color: #e8eaed; }
    .markdown li::marker { color: #9ca3ae; }
    .markdown table { width: 100%; border-collapse: collapse; margin: 1rem 0; page-break-inside: avoid; }
    .markdown table:has(td:nth-child(2):last-child) { table-layout: fixed; }
    .markdown table:has(td:nth-child(2):last-child) td:first-child,
    .markdown table:has(td:nth-child(2):last-child) th:first-child,
    .markdown table:has(td:nth-child(2):last-child) td:last-child,
    .markdown table:has(td:nth-child(2):last-child) th:last-child { width: 50%; }
    .markdown th, .markdown td { border: 1px solid #5c6570; padding: 0.5rem 0.75rem; text-align: left; color: #e8eaed; }
    .markdown th { background: #545c68; }
    .markdown code { background: #4a515c; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; font-family: monospace; color: #e8eaed; }
    .markdown pre { overflow-x: auto; padding: 1rem; background: #4a515c; border-radius: 6px; margin: 1rem 0; page-break-inside: avoid; border: 1px solid #5c6570; }
    .markdown pre code { background: none; padding: 0; }
    .markdown a { color: #8fc9e2; }
    .markdown blockquote { margin: 1rem 0; padding-left: 1rem; border-left: 4px solid #7ab8d4; color: #9ca3ae; }
    .markdown hr { border: none; border-top: 1px solid #5c6570; margin: 1.5rem 0; }
    body.paged-document { padding: 0; min-height: auto; }
    .page { padding: 15mm; background: #3d434c; min-height: 297mm; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .markdown { background: transparent; }
  </style>
</head>
<body>`;

const HTML_DARK_SINGLE_PAGE = `
  <div class="page">
    <div class="markdown">`;

const HTML_END = `
</body>
</html>`;

const HTML_SINGLE_PAGE_END = `</div>
  </div>`;

/**
 * Pied de page Puppeteer (répété sur chaque page PDF).
 * @param {string} footerText
 * @param {'light' | 'dark'} theme
 */
export function getPdfFooterTemplate(footerText, theme = 'light') {
  const color = theme === 'dark' ? '#9ca3ae' : '#666666';
  const bg = theme === 'dark' ? '#3d434c' : '#ffffff';
  const escaped = footerText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `<div style="width:100%;font-size:8pt;font-family:Georgia,'Source Serif 4',serif;color:${color};background:${bg};padding:0 15mm 4mm;display:flex;justify-content:space-between;align-items:center;-webkit-print-color-adjust:exact;print-color-adjust:exact;"><span style="flex:1;padding-right:1em;text-align:left;">${escaped}</span><span style="white-space:nowrap;"><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;
}

/**
 * @param {string} bodyHtml
 * @param {{ theme?: 'light' | 'dark', multiPage?: boolean }} [options]
 */
export function getPrintHtml(bodyHtml, options = {}) {
  const theme = options.theme === 'dark' ? 'dark' : 'light';
  const start = theme === 'dark' ? HTML_DARK_START : HTML_LIGHT_START;
  if (options.multiPage) {
    const startPaged = start.replace('<body>', '<body class="paged-document">');
    return startPaged + bodyHtml + HTML_END;
  }
  const single = theme === 'dark' ? HTML_DARK_SINGLE_PAGE : HTML_LIGHT_SINGLE_PAGE;
  return start + single + bodyHtml + HTML_SINGLE_PAGE_END + HTML_END;
}
