-- Справочник task_types: ровно 5 категорий (как TASK_TYPES на фронте).
-- Задачи на прочих типах перепривязываются к «Задачи», лишние типы удаляются.
-- Запуск:
--   docker compose cp qa/fix_task_types.sql db:/tmp/fix_types.sql
--   docker compose exec -T db psql -U postgres -d MoskvinDb -f /tmp/fix_types.sql
\set ON_ERROR_STOP on

BEGIN;

INSERT INTO task_types (name, color)
SELECT v.name, v.color
FROM (VALUES
  ('Задачи',     '#4F46E5'),
  ('Обсуждения', '#06B6D4'),
  ('Рутина',     '#84CC16'),
  ('Обучение',   '#F59E0B'),
  ('Прочее',     '#8B5CF6')
) AS v(name, color)
WHERE NOT EXISTS (SELECT 1 FROM task_types tt WHERE tt.name = v.name);

DO $$
DECLARE
  t_task int;
BEGIN
  SELECT id INTO t_task FROM task_types WHERE name = 'Задачи' ORDER BY id LIMIT 1;

  UPDATE tasks SET type_id = t_task
   WHERE type_id IN (
     SELECT id FROM task_types
     WHERE name NOT IN ('Задачи', 'Обсуждения', 'Рутина', 'Обучение', 'Прочее')
   );
END $$;

DELETE FROM task_types
 WHERE name NOT IN ('Задачи', 'Обсуждения', 'Рутина', 'Обучение', 'Прочее');

COMMIT;

SELECT tt.id, tt.name, count(t.id) AS tasks
FROM task_types tt
LEFT JOIN tasks t ON t.type_id = tt.id
GROUP BY tt.id, tt.name
ORDER BY tt.id;
