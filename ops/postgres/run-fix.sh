#!/usr/bin/env bash
set -euo pipefail

echo "Ожидание таблиц после EF Migrate..."
for i in $(seq 1 90); do
  if psql -h "${PGHOST:-db}" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-MoskvinDb}" -tAc \
    "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users'" | grep -q 1; then
    echo "Таблица users найдена (попытка $i)."
    break
  fi
  sleep 2
done

psql -h "${PGHOST:-db}" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-MoskvinDb}" -f /scripts/fix-schema.sql
echo "fix-schema.sql OK"
