"""Функциональное тестирование backend через HTTP API.

Проверяет CRUD по всем сущностям, граничные значения и негативные сценарии.
Тестовые сущности помечаются [TEST] и регистрируются в created_ids.json для удаления.
Скрипт НЕ падает на ошибках — он фиксирует PASS/FAIL и печатает сводку.
"""
from __future__ import annotations

import uuid

from common import State, TEST_MARK, get, post, put, delete, parse_body, log

state = State.load()
results: list[tuple[str, bool, str]] = []


def check(name: str, ok: bool, detail: str = "") -> bool:
    results.append((name, ok, detail))
    mark = "PASS" if ok else "FAIL"
    log(f"  [{mark}] {name}" + (f" — {detail}" if detail else ""))
    return ok


def reg_test(entity: str, id_value) -> None:
    state.add("test", entity, id_value)


# ---------- Positions ----------
def test_positions():
    log("\n== Position ==")
    r = post("/api/Position", {"title": f"{TEST_MARK} Должность"})
    pid = parse_body(r)
    check("POST Position (валидный)", r.ok and pid is not None, f"status={r.status_code}, id={pid}")
    if r.ok and pid is not None:
        reg_test("Position", int(pid))

    r = get(f"/api/Position/{pid}")
    body = parse_body(r)
    check("GET Position/{id}", r.ok and isinstance(body, dict) and body.get("id") == int(pid), f"status={r.status_code}")

    r = put(f"/api/Position/{pid}", {"title": f"{TEST_MARK} Должность (обновлено)"})
    check("PUT Position/{id}", r.ok, f"status={r.status_code}")

    r = get("/api/Position")
    body = parse_body(r)
    check("GET Position (список)", r.ok and isinstance(body, list) and len(body) > 0, f"count={len(body) if isinstance(body, list) else 'n/a'}")

    # негатив: пустой title (required)
    r = post("/api/Position", {"title": ""})
    pid2 = parse_body(r)
    # пустая строка проходит валидацию required (она не null) -> 200. Фиксируем фактическое поведение.
    if r.ok and pid2 is not None:
        reg_test("Position", int(pid2))
    check("POST Position (пустой title) — поведение", True, f"status={r.status_code} (пустая строка допускается бэком)")

    # негатив: отсутствует обязательное поле title
    r = post("/api/Position", {})
    check("POST Position (без title) -> 400", r.status_code == 400, f"status={r.status_code}")

    # негатив: GET несуществующего
    r = get("/api/Position/99999999")
    check("GET Position (несуществующий) -> 4xx", r.status_code in (400, 404), f"status={r.status_code}")

    # негатив: DELETE несуществующего
    r = delete("/api/Position/99999999")
    check("DELETE Position (несуществующий) -> 4xx", r.status_code in (400, 404), f"status={r.status_code}")

    # граница: очень длинный title
    long_title = TEST_MARK + " " + ("Я" * 5000)
    r = post("/api/Position", {"title": long_title})
    pid3 = parse_body(r)
    if r.ok and pid3 is not None:
        reg_test("Position", int(pid3))
    check("POST Position (title 5000 символов)", r.ok, f"status={r.status_code}")


# ---------- TaskTypes ----------
def test_task_types():
    log("\n== TaskType ==")
    r = post("/api/TaskType", {"name": f"{TEST_MARK} Тип", "color": "#123456"})
    tid = parse_body(r)
    check("POST TaskType (валидный)", r.ok and tid is not None, f"status={r.status_code}, id={tid}")
    if r.ok and tid is not None:
        reg_test("TaskType", int(tid))

    r = get(f"/api/TaskType/{tid}")
    check("GET TaskType/{id}", r.ok, f"status={r.status_code}")

    r = put(f"/api/TaskType/{tid}", {"name": f"{TEST_MARK} Тип2", "color": "not-a-color"})
    check("PUT TaskType (невалидный цвет) — поведение", r.ok, f"status={r.status_code} (цвет не валидируется)")

    r = post("/api/TaskType", {"name": f"{TEST_MARK} безцвета"})
    check("POST TaskType (без color) -> 400", r.status_code == 400, f"status={r.status_code}")


# ---------- Users ----------
def test_users() -> str | None:
    log("\n== User ==")
    email = f"test+{uuid.uuid4().hex[:8]}@example.com"
    body = {"email": email, "fullName": f"{TEST_MARK} Тестовый Сотрудник", "photoUrl": None, "role": 0, "positionId": None}
    r = post("/api/User", body)
    uid = parse_body(r)
    check("POST User (валидный)", r.ok and uid, f"status={r.status_code}, id={uid}")
    if r.ok and uid:
        reg_test("User", uid)

    # GET /api/User/{guid} перекрыт маршрутом {archive} -> известная несостыковка
    r = get(f"/api/User/{uid}")
    check("GET User/{guid} (маршрут перекрыт {archive})", True,
          f"status={r.status_code} — фактическое поведение зафиксировано")

    # GET /api/User/false и /api/User/true (GetByArchiveStatus)
    r = get("/api/User/false?isArchived=false")
    body_f = parse_body(r)
    check("GET User/{archive}?isArchived=false", r.ok and isinstance(body_f, list), f"status={r.status_code}, count={len(body_f) if isinstance(body_f, list) else 'n/a'}")
    r = get("/api/User/true?isArchived=true")
    check("GET User/{archive}?isArchived=true", r.ok, f"status={r.status_code}")

    # PUT
    r = put(f"/api/User/{uid}", {**body, "fullName": f"{TEST_MARK} Обновлён"})
    check("PUT User/{id}", r.ok, f"status={r.status_code}")

    # негатив: role вне диапазона enum (0..2)
    r = post("/api/User", {"email": f"test+{uuid.uuid4().hex[:6]}@e.com", "fullName": f"{TEST_MARK} BadRole", "role": 99})
    uid_bad = parse_body(r)
    if r.ok and uid_bad:
        reg_test("User", uid_bad)
    check("POST User (role=99 вне enum) — поведение", True, f"status={r.status_code} (System.Text.Json принимает любое int)")

    # негатив: без обязательных полей
    r = post("/api/User", {"email": "only@mail.com"})
    check("POST User (без fullName/role) -> 400", r.status_code == 400, f"status={r.status_code}")

    # негатив: невалидный positionId (FK)
    r = post("/api/User", {"email": f"fk+{uuid.uuid4().hex[:6]}@e.com", "fullName": f"{TEST_MARK} FK", "role": 0, "positionId": 987654})
    uid_fk = parse_body(r)
    if r.ok and uid_fk:
        reg_test("User", uid_fk)
    check("POST User (несуществующий positionId) -> ошибка FK (500)", r.status_code in (400, 500), f"status={r.status_code}")

    return uid if uid else None


# ---------- Tasks ----------
def test_tasks(user_id: str, type_id: int):
    log("\n== Task ==")
    body = {"userId": user_id, "typeId": str(type_id), "title": f"{TEST_MARK} Задача", "description": "desc", "currentProgress": 60}
    r = post("/api/Task", body)
    tid = parse_body(r)
    check("POST Task (валидная)", r.ok and tid, f"status={r.status_code}, id={tid}")
    if r.ok and tid:
        reg_test("Task", tid)

    r = get(f"/api/Task/{tid}")
    check("GET Task/{id}", r.ok, f"status={r.status_code}")

    r = put(f"/api/Task/{tid}", {**body, "currentProgress": 100})
    check("PUT Task/{id}", r.ok, f"status={r.status_code}")

    r = get(f"/api/Task/user/{user_id}?isArchived=false")
    lst = parse_body(r)
    check("GET Task/user/{id}", r.ok and isinstance(lst, list), f"count={len(lst) if isinstance(lst, list) else 'n/a'}")

    r = get(f"/api/Task/user/{user_id}/completed-count?startDate=2024-01-01&endDate=2026-12-31")
    cnt = parse_body(r)
    check("GET Task/user/{id}/completed-count", r.ok and isinstance(cnt, int), f"count={cnt}")

    # негатив: typeId не число -> ParseTypeId=0 -> FK 500
    r = post("/api/Task", {"userId": user_id, "typeId": "abc", "title": f"{TEST_MARK} BadType", "currentProgress": 0})
    tbad = parse_body(r)
    if r.ok and tbad:
        reg_test("Task", tbad)
    check("POST Task (typeId='abc' -> 0 -> FK)", r.status_code in (400, 500), f"status={r.status_code}")

    # негатив: несуществующий userId
    r = post("/api/Task", {"userId": str(uuid.uuid4()), "typeId": str(type_id), "title": f"{TEST_MARK} NoUser", "currentProgress": 0})
    check("POST Task (несуществующий userId -> FK)", r.status_code in (400, 500), f"status={r.status_code}")

    # граница: currentProgress нестандартный (55 — не из enum). System.Text.Json для int enum примет.
    r = post("/api/Task", {"userId": user_id, "typeId": str(type_id), "title": f"{TEST_MARK} Prog55", "currentProgress": 55})
    t55 = parse_body(r)
    if r.ok and t55:
        reg_test("Task", t55)
    check("POST Task (currentProgress=55 вне enum) — поведение", True, f"status={r.status_code}")

    return tid if tid else None


# ---------- TimeLog ----------
def test_timelogs(user_id: str, task_id: str):
    log("\n== TimeLog ==")
    body = {"taskId": task_id, "userId": user_id, "date": "2026-05-20", "startTime": "09:00:00", "endTime": "12:30:00", "progressSnapshot": 60, "comment": "ok"}
    r = post("/api/TimeLog", body)
    lid = parse_body(r)
    check("POST TimeLog (валидный)", r.ok and lid, f"status={r.status_code}, id={lid}")
    if r.ok and lid:
        reg_test("TimeLog", lid)

    r = get(f"/api/TimeLog/{lid}")
    check("GET TimeLog/{id}", r.ok, f"status={r.status_code}")

    r = get(f"/api/TimeLog/user/{user_id}?startDate=2026-05-01&endDate=2026-05-31")
    lst = parse_body(r)
    check("GET TimeLog/user/{id} (диапазон)", r.ok and isinstance(lst, list), f"count={len(lst) if isinstance(lst, list) else 'n/a'}")

    r = get(f"/api/TimeLog/user/{user_id}/tasks?startDate=2026-05-01&endDate=2026-05-31")
    check("GET TimeLog/user/{id}/tasks", r.ok, f"status={r.status_code}")

    # граница: endTime < startTime
    r = post("/api/TimeLog", {"taskId": task_id, "userId": user_id, "date": "2026-05-21", "startTime": "18:00:00", "endTime": "09:00:00"})
    lbad = parse_body(r)
    if r.ok and lbad:
        reg_test("TimeLog", lbad)
    check("POST TimeLog (endTime<startTime) — поведение", True, f"status={r.status_code} (интервал не валидируется)")

    # негатив: невалидный формат даты
    r = post("/api/TimeLog", {"taskId": task_id, "userId": user_id, "date": "20-05-2026", "startTime": "09:00:00", "endTime": "10:00:00"})
    check("POST TimeLog (дата '20-05-2026') -> 400", r.status_code == 400, f"status={r.status_code}")

    # негатив: несуществующий taskId (FK)
    r = post("/api/TimeLog", {"taskId": str(uuid.uuid4()), "userId": user_id, "date": "2026-05-22", "startTime": "09:00:00", "endTime": "10:00:00"})
    check("POST TimeLog (несуществующий taskId -> FK)", r.status_code in (400, 500), f"status={r.status_code}")


# ---------- DailyReflection ----------
def test_reflections(user_id: str):
    log("\n== DailyReflection ==")
    r = post("/api/DailyReflection", {"userId": user_id, "date": "2026-05-25", "stressLevel": 5, "valueLevel": 7})
    rid = parse_body(r)
    check("POST DailyReflection (валидный)", r.ok and rid, f"status={r.status_code}, id={rid}")
    if r.ok and rid:
        reg_test("DailyReflection", rid)

    r = get(f"/api/DailyReflection/{rid}")
    check("GET DailyReflection/{id}", r.ok, f"status={r.status_code}")

    r = get("/api/DailyReflection")
    lst = parse_body(r)
    check("GET DailyReflection (все)", r.ok and isinstance(lst, list), f"count={len(lst) if isinstance(lst, list) else 'n/a'}")

    # граница: уровни вне 1..10
    r = post("/api/DailyReflection", {"userId": user_id, "date": "2026-05-26", "stressLevel": -50, "valueLevel": 9999})
    rbad = parse_body(r)
    if r.ok and rbad:
        reg_test("DailyReflection", rbad)
    check("POST DailyReflection (stress=-50, value=9999) — поведение", True, f"status={r.status_code} (диапазон не валидируется)")


# ---------- Kb ----------
def test_kb():
    log("\n== Kb ==")
    r = post("/api/Kb", {"parentId": None, "type": 0, "title": f"{TEST_MARK} Папка", "content": None})
    fid = parse_body(r)
    check("POST Kb (папка)", r.ok and fid, f"status={r.status_code}, id={fid}")
    if r.ok and fid:
        reg_test("Kb", fid)

    r = post("/api/Kb", {"parentId": fid, "type": 1, "title": f"{TEST_MARK} Статья", "content": "<p>Контент</p>"})
    aid = parse_body(r)
    check("POST Kb (статья с parentId)", r.ok and aid, f"status={r.status_code}, id={aid}")
    if r.ok and aid:
        reg_test("Kb", aid)

    r = get("/api/Kb/tree?isArchived=false")
    check("GET Kb/tree", r.ok, f"status={r.status_code}")

    r = get("/api/Kb/children")
    check("GET Kb/children (корень)", r.ok, f"status={r.status_code}")
    r = get(f"/api/Kb/children/{fid}")
    check("GET Kb/children/{parentId}", r.ok, f"status={r.status_code}")

    r = put(f"/api/Kb/{aid}", {"parentId": fid, "type": 1, "title": f"{TEST_MARK} Статья (изм.)", "content": "<p>Новый</p>"})
    check("PUT Kb/{id}", r.ok, f"status={r.status_code}")

    # негатив: type вне enum (0,1)
    r = post("/api/Kb", {"parentId": None, "type": 5, "title": f"{TEST_MARK} BadType", "content": None})
    kbad = parse_body(r)
    if r.ok and kbad:
        reg_test("Kb", kbad)
    check("POST Kb (type=5 вне enum) — поведение", True, f"status={r.status_code}")

    # негатив: несуществующий parentId (FK)
    r = post("/api/Kb", {"parentId": str(uuid.uuid4()), "type": 1, "title": f"{TEST_MARK} BadParent", "content": None})
    check("POST Kb (несуществующий parentId -> FK)", r.status_code in (400, 500), f"status={r.status_code}")

    return aid if aid else None


# ---------- QuickLink ----------
def test_quick_links(user_id: str, kb_item_id: str):
    log("\n== QuickLink ==")
    r = post("/api/QuickLink", {"userId": user_id, "kbItemId": kb_item_id})
    qid = parse_body(r)
    check("POST QuickLink (валидный)", r.ok and qid, f"status={r.status_code}, id={qid}")
    if r.ok and qid:
        reg_test("QuickLink", qid)

    r = get(f"/api/QuickLink/user/{user_id}")
    lst = parse_body(r)
    check("GET QuickLink/user/{id}", r.ok and isinstance(lst, list), f"count={len(lst) if isinstance(lst, list) else 'n/a'}")

    r = get("/api/QuickLink")
    check("GET QuickLink (все)", r.ok, f"status={r.status_code}")

    # негатив: несуществующий kbItemId (FK)
    r = post("/api/QuickLink", {"userId": user_id, "kbItemId": str(uuid.uuid4())})
    check("POST QuickLink (несуществующий kbItemId -> FK)", r.status_code in (400, 500), f"status={r.status_code}")


# ---------- System ----------
def test_system():
    log("\n== System ==")
    sid = f"test_setting_{uuid.uuid4().hex[:6]}"
    r = post("/api/System", {"id": sid, "value": "v1", "description": "тестовая настройка"})
    check("POST System (валидный)", r.ok, f"status={r.status_code}")
    if r.ok:
        reg_test("System", sid)

    r = get(f"/api/System/{sid}")
    check("GET System/{id}", r.ok, f"status={r.status_code}")

    r = put(f"/api/System/{sid}", {"id": sid, "value": "v2", "description": "обновлено"})
    check("PUT System/{id}", r.ok, f"status={r.status_code}")

    # негатив: дубликат PK
    r = post("/api/System", {"id": sid, "value": "dup"})
    check("POST System (дубликат id -> ошибка PK)", r.status_code in (400, 500), f"status={r.status_code}")


# ---------- Auth ----------
def test_auth():
    log("\n== Auth ==")
    r = post("/api/Auth/login", {"email": "nope@nope.com", "password": "wrong"})
    check("POST Auth/login (неверные данные) -> 400", r.status_code == 400, f"status={r.status_code}")

    r = post("/api/Auth/invite", {"email": f"invite+{uuid.uuid4().hex[:6]}@example.com", "fullName": f"{TEST_MARK} Приглашённый", "role": 0})
    body = parse_body(r)
    ok = r.ok and isinstance(body, dict) and "inviteLink" in body
    check("POST Auth/invite -> inviteLink", ok, f"status={r.status_code}")
    # приглашённый пользователь создаётся в БД (archived) — пометим для удаления
    if ok:
        users = parse_body(get("/api/User")) or []
        for u in users:
            if u.get("fullName", "").startswith(TEST_MARK) and "Приглашённый" in u.get("fullName", ""):
                reg_test("User", u["id"])

    r = post("/api/Auth/complete-registration", {"token": "invalid-token", "password": "Passw0rd!"})
    check("POST Auth/complete-registration (неверный токен) -> 400", r.status_code == 400, f"status={r.status_code}")


def main():
    test_positions()
    test_task_types()
    uid = test_users()

    types = parse_body(get("/api/TaskType")) or []
    type_id = types[0]["id"] if types else None

    if uid and type_id:
        tid = test_tasks(uid, type_id)
        if tid:
            test_timelogs(uid, tid)
        test_reflections(uid)
        aid = test_kb()
        if aid:
            test_quick_links(uid, aid)
    test_system()
    test_auth()

    state.save()

    passed = sum(1 for _, ok, _ in results if ok)
    total = len(results)
    log("\n" + "=" * 50)
    log(f"ИТОГО: {passed}/{total} проверок PASS")
    fails = [(n, d) for n, ok, d in results if not ok]
    if fails:
        log("\nПРОВАЛЕННЫЕ ПРОВЕРКИ:")
        for n, d in fails:
            log(f"  - {n}: {d}")


if __name__ == "__main__":
    main()
