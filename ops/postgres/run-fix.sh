#!/usr/bin/env bash
set -euo pipefail

PGHOST="${PGHOST:-127.0.0.1}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-MoskvinDb}"

psql_base() {
  if [[ -n "${PGPASSWORD:-}" ]]; then
    PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" "$@"
  else
    psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" "$@"
  fi
}

echo "Проверка подключения к PostgreSQL (${PGHOST})..."
if ! psql_base -tAc "SELECT 1" >/dev/null 2>&1; then
  echo "ОШИБКА: нет доступа к БД. Проверьте пароль в volume или выполните:" >&2
  echo "  docker compose down -v   # удалит данные Postgres" >&2
  exit 1
fi

echo "Ожидание таблицы users (после EF Migrate)..."
found=0
for i in $(seq 1 45); do
  if psql_base -tAc \
    "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users'" \
    | grep -q 1; then
    echo "Таблица users найдена (попытка ${i})."
    found=1
    break
  fi
  sleep 2
done

if [[ "$found" -ne 1 ]]; then
  echo "ПРЕДУПРЕЖДЕНИЕ: users не появилась за 90 с — fix-schema пропущен." >&2
  exit 0
fi

psql_base -f /scripts/fix-schema.sql
echo "fix-schema.sql OK"
