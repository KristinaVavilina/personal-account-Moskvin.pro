-- Приводим справочник TaskType в БД к 5 категориям фронта и перепривязываем задачи.
-- Причина: фронт показывает фиксированные категории (Задачи/Обсуждения/Рутина/Обучение/Прочее),
-- а в БД были производственные типы (Моделирование, Анимация, ...), из-за чего выбор
-- любого типа кроме «Задачи» давал «Тип задания не найден на сервере».
-- ВАЖНО: FK tasks.type_id -> task_types(id) ON DELETE CASCADE,
--        поэтому СНАЧАЛА перепривязываем задачи, и только потом удаляем старые типы.
-- Запуск:
--   docker compose cp qa/fix_task_types.sql db:/tmp/fix_types.sql
--   docker compose exec -T db psql -U postgres -d MoskvinDb -f /tmp/fix_types.sql
\set ON_ERROR_STOP on

BEGIN;

-- 1. Создаём недостающие категорийные типы (идемпотентно).
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

-- 2. Перепривязываем задачи с производственных типов на категории.
DO $$
DECLARE
  t_task int;
  t_disc int;
  t_rout int;
  t_edu  int;
BEGIN
  SELECT id INTO t_task FROM task_types WHERE name = 'Задачи'     ORDER BY id LIMIT 1;
  SELECT id INTO t_disc FROM task_types WHERE name = 'Обсуждения' ORDER BY id LIMIT 1;
  SELECT id INTO t_rout FROM task_types WHERE name = 'Рутина'     ORDER BY id LIMIT 1;
  SELECT id INTO t_edu  FROM task_types WHERE name = 'Обучение'   ORDER BY id LIMIT 1;

  UPDATE tasks SET type_id = t_task
   WHERE type_id IN (SELECT id FROM task_types
                     WHERE name IN ('Моделирование', 'Текстурирование', 'Анимация', 'Композитинг'));

  UPDATE tasks SET type_id = t_rout
   WHERE type_id IN (SELECT id FROM task_types
                     WHERE name IN ('Рендеринг', 'Ретопология'));

  UPDATE tasks SET type_id = t_disc
   WHERE type_id IN (SELECT id FROM task_types WHERE name = 'Ревью');

  UPDATE tasks SET type_id = t_edu
   WHERE type_id IN (SELECT id FROM task_types WHERE name = 'Концепт-арт');
END $$;

-- 3. Удаляем старые производственные типы (задач на них уже нет).
DELETE FROM task_types
 WHERE name IN ('Моделирование', 'Текстурирование', 'Анимация', 'Рендеринг',
                'Композитинг', 'Ревью', 'Концепт-арт', 'Ретопология');

COMMIT;

-- Контроль
SELECT tt.id, tt.name, count(t.id) AS tasks
FROM task_types tt
LEFT JOIN tasks t ON t.type_id = tt.id
GROUP BY tt.id, tt.name
ORDER BY tt.id;
