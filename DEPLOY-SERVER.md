# Деплой на сервер 81.26.177.173

Изменения в коде **бэкенда не требуются**: фронт ходит в `/api/*` через nginx, API доступен только внутри Docker.

## Требования

- Linux с Docker и Docker Compose v2
- Открыт входящий **TCP 80** (firewall / security group)
- Git, клон репозитория на сервер

## Команды на сервере

```bash
git clone <url-репозитория> personal-account-Moskvin.pro
cd personal-account-Moskvin.pro

docker compose -f docker-compose.yml -f docker-compose.server.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.server.yml --profile seed run --rm seed
```

## Доступ

| Что | URL |
|-----|-----|
| Сайт | http://81.26.177.173 |
| API для браузера | http://81.26.177.173/api/... (прокси nginx) |

Порты **8080**, **5433**, **5341** с `docker-compose.server.yml` **не публикуются** наружу.

## Firewall (пример UFW)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw enable
```

## Вход в приложение

До подключения реального логина через API: mock-логин на фронте **123** / **123** (см. `frontend/src/constants`).

После сида в кабинете будут демо-пользователи из `qa/seed_useful.py`.

## Обновление

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.server.yml up -d --build
```

Только фронт:

```bash
docker compose -f docker-compose.yml -f docker-compose.server.yml up -d --build frontend
```

## Локальная разработка

Файл `docker-compose.server.yml` для локальной машины **не обязателен** — используйте обычный `docker compose up` (порты 8080/5433 останутся для отладки).

## HTTPS и домен

Для IP **81.26.177.173** обычно достаточно HTTP. Если позже появится домен — TLS на reverse proxy (Caddy/nginx) перед контейнером `frontend:80`.
