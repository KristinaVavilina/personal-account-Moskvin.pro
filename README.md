# personal-account-Moskvin.pro

Личный кабинет Moskvin.pro — React (Vite) + ASP.NET Core + PostgreSQL.

## Быстрый старт (Docker, локально)

```bash
docker compose up -d --build
docker compose --profile seed run --rm seed
```

- Сайт: http://localhost (порт 80)
- API: http://localhost:8080 (или через nginx `/api/`)
- Сид БД: см. [qa/README.md](./qa/README.md)

## Сервер 81.26.177.173

Публичный деплой (только порт 80 наружу, без правок бэкенда):

```bash
docker compose -f docker-compose.yml -f docker-compose.server.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.server.yml --profile seed run --rm seed
```

Сайт: **http://81.26.177.173** — подробно [DEPLOY-SERVER.md](./DEPLOY-SERVER.md).

## Документация

- [DEPLOY-SERVER.md](./DEPLOY-SERVER.md) — VPS, firewall, IP
- [frontend/DEPLOY.md](./frontend/DEPLOY.md) — деплой фронтенда
- [qa/README.md](./qa/README.md) — тесты и наполнение БД
