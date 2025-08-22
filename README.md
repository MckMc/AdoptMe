# AdoptMe

Proyecto Coderhouse: Backend III

## Requisitos
- Docker Desktop (con WSL2 en Windows)

## Arranque rápido (Docker)
docker compose up -d --build
# App
NODE_ENV=production
PORT=8081
BASE_URL=http://localhost:8081

# Mongo (usa Atlas o local)
# Atlas (recomendado para dev compartido):
MONGO_URL=L=mongodb+srv://manuelcecchinkuhn:Gchu2025@cluster0.lsxnlkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
# Local (alternativa):
# MONGO_URL="mongodb://127.0.0.1:27017/adoptme"

# Auth / reset
JWT_SECRET=changeme
RESET_SECRET=changeme2

# Mailer
USE_ETHEREAL=true

## Para ver logs:
docker compose logs -f app

## Para apagar:
docker compose down


npm i
npm run dev