"""Наполнение БД РЕАЛИСТИЧНЫМИ (полезными) данными через публичный API backend.

Эти данные НЕ помечаются [TEST] и НЕ удаляются после тестов.
Создаёт: должности, типы задач, сотрудников (с полным профилем),
задачи, тайм-логи, ежедневные рефлексии, базу знаний, быстрые ссылки, системные настройки.
"""
from __future__ import annotations

import random
from datetime import date, timedelta

from common import State, get, post, put, parse_body, log

random.seed(42)

TASK_PROGRESS = [0, 20, 40, 60, 70, 90, 100]


def seed_positions(state: State) -> list[int]:
    titles = [
        "3D-художник",
        "Senior 3D-художник",
        "Моушн-дизайнер",
        "Композитор (Compositing)",
        "VFX-специалист",
        "Арт-директор",
        "Технический директор",
        "Проджект-менеджер",
    ]
    ids: list[int] = []
    for t in titles:
        res = post("/api/Position", {"title": t})
        pid = parse_body(res)
        if res.ok:
            ids.append(int(pid))
            state.add("useful", "Position", int(pid))
            log(f"  + Position #{pid}: {t}")
        else:
            log(f"  ! Position '{t}' -> {res.status_code}: {res.text[:120]}")
    return ids


def seed_task_types(state: State) -> list[int]:
    # Ровно 5 категорий — как на фронте (TASK_TYPES) и в fix_task_types.sql
    types = [
        ("Задачи", "#4F46E5"),
        ("Обсуждения", "#06B6D4"),
        ("Рутина", "#84CC16"),
        ("Обучение", "#F59E0B"),
        ("Прочее", "#8B5CF6"),
    ]
    ids: list[int] = []
    for name, color in types:
        res = post("/api/TaskType", {"name": name, "color": color})
        tid = parse_body(res)
        if res.ok:
            ids.append(int(tid))
            state.add("useful", "TaskType", int(tid))
            log(f"  + TaskType #{tid}: {name} {color}")
        else:
            log(f"  ! TaskType '{name}' -> {res.status_code}: {res.text[:120]}")
    return ids


# роли: 0=Employee, 1=Manager, 2=Admin
USEFUL_EMPLOYEES = [
    ("Москвин Артём Сергеевич", "a.moskvin@moskvin.pro", 2, 6),   # Арт-директор / Admin
    ("Иванова Екатерина Павловна", "e.ivanova@moskvin.pro", 1, 7),  # Тех.директор / Manager
    ("Соколов Дмитрий Андреевич", "d.sokolov@moskvin.pro", 0, 1),   # 3D-художник
    ("Кузнецова Анна Игоревна", "a.kuznetsova@moskvin.pro", 0, 2),  # Senior 3D
    ("Петров Михаил Олегович", "m.petrov@moskvin.pro", 0, 3),       # Моушн
    ("Волкова Ольга Дмитриевна", "o.volkova@moskvin.pro", 0, 5),    # VFX
    ("Новиков Сергей Викторович", "s.novikov@moskvin.pro", 1, 8),   # PM / Manager
]


def update_garbage_user(state: State, position_ids: list[int]) -> str | None:
    """Существующий мусорный пользователь (email='string') превращается в полезного админа.

    Он первый в /api/User, поэтому фронт берёт его как dev-пользователя — наполним данными.
    """
    res = get("/api/User")
    users = parse_body(res) or []
    garbage = next((u for u in users if u.get("email") == "string" or u.get("fullName") == "string"), None)
    if not garbage:
        return None
    uid = garbage["id"]
    body = {
        "email": "admin@moskvin.pro",
        "fullName": "Москвин Владимир Николаевич",
        "photoUrl": "https://i.pravatar.cc/150?img=12",
        "role": 2,
        "positionId": position_ids[5] if len(position_ids) > 5 else None,
    }
    r = put(f"/api/User/{uid}", body)
    if r.ok:
        log(f"  ~ Обновлён dev-пользователь {uid} -> {body['fullName']}")
        state.add("useful", "User", uid)
        return uid
    log(f"  ! Не удалось обновить мусорного пользователя: {r.status_code} {r.text[:120]}")
    return None


def seed_users(state: State, position_ids: list[int]) -> list[str]:
    ids: list[str] = []
    for full_name, email, role, pos_idx in USEFUL_EMPLOYEES:
        position_id = position_ids[pos_idx - 1] if 0 < pos_idx <= len(position_ids) else None
        body = {
            "email": email,
            "fullName": full_name,
            "photoUrl": f"https://i.pravatar.cc/150?u={email}",
            "role": role,
            "positionId": position_id,
        }
        res = post("/api/User", body)
        uid = parse_body(res)
        if res.ok and uid:
            ids.append(uid)
            state.add("useful", "User", uid)
            log(f"  + User {uid}: {full_name} (role={role}, pos={position_id})")
        else:
            log(f"  ! User '{full_name}' -> {res.status_code}: {res.text[:160]}")
    return ids


def seed_tasks_and_logs(state: State, user_ids: list[str], type_ids: list[int]) -> None:
    titles = [
        "Моделирование персонажа для рекламного ролика",
        "Текстурирование окружения сцены ангара",
        "Анимация облёта камеры по продукту",
        "Финальный рендер пакшота",
        "Композитинг кадров с зелёным экраном",
        "Концепт ключевого кадра",
        "Ретопология high-poly модели",
        "Сборка сцены и расстановка света",
        "Симуляция частиц (дым/огонь)",
        "Подготовка превью для клиента",
    ]
    today = date(2026, 6, 1)
    for uid in user_ids:
        n_tasks = random.randint(4, 8)
        for _ in range(n_tasks):
            type_id = random.choice(type_ids)
            progress = random.choice(TASK_PROGRESS)
            title = random.choice(titles)
            body = {
                "userId": uid,
                "typeId": str(type_id),
                "title": title,
                "description": f"Задача по проекту. Тип #{type_id}. Автогенерация для демо.",
                "currentProgress": progress,
            }
            res = post("/api/Task", body)
            tid = parse_body(res)
            if not res.ok or not tid:
                log(f"  ! Task '{title}' для {uid} -> {res.status_code}: {res.text[:140]}")
                continue
            state.add("useful", "Task", tid)
            # тайм-логи на задачу (несколько дней)
            n_logs = random.randint(1, 5)
            for _ in range(n_logs):
                d = today - timedelta(days=random.randint(0, 50))
                start_h = random.randint(8, 17)
                dur = random.randint(1, 3)
                end_h = min(start_h + dur, 20)
                log_body = {
                    "taskId": tid,
                    "userId": uid,
                    "date": d.isoformat(),
                    "startTime": f"{start_h:02d}:00:00",
                    "endTime": f"{end_h:02d}:00:00",
                    "progressSnapshot": progress,
                    "comment": "Рабочая сессия",
                }
                lr = post("/api/TimeLog", log_body)
                lid = parse_body(lr)
                if lr.ok and lid:
                    state.add("useful", "TimeLog", lid)
                else:
                    log(f"  ! TimeLog -> {lr.status_code}: {lr.text[:120]}")


def seed_reflections(state: State, user_ids: list[str]) -> None:
    today = date(2026, 6, 1)
    for uid in user_ids:
        for day_offset in range(0, 45):
            if random.random() < 0.4:  # не каждый день
                continue
            d = today - timedelta(days=day_offset)
            body = {
                "userId": uid,
                "date": d.isoformat(),
                "stressLevel": random.randint(1, 10),
                "valueLevel": random.randint(1, 10),
            }
            res = post("/api/DailyReflection", body)
            rid = parse_body(res)
            if res.ok and rid:
                state.add("useful", "DailyReflection", rid)
            else:
                log(f"  ! Reflection {uid} {d} -> {res.status_code}: {res.text[:120]}")


def seed_knowledge_base(state: State) -> list[str]:
    """Дерево БЗ: папки + статьи. Возвращает id статей (для быстрых ссылок)."""
    article_ids: list[str] = []
    folders = [
        ("Регламенты студии", [
            ("Пайплайн производства", "Описание этапов: препродакшн, моделирование, текстуринг, рендер, композ."),
            ("Требования к именованию файлов", "scene_v01.blend, char_hero_lowpoly.fbx и т.д."),
        ]),
        ("Технические гайды", [
            ("Настройка рендер-фермы", "Как отправлять задачи на рендер, приоритеты, лимиты."),
            ("Оптимизация сцен", "Инстансы, LOD, decimation, запекание карт."),
            ("Цветовой пайплайн ACES", "Работа в линейном пространстве, OCIO-конфиг."),
        ]),
        ("Онбординг", [
            ("Чеклист нового сотрудника", "Доступы, ПО, знакомство с командой."),
            ("Полезные горячие клавиши", "Blender / Houdini / Nuke."),
        ]),
    ]
    for folder_title, articles in folders:
        fr = post("/api/Kb", {"parentId": None, "type": 0, "title": folder_title, "content": None})
        fid = parse_body(fr)
        if not fr.ok or not fid:
            log(f"  ! KB folder '{folder_title}' -> {fr.status_code}: {fr.text[:120]}")
            continue
        state.add("useful", "Kb", fid)
        log(f"  + KB folder {fid}: {folder_title}")
        for art_title, content in articles:
            ar = post("/api/Kb", {"parentId": fid, "type": 1, "title": art_title, "content": content})
            aid = parse_body(ar)
            if ar.ok and aid:
                state.add("useful", "Kb", aid)
                article_ids.append(aid)
            else:
                log(f"  ! KB article '{art_title}' -> {ar.status_code}: {ar.text[:120]}")
    return article_ids


def seed_quick_links(state: State, user_ids: list[str], article_ids: list[str]) -> None:
    if not article_ids:
        return
    for uid in user_ids[:4]:
        for aid in random.sample(article_ids, k=min(3, len(article_ids))):
            res = post("/api/QuickLink", {"userId": uid, "kbItemId": aid})
            qid = parse_body(res)
            if res.ok and qid:
                state.add("useful", "QuickLink", qid)
            else:
                log(f"  ! QuickLink {uid}->{aid}: {res.status_code} {res.text[:120]}")


def seed_system_settings(state: State) -> None:
    settings = [
        ("work_day_hours", "8", "Длительность рабочего дня в часах"),
        ("week_start", "monday", "День начала недели"),
        ("company_name", "Moskvin.pro", "Название компании"),
        ("timezone", "Europe/Moscow", "Часовой пояс по умолчанию"),
    ]
    for sid, value, desc in settings:
        res = post("/api/System", {"id": sid, "value": value, "description": desc})
        if res.ok:
            state.add("useful", "System", sid)
            log(f"  + System '{sid}' = {value}")
        else:
            log(f"  ! System '{sid}' -> {res.status_code}: {res.text[:120]}")


def main() -> None:
    state = State.load()
    log("== Должности ==")
    position_ids = seed_positions(state)
    log("== Типы задач ==")
    type_ids = seed_task_types(state)
    log("== Сотрудники ==")
    dev_uid = update_garbage_user(state, position_ids)
    user_ids = seed_users(state, position_ids)
    all_users = ([dev_uid] if dev_uid else []) + user_ids
    state.save()
    log("== Задачи и тайм-логи ==")
    if type_ids:
        seed_tasks_and_logs(state, all_users, type_ids)
    log("== Ежедневные рефлексии ==")
    seed_reflections(state, all_users)
    log("== База знаний ==")
    article_ids = seed_knowledge_base(state)
    log("== Быстрые ссылки ==")
    seed_quick_links(state, all_users, article_ids)
    log("== Системные настройки ==")
    seed_system_settings(state)
    state.save()
    log("\nГотово. Сводка полезных данных:")
    for k, v in state.useful.items():
        log(f"  {k}: {len(v)}")


if __name__ == "__main__":
    main()
