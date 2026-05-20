#!/bin/sh
set -e
# Réinstalle depuis le lockfile (corrige un volume node_modules obsolète ou incomplet)
for dir in client server; do
  cd "/app/$dir"
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
done
cd /app && exec npm run dev
