-- Нагрузочное наполнение валидными данными для существующих сотрудников.
-- Это данные «на прочность» — корректные FK, оставляем после тестов.
-- Идентифицируются по префиксу 'Стресс-задача' в названии при необходимости.

\set ON_ERROR_STOP on

-- Равномерное распределение по сотрудникам (round-robin), даты 2024-01 .. сейчас.
-- ВАЖНО: некоррелированный LATERAL (... ORDER BY random() LIMIT 1) отдал бы ВСЕ
-- задачи одному пользователю — поэтому используем round-robin через массивы.
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

  -- ~3 тайм-лога на каждую стресс-задачу
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

  -- У каждого сотрудника — завершённые задачи с тайм-логами в текущем месяце
  INSERT INTO tasks (id, user_id, type_id, title, description, current_progress, is_archived, created_at, archived_at)
  SELECT gen_random_uuid(), u, tids[1 + (k % nt)],
         'Стресс-задача (тек. месяц) ' || u || '-' || k, 'Завершено в текущем месяце',
         100, true,
         date_trunc('month', now()) + ((k % 25) || ' days')::interval,
         date_trunc('month', now()) + ((k % 25) || ' days')::interval + interval '2 days'
  FROM unnest(uids) u, generate_series(1, 12) k;

  INSERT INTO time_logs (id, task_id, user_id, date, start_time, end_time, progress_snapshot, comment, created_at)
  SELECT gen_random_uuid(), t.id, t.user_id, t.created_at::date,
         make_time(9 + floor(random()*4)::int, 0, 0), make_time(15 + floor(random()*4)::int, 0, 0),
         100, 'Завершение задачи', now()
  FROM tasks t WHERE t.title LIKE 'Стресс-задача (тек. месяц)%';
END $$;

-- Рефлексии за 3 года для всех сотрудников (≈40% дней)
INSERT INTO daily_reflections (id, user_id, date, stress_level, value_level)
SELECT
  gen_random_uuid(),
  u.id,
  d::date,
  1 + floor(random()*10)::int,
  1 + floor(random()*10)::int
FROM users u
CROSS JOIN generate_series(timestamptz '2023-06-01', timestamptz '2026-06-01', interval '1 day') d
WHERE random() < 0.4;

SELECT 'tasks' AS t, count(*) FROM tasks
UNION ALL SELECT 'time_logs', count(*) FROM time_logs
UNION ALL SELECT 'daily_reflections', count(*) FROM daily_reflections;
