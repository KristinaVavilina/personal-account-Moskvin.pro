# Деплой на публичный сервер (VPS)

Фронт **не привязан к IP**: запросы `fetch('/api/...')` идут на тот же host, с которого открыт сайт. Меняется только адрес в браузере.

Укажите свой хост в `deploy.env` (см. [deploy.env.example](./deploy.env.example)).

## Требования

- Ubuntu (или другой Linux) с Docker и Docker Compose v2
- Открыт входящий **TCP 80**
- Git, клон репозитория

## Первый запуск

```bash
git clone <url-репозитория> personal-account-Moskvin.pro
cd personal-account-Moskvin.pro

docker compose -f docker-compose.yml -f docker-compose.server.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.server.yml --profile seed run --rm seed
```

Откройте в браузере: `http://<PUBLIC_HOST>` (IP или домен сервера).

## Обновление

```bash
cd personal-account-Moskvin.pro
git pull
docker compose -f docker-compose.yml -f docker-compose.server.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.server.yml --profile seed run --rm seed
```

После `up` автоматически выполняется **db-setup** (`ops/postgres/fix-schema.sql`) — исправляет рассинхрон схемы БД, из‑за которого API отдаёт 500.

## Ошибка «внутренняя ошибка сервера» в UI

1. Проверьте API: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/api/User` на сервере (ожидается **200**).
2. Логи: `docker compose logs backend --tail=80`
3. Пересоздайте стек и сид:

```bash
docker compose -f docker-compose.yml -f docker-compose.server.yml up -d --build --force-recreate
docker compose -f docker-compose.yml -f docker-compose.server.yml --profile seed run --rm seed
```

## Доступ

| Что | URL |
|-----|-----|
| Сайт | `http://<ваш-ip-или-домен>` |
| API | `http://<ваш-ip-или-домен>/api/...` (прокси nginx) |

С `docker-compose.server.yml` наружу публикуется только **порт 80**.

## Firewall (UFW)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw enable
```

В Yandex Cloud / другом облаке — откройте **80/tcp** в security group.

## Вход

Mock-логин на фронте: **123** / **123**. После сида — демо-данные из `qa/seed_useful.py`.

## HTTPS и домен

При появлении домена — TLS на reverse proxy перед `frontend:80`. Пересборка фронта из‑за смены IP/домена **не нужна**.
