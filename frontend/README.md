# Фронтенд — личный кабинет Moskvin.pro

React 19 + TypeScript + Vite 8. Сборка для production — статика в nginx (Docker).

## Разработка

```bash
npm ci
cp env.example .env.local   # опционально
npm run dev
```

API: относительные пути `/api/*`, в dev проксируются на `http://localhost:8080` (или `VITE_API_PROXY_TARGET`).

## Production

Подробно: **[DEPLOY.md](./DEPLOY.md)**.

```bash
npm run build
docker compose build frontend   # из корня репозитория
```

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Vite dev-server :5173 |
| `npm run build` | typecheck + production bundle → `dist/` |
| `npm run preview` | локальный просмотр `dist/` (:4173) |
| `npm run lint` | ESLint |
