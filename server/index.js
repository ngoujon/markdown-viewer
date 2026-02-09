import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';
import { getPrintHtml } from './pdf-template.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILES_DIR = process.env.FILES_DIR || path.join(__dirname, '..', 'files');
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
      });
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

function safePath(relativePath) {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
  return path.join(FILES_DIR, normalized);
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
    await fs.unlink(filePath);
    res.status(204).send();
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
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
