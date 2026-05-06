import { TASK_TYPES } from '../constants';

/** Совмещает подписи из API с селекторами виджета заданий (как у TaskResponse.TypeName с бэка). */
export function apiTypeNameToTaskTypeLabel(typeName: string | null | undefined): string {
  if (!typeName) return TASK_TYPES[0];
  const t = typeName.trim();
  if (TASK_TYPES.includes(t)) return t;

  const lower = t.toLowerCase();

  const mapExact: Record<string, string> = {
    Разработка: 'Задачи',
    Задача: 'Задачи',
    Task: 'Задачи',
    Development: 'Задачи',
    Встреча: 'Обсуждения',
    Встречи: 'Обсуждения',
    Обсуждение: 'Обсуждения',
    Discussion: 'Обсуждения',
    Meeting: 'Обсуждения',
    Рутина: 'Рутина',
    Routine: 'Рутина',
    Обучение: 'Обучение',
    Education: 'Обучение',
    Прочее: 'Прочее',
    Other: 'Прочее',
  };
  if (mapExact[t]) return mapExact[t];
  if (lower === 'task' || lower === 'development') return 'Задачи';
  if (lower === 'discussion' || lower === 'meeting') return 'Обсуждения';
  if (lower === 'routine') return 'Рутина';
  if (lower === 'education') return 'Обучение';
  if (lower === 'other') return 'Прочее';

  return TASK_TYPES[0];
}
