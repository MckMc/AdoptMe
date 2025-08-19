# Ecommerce Backend

Proyecto Coderhouse: Backend III

## Requisitos
- Docker Desktop (con WSL2 en Windows)

## Arranque rápido (Docker)
docker compose up -d --build
# App:     http://localhost:8081/
# Swagger: http://localhost:8081/api/docs

## Para ver logs:
docker compose logs -f app

## Para apagar:
docker compose down

## Ejecutar local (sin Docker)
1. Tener MongoDB local corriendo en mongodb://127.0.0.1:27017.
2. Cambiar MONGO_URL en .env a mongodb://127.0.0.1:27017/ecommerce.
3. Instalar y correr:
npm i
npm run dev