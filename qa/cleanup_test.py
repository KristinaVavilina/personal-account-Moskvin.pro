"""Удаление ТОЛЬКО тестовых ([TEST]) данных. Полезные и нагрузочные данные остаются.

Удаляет:
- сущности из created_ids.json (bucket 'test');
- любые сущности с префиксом [TEST] в названии (подстраховка).
БД настроена на ON DELETE CASCADE, поэтому удаление [TEST]-пользователя
каскадно убирает его задачи/тайм-логи/рефлексии/быстрые ссылки.
"""
from __future__ import annotations

from common import State, TEST_MARK, get, delete, parse_body, log

state = State.load()
deleted = {"User": 0, "Kb": 0, "TaskType": 0, "Position": 0, "System": 0,
           "Task": 0, "TimeLog": 0, "DailyReflection": 0, "QuickLink": 0}


def try_delete(path: str, entity: str) -> None:
    r = delete(path)
    if r.ok:
        deleted[entity] += 1
    # 4xx означает, что запись уже удалена каскадом — это нормально


def cleanup_by_state():
    log("== Удаление по реестру test-сущностей ==")
    # Порядок: зависимые сущности раньше, затем владельцы. Пользователи — в конце (каскад).
    for qid in state.test.get("QuickLink", []):
        try_delete(f"/api/QuickLink/{qid}", "QuickLink")
    for lid in state.test.get("TimeLog", []):
        try_delete(f"/api/TimeLog/{lid}", "TimeLog")
    for tid in state.test.get("Task", []):
        try_delete(f"/api/Task/{tid}", "Task")
    for rid in state.test.get("DailyReflection", []):
        try_delete(f"/api/DailyReflection/{rid}", "DailyReflection")
    for sid in state.test.get("System", []):
        try_delete(f"/api/System/{sid}", "System")


def cleanup_by_prefix():
    log("== Подчистка по префиксу [TEST] ==")
    # Пользователи (каскадно удалит их задачи/логи/рефлексии/ссылки)
    users = parse_body(get("/api/User")) or []
    for u in users:
        if str(u.get("fullName", "")).startswith(TEST_MARK):
            try_delete(f"/api/User/{u['id']}", "User")

    # База знаний: статьи (type=1) раньше папок (type=0)
    kb = parse_body(get("/api/Kb")) or []
    test_kb = [k for k in kb if str(k.get("title", "")).startswith(TEST_MARK)]
    for k in sorted(test_kb, key=lambda x: 0 if x.get("type") == 1 else 1):
        try_delete(f"/api/Kb/{k['id']}", "Kb")

    # Типы задач (каскад уберёт связанные задачи)
    types = parse_body(get("/api/TaskType")) or []
    for t in types:
        if str(t.get("name", "")).startswith(TEST_MARK):
            try_delete(f"/api/TaskType/{t['id']}", "TaskType")

    # Должности
    positions = parse_body(get("/api/Position")) or []
    for p in positions:
        if str(p.get("title", "")).startswith(TEST_MARK):
            try_delete(f"/api/Position/{p['id']}", "Position")


def main():
    cleanup_by_state()
    cleanup_by_prefix()
    # очищаем test-реестр (useful сохраняем как есть)
    state.test = {}
    state.save()
    log("\nУдалено тестовых сущностей:")
    for k, v in deleted.items():
        if v:
            log(f"  {k}: {v}")


if __name__ == "__main__":
    main()
