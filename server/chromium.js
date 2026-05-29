import fs from 'fs';
import { execSync } from 'child_process';

const LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
];

/**
 * Chemins courants (Linux Docker, Debian, macOS).
 * @returns {string[]}
 */
function getCandidatePaths() {
  const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  return [
    fromEnv,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome-stable',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ].filter(Boolean);
}

/**
 * @returns {string | null}
 */
export function resolveChromiumExecutable() {
  for (const candidate of getCandidatePaths()) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      /* ignore */
    }
  }

  for (const cmd of ['chromium', 'chromium-browser', 'google-chrome-stable']) {
    try {
      const found = execSync(`command -v ${cmd}`, { encoding: 'utf8' }).trim();
      if (found && fs.existsSync(found)) return found;
    } catch {
      /* ignore */
    }
  }

  return null;
}

/** @returns {{ headless: true, executablePath: string, args: string[] }} */
export function getPuppeteerLaunchOptions() {
  const executablePath = resolveChromiumExecutable();
  if (!executablePath) {
    throw new Error(
      'Navigateur Chromium/Chrome introuvable pour l’export PDF. ' +
        'Sous macOS, installez Google Chrome ou définissez PUPPETEER_EXECUTABLE_PATH. ' +
        'Sous Docker/Linux : reconstruisez l’image (chromium dans le Dockerfile).'
    );
  }
  return {
    headless: true,
    executablePath,
    args: LAUNCH_ARGS,
  };
}
