#!/bin/bash

echo "🚀 Rozpoczynam procedurę Zero-Downtime Deployment dla LoadTrack..."

# 1. Pobierz najnowsze zmiany (opcjonalnie, jeśli używasz gita)
# git pull origin main

# 2. Instalacja zależności (jeśli package.json się zmienił)
echo "📦 Instalacja zależności..."
npm install --prefix server --silent
npm install --prefix client --silent

# 3. Budowanie Frontendu
echo "🏗️ Budowanie klienta (React)..."
cd client && npm run build --silent && cd ..

# 4. Budowanie Backend
echo "🔨 Kompilacja serwera (TypeScript)..."
cd server && npm run build --silent && cd ..

# 5. Migracje bazy danych
echo "🗄️ Aktualizacja schematu bazy danych..."
cd server && npx prisma migrate deploy && cd ..

# 6. Zero-Downtime Reload
echo "🔄 Przeładowanie procesów PM2 (Bez przerw w działaniu)..."
pm2 reload ecosystem.config.js --update-env

echo "✅ Wdrożenie zakończone sukcesem!"
