"""Общие хелперы для QA-скриптов: HTTP-клиент к backend и хранилище созданных ID.

Тестовые данные помечаются префиксом TEST_MARK в названии/email, чтобы их можно
было гарантированно удалить в конце. Полезные данные префикса не имеют.
"""
from __future__ import annotations

import json
import os
import sys
import time
from dataclasses import dataclass, field
from typing import Any

import requests

BASE = os.environ.get("QA_API_BASE", "http://localhost:8080")
TEST_MARK = "[TEST]"
STATE_FILE = os.path.join(os.path.dirname(__file__), "created_ids.json")


@dataclass
class State:
    """Реестр созданных сущностей: useful не удаляем, test — удаляем в конце."""
    useful: dict[str, list] = field(default_factory=dict)
    test: dict[str, list] = field(default_factory=dict)

    def add(self, bucket: str, entity: str, id_value: Any) -> None:
        target = self.test if bucket == "test" else self.useful
        target.setdefault(entity, []).append(id_value)

    def save(self) -> None:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump({"useful": self.useful, "test": self.test}, f, ensure_ascii=False, indent=2)

    @classmethod
    def load(cls) -> "State":
        if not os.path.exists(STATE_FILE):
            return cls()
        with open(STATE_FILE, encoding="utf-8") as f:
            data = json.load(f)
        return cls(useful=data.get("useful", {}), test=data.get("test", {}))


def url(path: str) -> str:
    return f"{BASE}{path}"


def get(path: str, **kw) -> requests.Response:
    return requests.get(url(path), timeout=30, **kw)


def post(path: str, body: Any) -> requests.Response:
    return requests.post(url(path), json=body, timeout=30)


def put(path: str, body: Any) -> requests.Response:
    return requests.put(url(path), json=body, timeout=30)


def delete(path: str) -> requests.Response:
    return requests.delete(url(path), timeout=30)


def parse_body(res: requests.Response) -> Any:
    txt = res.text.strip()
    if not txt:
        return None
    try:
        return json.loads(txt)
    except json.JSONDecodeError:
        return txt


def log(msg: str) -> None:
    print(msg, flush=True)
