-- Осознанные завершённые задачи (100%) с тайм-логами в ТЕКУЩЕМ месяце.
-- Нужны, чтобы виджет «выполнено за месяц» выглядел наполненным реальными демо-данными.
-- Запуск (надёжно для кириллицы — копируем файл в контейнер):
--   docker compose cp qa/seed_completed_current_month.sql db:/tmp/seed_done.sql
--   docker compose exec -T db psql -U postgres -d MoskvinDb -f /tmp/seed_done.sql
\set ON_ERROR_STOP on

DO $$
DECLARE
  tids int[];
  nt int;
  rec record;
  k int;
  newid uuid;
  titles text[] := ARRAY[
    'Финальный рендер пакшота',
    'Композитинг кадров с зелёным экраном',
    'Ретопология high-poly модели',
    'Сборка сцены и расстановка света'
  ];
BEGIN
  SELECT array_agg(id ORDER BY id) INTO tids FROM task_types;
  nt := array_length(tids, 1);

  FOR rec IN SELECT id FROM users LOOP
    FOR k IN 1..4 LOOP
      newid := gen_random_uuid();
      INSERT INTO tasks (id, user_id, type_id, title, description, current_progress, is_archived, created_at, archived_at)
      VALUES (
        newid,
        rec.id,
        tids[1 + ((k - 1) % nt)],
        titles[1 + ((k - 1) % array_length(titles, 1))],
        'Завершённая задача за текущий месяц (демо).',
        100,
        true,
        date_trunc('month', now()),
        now()
      );
      INSERT INTO time_logs (id, task_id, user_id, date, start_time, end_time, progress_snapshot, comment, created_at)
      VALUES (
        gen_random_uuid(),
        newid,
        rec.id,
        date_trunc('month', now())::date,
        time '09:00',
        time '17:00',
        100,
        'Финальная рабочая сессия',
        now()
      );
    END LOOP;
  END LOOP;
END $$;

SELECT 'tasks' AS t, count(*) FROM tasks
UNION ALL SELECT 'time_logs', count(*) FROM time_logs
UNION ALL SELECT 'tasks_done_this_month', count(*) FROM tasks
  WHERE current_progress = 100 AND created_at >= date_trunc('month', now());
