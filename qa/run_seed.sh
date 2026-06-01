#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "== Ожидание backend (${QA_API_BASE:-http://backend:8080}) =="
python wait_for_backend.py

echo "== Проверка, нужен ли сид =="
if python seed_guard.py; then
  exit 0
fi

echo "== Наполнение БД (seed_useful.py) =="
python seed_useful.py
