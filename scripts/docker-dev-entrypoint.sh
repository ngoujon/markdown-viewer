#!/bin/sh
set -e
# Synchronise node_modules du volume anonyme avec package.json monté depuis l'hôte
cd /app/client && npm install
cd /app/server && npm install
cd /app && exec npm run dev
