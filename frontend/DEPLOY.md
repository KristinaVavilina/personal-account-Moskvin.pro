# Деплой фронтенда

SPA на Vite + React. В production статика отдаётся **nginx**, запросы `GET/POST /api/*` проксируются на ASP.NET backend.

## Быстрый старт (Docker)

Из корня репозитория:

```bash
docker compose build frontend
docker compose up -d frontend
```

Образ собирается с `target: production` (см. `Dockerfile`): `npm ci` → `vite build` → nginx:alpine.

Сайт: **http://localhost** (порт 80). Backend должен быть в той же Docker-сети (`backend:8080`).

## Локальная production-сборка

```bash
cd frontend
npm ci
npm run build
npm run preview
```

`preview` поднимает Vite на :4173 **без** прокси на API — для проверки UI. Полный сценарий с API: Docker или `npm run dev` + backend.

## Переменные окружения

| Переменная | Когда | Назначение |
|------------|--------|------------|
| `VITE_DEV_USER_ID` | только dev | Подмена userId; в `vite build` **игнорируется** |
| `VITE_API_PROXY_TARGET` | dev / Docker target `dev` | URL backend для прокси Vite (по умолчанию `http://localhost:8080`) |

Шаблон: [env.example](./env.example) → скопируйте в `.env.local`.

## Архитектура запросов

```
Браузер → nginx:80 → /        → index.html + assets (dist/)
                  → /api/*    → http://backend:8080 (docker-compose)
```

В коде все вызовы API — относительные (`fetch('/api/...')`). Отдельный `VITE_API_URL` не нужен.

## Чеклист перед выкладкой

- [ ] В `src/config/dataSources.ts` все `USE_*_MOCK = false`
- [ ] Не передавать `VITE_DEV_USER_ID` в `docker build` / CI для production
- [ ] Собрать образ: `docker compose build frontend`
- [ ] Backend доступен по имени `backend` из сети compose (или поправить `proxy_pass` в `nginx.default.conf`)

## Файлы деплоя

| Файл | Назначение |
|------|------------|
| `Dockerfile` | multi-stage: build + nginx production |
| `nginx.default.conf` | SPA fallback, gzip, прокси `/api/`, кэш статики |
| `.dockerignore` | исключает `node_modules`, `dist` из контекста сборки |

## HTTPS снаружи

TLS обычно терминируется на reverse proxy (Caddy/Traefik/внешний nginx) перед контейнером `frontend:80`. Внутри контейнера остаётся HTTP; заголовки `X-Forwarded-*` пробрасываются в `location /api/`.

## Обновление

```bash
docker compose build --no-cache frontend
docker compose up -d frontend
```

Статика пересобирается в образе; volume для фронта не требуется.
