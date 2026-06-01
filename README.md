# personal-account-Moskvin.pro

Личный кабинет Moskvin.pro — React (Vite) + ASP.NET Core + PostgreSQL.

## Быстрый старт (Docker)

```bash
docker compose up -d --build
docker compose --profile seed run --rm seed
```

- Сайт: http://localhost (порт 80)
- API: http://localhost:8080 (или через nginx `/api/`)
- Сид БД: см. [qa/README.md](./qa/README.md)

## Документация

- [frontend/DEPLOY.md](./frontend/DEPLOY.md) — деплой фронтенда
- [qa/README.md](./qa/README.md) — тесты и наполнение БД
