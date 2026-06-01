"""Ожидание готовности backend перед сидом (docker compose profile seed)."""
from __future__ import annotations

import os
import sys
import time

import requests

from common import log, url

WAIT_SECONDS = int(os.environ.get("SEED_WAIT_SECONDS", "180"))
POLL_INTERVAL = float(os.environ.get("SEED_POLL_INTERVAL", "2"))


def main() -> None:
    deadline = time.monotonic() + WAIT_SECONDS
    attempt = 0
    while time.monotonic() < deadline:
        attempt += 1
        try:
            res = requests.get(url("/api/User"), timeout=10)
            if res.status_code < 500:
                log(f"Backend доступен ({res.status_code}) после {attempt} попыток.")
                return
            log(f"  … попытка {attempt}: HTTP {res.status_code}")
        except requests.RequestException as exc:
            log(f"  … попытка {attempt}: {exc}")
        time.sleep(POLL_INTERVAL)
    log(f"Таймаут {WAIT_SECONDS}s: backend не ответил на GET /api/User")
    sys.exit(1)


if __name__ == "__main__":
    main()
