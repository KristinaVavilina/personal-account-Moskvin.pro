# QA-скрипты и сид БД

## Автосид при развёртывании (Docker)

Из **корня репозитория**, после поднятия стека:

```bash
docker compose up -d --build
docker compose --profile seed run --rm seed
```

Сервис `seed`:

1. Ждёт ответа `GET /api/User` на backend (до 180 с).
2. Пропускает сид, если уже есть пользователи с email `*@moskvin.pro`.
3. Запускает `seed_useful.py` (должности, сотрудники, задачи, БЗ и т.д.).

### Переменные

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `QA_API_BASE` | `http://backend:8080` | URL API |
| `SEED_WAIT_SECONDS` | `180` | Таймаут ожидания backend |
| `SEED_SKIP_IF_POPULATED` | `1` | Не сидить повторно |
| `SEED_FORCE` | — | `1` — сид даже если БД уже заполнена |

Принудительный повторный сид:

```bash
SEED_FORCE=1 docker compose --profile seed run --rm seed
```

## Локально (без Docker)

```bash
pip install -r qa/requirements.txt
export QA_API_BASE=http://localhost:8080
cd qa && ./run_seed.sh
```

## Прочие скрипты

| Файл | Назначение |
|------|------------|
| `seed_useful.py` | Демо-данные через API (без `[TEST]`) |
| `test_api.py` | CRUD-тесты, данные с `[TEST]` |
| `cleanup_test.py` | Удаление тестовых данных |
| `*.sql` | Доп. демо напрямую в Postgres (`psql`) |
