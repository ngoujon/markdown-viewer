import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked, Renderer } from 'marked';

/** Aucun lien cliquable : les liens markdown sont rendus comme du texte simple */
const noLinksRenderer = new Renderer();
noLinksRenderer.link = (href, title, text) => text || '';
marked.use({ renderer: noLinksRenderer });
import puppeteer from 'puppeteer-core';
import { getPrintHtml } from './pdf-template.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILES_DIR = process.env.FILES_DIR || path.join(__dirname, '..', 'files');
const TRASH_DIR = path.join(FILES_DIR, '.trash');
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, '..', 'client', 'dist');

const ALLOWED_EXT = ['.md', '.txt'];
function isAllowedFile(name) {
  const ext = path.extname(name).toLowerCase();
  return ALLOWED_EXT.includes(ext);
}

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await fs.mkdir(FILES_DIR, { recursive: true });
    cb(null, FILES_DIR);
  },
  filename: (_req, file, cb) => cb(null, path.basename(file.originalname)),
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (isAllowedFile(file.originalname)) cb(null, true);
    else cb(new Error('Seuls les fichiers .txt et .md sont acceptés'), false);
  },
});

const app = express();
app.use(cors());

async function getListedFiles(dir, base = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.trash') continue;
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      const sub = await getListedFiles(path.join(dir, entry.name), rel);
      files.push(...sub);
    } else if (isAllowedFile(entry.name)) {
      const fullPath = path.join(dir, entry.name);
      const stat = await fs.stat(fullPath);
      const createdAt = (stat.birthtime && stat.birthtime.getTime() > 0 ? stat.birthtime : stat.ctime).toISOString();
      const modifiedAt = stat.mtime.toISOString();
      files.push({
        path: rel.replace(/\\/g, '/'),
        name: entry.name,
        createdAt,
        modifiedAt,
        size: stat.size,
      });
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

function safePath(relativePath) {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
  return path.join(FILES_DIR, normalized);
}

function safeTrashPath(relativePath) {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
  return path.join(TRASH_DIR, normalized);
}

function timestampSuffix() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

app.get('/api/files', async (req, res) => {
  try {
    await fs.mkdir(FILES_DIR, { recursive: true });
    const files = await getListedFiles(FILES_DIR);
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.json([]);
  }
  try {
    await fs.mkdir(FILES_DIR, { recursive: true });
    const files = await getListedFiles(FILES_DIR);
    const lowerQ = q.toLowerCase();
    const matching = [];
    for (const f of files) {
      const fullPath = safePath(f.path);
      if (!fullPath.startsWith(FILES_DIR)) continue;
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        if (content.toLowerCase().includes(lowerQ)) {
          matching.push(f.path);
        }
      } catch {
        // ignorer les fichiers inaccessibles
      }
    }
    res.json(matching);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload', (req, res) => {
  upload.array('files', 20)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || 'Upload refusé' });
    }
    const uploaded = (req.files || []).map((f) => ({ name: f.filename, path: f.filename }));
    res.json({ ok: true, files: uploaded });
  });
});

app.post('/api/files/create', express.json(), async (req, res) => {
  const rawName = req.body?.name;
  if (!rawName || typeof rawName !== 'string') {
    return res.status(400).json({ error: 'Nom requis' });
  }
  const base = rawName.trim().replace(/\s+/g, '_').replace(/\.md$/i, '') || 'nouveau';
  const filename = `${base}.md`;
  const relativePath = filename;
  if (relativePath.includes('..') || path.dirname(relativePath) !== '.') {
    return res.status(400).json({ error: 'Nom invalide' });
  }
  const filePath = safePath(relativePath);
  if (!filePath.startsWith(FILES_DIR)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    await fs.mkdir(FILES_DIR, { recursive: true });
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (exists) {
      return res.status(409).json({ error: `Le fichier « ${filename} » existe déjà.` });
    }
    await fs.writeFile(filePath, '', 'utf-8');
    const stat = await fs.stat(filePath);
    const createdAt = (stat.birthtime && stat.birthtime.getTime() > 0 ? stat.birthtime : stat.ctime).toISOString();
    const modifiedAt = stat.mtime.toISOString();
    res.status(201).json({
      path: relativePath,
      name: filename,
      createdAt,
      modifiedAt,
      size: 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/files/duplicate', express.json(), async (req, res) => {
  const relativePath = req.body?.path;
  if (!relativePath || typeof relativePath !== 'string' || relativePath.includes('..')) {
    return res.status(400).json({ error: 'Chemin invalide' });
  }
  const filePath = safePath(relativePath);
  if (!filePath.startsWith(FILES_DIR)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!exists) return res.status(404).json({ error: 'Not found' });
    const content = await fs.readFile(filePath, 'utf-8');
    const dir = path.dirname(relativePath);
    const ext = path.extname(relativePath).toLowerCase();
    const base = path.basename(relativePath, ext);
    const dirPrefix = dir !== '.' ? `${dir.replace(/\\/g, '/')}/` : '';
    let candidate = `${dirPrefix}${base} (copie)${ext}`;
    let destPath = safePath(candidate);
    let n = 1;
    while (await fs.access(destPath).then(() => true).catch(() => false)) {
      n += 1;
      candidate = `${dirPrefix}${base} (copie ${n})${ext}`;
      destPath = safePath(candidate);
    }
    if (!destPath.startsWith(FILES_DIR)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, content, 'utf-8');
    const stat = await fs.stat(destPath);
    const createdAt = (stat.birthtime && stat.birthtime.getTime() > 0 ? stat.birthtime : stat.ctime).toISOString();
    const modifiedAt = stat.mtime.toISOString();
    const newRelative = candidate.replace(/\\/g, '/');
    res.status(201).json({
      path: newRelative,
      name: path.basename(newRelative),
      createdAt,
      modifiedAt,
      size: stat.size,
    });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Not found' });
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/files/*', async (req, res) => {
  const relativePath = req.params[0];
  if (!relativePath || relativePath.includes('..')) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  const filePath = safePath(relativePath);
  if (!filePath.startsWith(FILES_DIR)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    res.type('text/plain').send(content);
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Not found' });
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/files/*', express.json(), async (req, res) => {
  const relativePath = req.params[0];
  const rawName = req.body?.newName;
  if (!relativePath || relativePath.includes('..')) {
    return res.status(400).json({ error: 'Chemin invalide' });
  }
  if (!rawName || typeof rawName !== 'string') {
    return res.status(400).json({ error: 'Nom requis' });
  }
  const ext = path.extname(relativePath).toLowerCase();
  const base = rawName.trim().replace(/\s+/g, '_').replace(new RegExp(`\\${ext}$`, 'i'), '') || path.basename(relativePath, ext);
  const newFilename = `${base}${ext}`;
  if (path.dirname(newFilename) !== '.' || newFilename.includes('..')) {
    return res.status(400).json({ error: 'Nom invalide' });
  }
  const filePath = safePath(relativePath);
  const newFilePath = safePath(newFilename);
  if (!filePath.startsWith(FILES_DIR) || !newFilePath.startsWith(FILES_DIR)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (filePath === newFilePath) {
    return res.status(400).json({ error: 'Le nom est identique' });
  }
  try {
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!exists) return res.status(404).json({ error: 'Not found' });
    const destExists = await fs.access(newFilePath).then(() => true).catch(() => false);
    if (destExists) {
      return res.status(409).json({ error: `Le fichier « ${newFilename} » existe déjà.` });
    }
    await fs.rename(filePath, newFilePath);
    const stat = await fs.stat(newFilePath);
    const createdAt = (stat.birthtime && stat.birthtime.getTime() > 0 ? stat.birthtime : stat.ctime).toISOString();
    const modifiedAt = stat.mtime.toISOString();
    res.json({
      path: newFilename,
      name: newFilename,
      createdAt,
      modifiedAt,
      size: stat.size,
    });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Not found' });
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/files/*', async (req, res) => {
  const relativePath = req.params[0];
  if (!relativePath || relativePath.includes('..')) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  const filePath = safePath(relativePath);
  if (!filePath.startsWith(FILES_DIR)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      return res.status(400).json({ error: 'Not a file' });
    }
    let trashDest = safeTrashPath(relativePath);
    if (!trashDest.startsWith(TRASH_DIR)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await fs.mkdir(path.dirname(trashDest), { recursive: true });
    if (await fs.access(trashDest).then(() => true).catch(() => false)) {
      const ext = path.extname(trashDest);
      const base = path.basename(trashDest, ext);
      const dir = path.dirname(trashDest);
      trashDest = path.join(dir, `${base}_${timestampSuffix()}${ext}`);
    }
    await fs.rename(filePath, trashDest);
    res.status(204).send();
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Not found' });
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/trash', async (req, res) => {
  try {
    await fs.mkdir(TRASH_DIR, { recursive: true });
    const files = await getListedFiles(TRASH_DIR);
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trash/restore', express.json(), async (req, res) => {
  const relativePath = req.body?.path;
  if (!relativePath || typeof relativePath !== 'string' || relativePath.includes('..')) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  const trashPath = safeTrashPath(relativePath);
  if (!trashPath.startsWith(TRASH_DIR)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const stat = await fs.stat(trashPath);
    if (!stat.isFile()) {
      return res.status(400).json({ error: 'Not a file' });
    }
    let restoreDest = safePath(relativePath);
    if (!restoreDest.startsWith(FILES_DIR)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const ext = path.extname(restoreDest);
    const base = path.basename(restoreDest, ext);
    const dir = path.dirname(restoreDest);
    const exists = await fs.access(restoreDest).then(() => true).catch(() => false);
    if (exists) {
      restoreDest = path.join(dir, `${base}_restored_${timestampSuffix()}${ext}`);
    }
    await fs.mkdir(path.dirname(restoreDest), { recursive: true });
    await fs.rename(trashPath, restoreDest);
    const restoredName = path.basename(restoreDest);
    res.json({ ok: true, path: path.relative(FILES_DIR, restoreDest).replace(/\\/g, '/'), name: restoredName });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Not found' });
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Export PDF sans en-têtes ni pieds de page (génération côté serveur)
app.get('/api/export-pdf', async (req, res) => {
  const relativePath = req.query.path;
  if (!relativePath || typeof relativePath !== 'string' || relativePath.includes('..')) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  const filePath = safePath(relativePath);
  if (!filePath.startsWith(FILES_DIR)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  let browser;
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const bodyHtml = await marked.parse(raw);
    const html = getPrintHtml(bodyHtml);

    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || null;
    browser = await puppeteer.launch({
      headless: true,
      ...(executablePath && { executablePath }),
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    });

    await browser.close();
    browser = null;

    const buf = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    if (buf.length === 0 || buf.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new Error('Génération PDF invalide');
    }

    const filename = path.basename(filePath, path.extname(filePath)) + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', buf.length);
    res.setHeader('Cache-Control', 'no-transform'); // évite que des proxies modifient le binaire
    res.send(buf); // Express gère correctement l'envoi binaire d'un Buffer (res.end + 'binary' peut corrompre)
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Not found' });
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Servir le client React en production (Docker)
try {
  const { existsSync } = await import('fs');
  if (existsSync(STATIC_DIR)) {
    app.use(express.static(STATIC_DIR));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.sendFile(path.join(STATIC_DIR, 'index.html'));
    });
  }
} catch (_) {}

async function seedTrashExample() {
  try {
    await fs.mkdir(TRASH_DIR, { recursive: true });
    const entries = await fs.readdir(TRASH_DIR);
    if (entries.length === 0) {
      const examplePath = path.join(TRASH_DIR, 'exemple-supprime.md');
      const exampleContent = `# Exemple de fichier supprimé

Ce fichier est un exemple placé dans la corbeille. Vous pouvez le restaurer pour le remettre dans la liste des fichiers.

## Fonctionnalités de la corbeille

- Les fichiers supprimés sont déplacés ici au lieu d'être effacés
- Cliquez sur « Restaurer » pour remettre un fichier dans la liste
- En cas de conflit de nom, un suffixe sera ajouté au fichier restauré
`;
      await fs.writeFile(examplePath, exampleContent, 'utf-8');
    }
  } catch (err) {
    console.error('Seed trash:', err.message);
  }
}

const PORT = process.env.PORT || 3001;
seedTrashExample().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
