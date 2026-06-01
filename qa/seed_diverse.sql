-- Разнообразные демо-данные по сотрудникам: чтобы виджеты «Хронология дня»,
-- «Выполнено за месяц», «Баланс недели» и «График пользы и загруженности»
-- отличались у каждого сотрудника. Детерминированно (по порядку created_at).
--
-- Безопасно перезапускается: чистит свои прошлые демо-вставки и пересоздаёт.
-- Завершённые задачи создаются сразу архивными (правило системы: 100% -> архив).
SET client_encoding = 'UTF8';

DO $$
DECLARE
  rec        RECORD;
  i          INT := 0;
  k          INT;
  ntasks     INT;
  newid      uuid;
  ttype      INT;
  dur        INT;
  start_h    INT;
  type_pool  INT[];
  titles     TEXT[] := ARRAY[
    'Финальный рендер пакшота',
    'Ретопология high-poly модели',
    'Концепт ключевого кадра',
    'Сборка сцены и расстановка света',
    'Композитинг кадров с зелёным фоном',
    'Симуляция частиц (дым/огонь)',
    'Текстурирование ассета',
    'Моделирование персонажа',
    'Анимация облёта камеры',
    'Подготовка превью для клиента'
  ];
BEGIN
  -- 1) Удаляем прошлые демо-завершённые текущего месяца (каскадом уйдут их тайм-логи).
  DELETE FROM tasks WHERE description = 'Завершённая задача за текущий месяц (демо).';

  -- 2) Для каждого сотрудника — индивидуальный набор завершённых СЕГОДНЯ задач:
  --    разное количество, разный микс типов, разная длительность тайм-логов.
  FOR rec IN SELECT id FROM users ORDER BY created_at LOOP
    i := i + 1;
    ntasks := 3 + (i % 6);   -- 3..8 задач

    -- Пул типов задаёт пропорции категорий на «Хронологии дня» (10 Задачи,11 Прочее,12 Обсуждения,13 Рутина,14 Обучение).
    type_pool := CASE (i % 5)
      WHEN 0 THEN ARRAY[10,10,13,12,14,11,10,13]
      WHEN 1 THEN ARRAY[13,13,10,10,12,14,10,11]
      WHEN 2 THEN ARRAY[12,14,10,11,10,13,12,10]
      WHEN 3 THEN ARRAY[14,11,10,13,10,12,14,10]
      ELSE       ARRAY[10,12,11,13,14,10,12,11]
    END;

    FOR k IN 1..ntasks LOOP
      newid := gen_random_uuid();
      ttype := type_pool[1 + ((k - 1) % array_length(type_pool, 1))];
      dur := 1 + ((i + k) % 4);        -- 1..4 часа на задачу -> разный «Баланс недели»
      start_h := 8 + ((k - 1) % 7);    -- 8..14 час начала

      INSERT INTO tasks (id, user_id, type_id, title, description, current_progress, is_archived, created_at, archived_at)
      VALUES (
        newid, rec.id, ttype,
        titles[1 + ((k - 1) % array_length(titles, 1))],
        'Завершённая задача за текущий месяц (демо).',
        100, true, date_trunc('month', now()), now()
      );

      INSERT INTO time_logs (id, task_id, user_id, date, start_time, end_time, progress_snapshot, comment, created_at)
      VALUES (
        gen_random_uuid(), newid, rec.id, CURRENT_DATE,
        make_time(start_h, 0, 0), make_time(start_h + dur, 0, 0),
        100, 'Завершение задачи', now()
      );
    END LOOP;
  END LOOP;

  -- 3) Разнообразные рефлексии за ТЕКУЩИЙ месяц (по дням), у каждого своя кривая
  --    стресса/пользы (разные фаза и амплитуда) -> разный «График пользы и загруженности».
  DELETE FROM daily_reflections WHERE date >= date_trunc('month', now())::date;

  i := 0;
  FOR rec IN SELECT id FROM users ORDER BY created_at LOOP
    i := i + 1;
    INSERT INTO daily_reflections (id, user_id, date, stress_level, value_level)
    SELECT
      gen_random_uuid(),
      rec.id,
      d::date,
      GREATEST(1, LEAST(10, ROUND(5.5 + (2 + (i % 4)) * sin((EXTRACT(DAY FROM d) / 6.0) + i * 0.8))))::int,
      GREATEST(1, LEAST(10, ROUND(5.5 + (2 + ((i + 2) % 4)) * cos((EXTRACT(DAY FROM d) / 7.0) + i * 0.5))))::int
    FROM generate_series(
      date_trunc('month', now()),
      date_trunc('month', now()) + interval '27 days',
      interval '1 day'
    ) d;
  END LOOP;
END $$;

-- Контроль: должно быть разным у разных сотрудников.
SELECT u.full_name,
       COUNT(DISTINCT t.id) FILTER (WHERE tl.date = CURRENT_DATE AND tl.progress_snapshot = 100) AS done_today,
       ROUND(COALESCE(SUM(EXTRACT(EPOCH FROM (tl.end_time - tl.start_time)) / 3600)
             FILTER (WHERE tl.date >= date_trunc('week', CURRENT_DATE)), 0)) AS week_hours
FROM users u
LEFT JOIN tasks t ON t.user_id = u.id
LEFT JOIN time_logs tl ON tl.task_id = t.id
GROUP BY u.full_name, u.created_at
ORDER BY u.created_at;
