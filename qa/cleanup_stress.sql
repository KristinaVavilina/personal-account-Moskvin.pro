-- Удаление нагрузочных (стресс) данных. Оставляем только осознанные демо-данные.
-- Запуск:
--   Get-Content -Raw qa/cleanup_stress.sql | docker compose exec -T db psql -U postgres -d MoskvinDb
\set ON_ERROR_STOP on

BEGIN;

-- 1. Стресс-задачи (массовое нагрузочное наполнение). Их тайм-логи удаляются каскадно
--    (FK time_logs.task_id ON DELETE CASCADE).
DELETE FROM tasks WHERE title LIKE 'Стресс-задача%';

-- 2. Ежедневные рефлексии.
--    daily_reflections не имеет created_at / уникального индекса / текстового маркера,
--    поэтому стрессовые рефлексии в окне последних ~45 дней неотличимы от осознанных
--    (обе создавались за период 2026-04-18..2026-06-01 со случайными уровнями).
--    Чтобы оставить ТОЛЬКО осознанные — пересоздаём осмысленный набор детерминированно:
--    последние ~45 дней, ~60% дней на сотрудника.
DELETE FROM daily_reflections;
INSERT INTO daily_reflections (id, user_id, date, stress_level, value_level)
SELECT
  gen_random_uuid(),
  u.id,
  d::date,
  1 + floor(random() * 10)::int,
  1 + floor(random() * 10)::int
FROM users u
CROSS JOIN generate_series(date '2026-04-18', date '2026-06-01', interval '1 day') d
WHERE random() < 0.6;

COMMIT;

-- Контрольная сводка
SELECT 'tasks' AS t, count(*) FROM tasks
UNION ALL SELECT 'time_logs', count(*) FROM time_logs
UNION ALL SELECT 'daily_reflections', count(*) FROM daily_reflections;
