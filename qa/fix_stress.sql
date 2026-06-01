-- Исправление нагрузочных данных: равномерное распределение по сотрудникам
-- (прошлый засев из-за некоррелированного LATERAL отдал все задачи одному юзеру)
-- и добавление завершённых задач с тайм-логами в текущем месяце.

\set ON_ERROR_STOP on

-- 1) Удаляем прежние кривые стресс-задачи (каскад убирает их тайм-логи)
DELETE FROM tasks WHERE title LIKE 'Стресс-задача%';

-- 2) Равномерное распределение (round-robin по номеру строки)
DO $$
DECLARE
  uids uuid[];
  tids int[];
  nu int;
  nt int;
BEGIN
  SELECT array_agg(id ORDER BY created_at) INTO uids FROM users;
  SELECT array_agg(id ORDER BY id) INTO tids FROM task_types;
  nu := array_length(uids, 1);
  nt := array_length(tids, 1);

  -- 8000 задач, равномерно по сотрудникам и типам, даты 2024-01 .. сейчас
  INSERT INTO tasks (id, user_id, type_id, title, description, current_progress, is_archived, created_at, archived_at)
  SELECT
    gen_random_uuid(),
    uids[1 + (g % nu)],
    tids[1 + (g % nt)],
    'Стресс-задача №' || g,
    'Массовое нагрузочное заполнение системы',
    (ARRAY[0,20,40,60,70,90,100])[1 + floor(random()*7)::int],
    (random() < 0.4),
    d.ts,
    CASE WHEN random() < 0.4 THEN d.ts + (random()*30 || ' days')::interval
         ELSE timestamptz '0001-01-01 00:00:00+00' END
  FROM generate_series(1, 8000) g
  CROSS JOIN LATERAL (
    SELECT (timestamptz '2024-01-01' + random()*(now() - timestamptz '2024-01-01')) AS ts
  ) d;

  -- ~3 тайм-лога на каждую стресс-задачу (даты рядом с созданием задачи)
  INSERT INTO time_logs (id, task_id, user_id, date, start_time, end_time, progress_snapshot, comment, created_at)
  SELECT
    gen_random_uuid(),
    t.id,
    t.user_id,
    (t.created_at + (floor(random()*20) || ' days')::interval)::date,
    make_time(8 + floor(random()*6)::int, (ARRAY[0,15,30,45])[1+floor(random()*4)::int], 0),
    make_time(14 + floor(random()*6)::int, (ARRAY[0,15,30,45])[1+floor(random()*4)::int], 0),
    t.current_progress,
    'Нагрузочный тайм-лог',
    now()
  FROM tasks t, generate_series(1, 3) s
  WHERE t.title LIKE 'Стресс-задача%';

  -- 3) У КАЖДОГО сотрудника — завершённые задачи с тайм-логами в ТЕКУЩЕМ месяце,
  --    чтобы виджет «выполнено за месяц» показывал осмысленные значения.
  INSERT INTO tasks (id, user_id, type_id, title, description, current_progress, is_archived, created_at, archived_at)
  SELECT
    gen_random_uuid(),
    u,
    tids[1 + (k % nt)],
    'Стресс-задача (тек. месяц) ' || u || '-' || k,
    'Завершено в текущем месяце',
    100,
    true,
    date_trunc('month', now()) + ((k % 25) || ' days')::interval,
    date_trunc('month', now()) + ((k % 25) || ' days')::interval + interval '2 days'
  FROM unnest(uids) u, generate_series(1, 12) k;

  -- тайм-логи для этих задач — внутри текущего месяца
  INSERT INTO time_logs (id, task_id, user_id, date, start_time, end_time, progress_snapshot, comment, created_at)
  SELECT
    gen_random_uuid(),
    t.id,
    t.user_id,
    t.created_at::date,
    make_time(9 + floor(random()*4)::int, 0, 0),
    make_time(15 + floor(random()*4)::int, 0, 0),
    100,
    'Завершение задачи',
    now()
  FROM tasks t
  WHERE t.title LIKE 'Стресс-задача (тек. месяц)%';
END $$;

-- Контроль распределения
SELECT u.full_name, count(t.id) AS tasks,
       count(t.id) FILTER (WHERE t.current_progress = 100) AS completed
FROM users u LEFT JOIN tasks t ON t.user_id = u.id
GROUP BY u.full_name ORDER BY 2 DESC;
