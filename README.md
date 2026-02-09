# Lecteur Markdown

Application pour lire des fichiers Markdown comme des pages, avec impression et export PDF via Chrome.

## Stack

- **Backend** : Node.js + Express (liste et contenu des `.md`)
- **Frontend** : React + Vite + react-markdown
- **Conteneur** : Docker + docker-compose

## Utilisation avec Docker

1. Placez vos fichiers Markdown dans le dossier **`files`** (à la racine du projet).
2. Lancez l’application :

```bash
docker compose up --build
```

3. Ouvrez **http://localhost:3000** dans Chrome.
4. Choisissez un fichier dans la liste, puis :
   - **Imprimer** : bouton « Imprimer / Export PDF » ou `Ctrl+P` (Windows/Linux) / `Cmd+P` (Mac)
   - **Export PDF** : dans la fenêtre d’impression Chrome, destination « Enregistrer au format PDF »

Les titres de niveau 1 (`#`) provoquent un saut de page à l’impression pour un rendu type « chapitres ».

## Développement local (sans Docker)

```bash
# Terminal 1 - API
cd server && npm install && npm run dev

# Terminal 2 - Client (avec proxy vers l’API)
cd client && npm install && npm run dev
```

Ouvrir http://localhost:5173. Les fichiers sont lus depuis le dossier `files` à la racine.

## Structure

```
markdown-viewer/
├── files/          # Vos fichiers .md (monté en volume avec Docker)
├── client/         # Application React
├── server/         # API Express
├── Dockerfile
└── docker-compose.yml
```
