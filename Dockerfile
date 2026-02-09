# Debian pour Chromium (export PDF sans en-têtes/pieds de page)
FROM node:20-bookworm-slim

WORKDIR /app

# Chromium pour Puppeteer (export PDF) + polices pour un PDF lisible
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Server
COPY server/package.json server/
RUN cd server && npm install --omit=dev

# Client
COPY client/package.json client/
RUN cd client && npm install
COPY client/ client/
RUN cd client && npm run build

# Dossier des fichiers markdown (vide par défaut, à monter en volume)
RUN mkdir -p /app/files
COPY files/ /app/files/

COPY server/ server/

ENV NODE_ENV=production
ENV PORT=3000
ENV FILES_DIR=/app/files
ENV STATIC_DIR=/app/client/dist

EXPOSE 3000

CMD ["node", "server/index.js"]
