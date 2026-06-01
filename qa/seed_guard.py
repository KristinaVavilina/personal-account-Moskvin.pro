"""Пропуск повторного сида, если полезные данные уже загружены."""
from __future__ import annotations

import os

import requests

from common import log, parse_body, url

FORCE = os.environ.get("SEED_FORCE", "").lower() in ("1", "true", "yes")
SKIP_IF_POPULATED = os.environ.get("SEED_SKIP_IF_POPULATED", "1").lower() in (
    "1",
    "true",
    "yes",
)


def already_seeded() -> bool:
    res = requests.get(url("/api/User"), timeout=30)
    if not res.ok:
        return False
    users = parse_body(res) or []
    if not isinstance(users, list):
        return False
    return any(
        isinstance(u, dict)
        and str(u.get("email", "")).lower().endswith("@moskvin.pro")
        for u in users
    )


def main() -> int:
    if FORCE:
        log("SEED_FORCE=1 — проверка наполненности пропущена.")
        return 1

    if not SKIP_IF_POPULATED:
        log("SEED_SKIP_IF_POPULATED=0 — сид выполняется без проверки.")
        return 1

    if already_seeded():
        log(
            "Сид пропущен: в БД уже есть пользователи @moskvin.pro. "
            "Повтор: SEED_FORCE=1 docker compose --profile seed run --rm seed"
        )
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(0 if main() == 0 else 1)
