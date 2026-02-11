# Lecteur Markdown

Application web pour lire des fichiers Markdown comme des pages : liste des fichiers, rendu HTML et export PDF (génération côté serveur via Chromium/Puppeteer). Idéal pour consulter des CGV, documentations ou notes au format Markdown et les imprimer ou enregistrer en PDF.

## Fonctionnalités

- **Liste des fichiers** : affichage de tous les `.md` du dossier `files` (y compris dans les sous-dossiers)
- **Rendu Markdown** : affichage en HTML avec `react-markdown`
- **Export PDF** : bouton « Imprimer » qui génère un PDF côté serveur (Puppeteer/Chromium) et ouvre une fenêtre pour imprimer ou enregistrer en PDF
- **Impression** : les titres de niveau 1 (`#`) provoquent un saut de page pour un rendu type chapitres

## Stack

- **Backend** : Node.js 20 + Express (liste et contenu des `.md`, export PDF)
- **Frontend** : React 18 + Vite + react-markdown
- **PDF** : Puppeteer (Chromium) pour la génération serveur
- **Conteneur** : Docker + docker-compose

## Prérequis

- **Avec Docker** : Docker et Docker Compose
- **Sans Docker** : Node.js 20+ et npm

## Installation

### Cloner le projet

```bash
git clone <url-du-repo>
cd markdown-viewer
```

### Option 1 : Lancer avec Docker (recommandé en production)

1. Placez vos fichiers Markdown dans le dossier **`files`** à la racine du projet (créer le dossier si besoin).
2. Construire et démarrer :

```bash
npm run docker:up
# ou : docker compose up --build
```

3. Si Docker affiche une ancienne version après des modifications, reconstruire sans cache :

```bash
npm run docker:build
docker compose up
```

4. Ouvrir **http://localhost:3000** dans le navigateur.
5. Choisir un fichier dans la liste, puis utiliser le bouton **« Imprimer »** pour générer un PDF et l’ouvrir (impression ou enregistrement en PDF). Dans la fenêtre d’impression du navigateur, décocher « En-têtes et pieds de page » pour éviter URL, date et numéros de page.

### Option 2 : Développement local (sans Docker)

1. Créer le dossier `files` à la racine et y mettre vos fichiers `.md`.

2. Installer les dépendances et lancer client + serveur :

```bash
npm install && cd client && npm install && cd ../server && npm install && cd ..
npm run dev
```

Le client tourne sur **http://localhost:5173** et le serveur sur **http://localhost:3001** (proxy Vite).

3. Ouvrir **http://localhost:5173**. Les fichiers sont lus depuis le dossier `files` à la racine.

Production locale (même version que Docker) : `npm run start` (build puis serveur sur **http://localhost:3001**).

**Note** : L’export PDF en local nécessite Chromium/Chrome installé sur la machine. Avec `puppeteer-core`, définir éventuellement `PUPPETEER_EXECUTABLE_PATH` vers l’exécutable Chromium/Chrome.

## Variables d’environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port du serveur | `3001` (local) / `3000` (Docker) |
| `FILES_DIR` | Dossier des fichiers Markdown | `../files` (relatif au serveur) ou `/app/files` (Docker) |
| `STATIC_DIR` | Dossier du client buildé (production) | `../client/dist` ou `/app/client/dist` |
| `PUPPETEER_EXECUTABLE_PATH` | Chemin vers Chromium/Chrome (export PDF) | non défini (Puppeteer utilise son binaire) |

## Structure du projet

```
markdown-viewer/
├── files/              # Vos fichiers .md (monté en volume avec Docker)
├── client/             # Application React (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── vite.config.js  # proxy /api → serveur
├── server/             # API Express
│   ├── index.js        # routes /api/files, /api/files/*, /api/export-pdf
│   └── pdf-template.js # template HTML pour le PDF
├── Dockerfile          # Node 20 + Chromium + build client + serveur
└── docker-compose.yml
```

## API

- `GET /api/files` : liste des fichiers `.md` (path + name)
- `GET /api/files/:path` : contenu brut du fichier Markdown
- `GET /api/export-pdf?path=...` : génération et téléchargement du PDF (Puppeteer)
