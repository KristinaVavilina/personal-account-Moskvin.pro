import { TASK_TYPES } from '../constants';

/** Совмещает подписи из API с селекторами виджета заданий. */
export function apiTypeNameToTaskTypeLabel(typeName: string | null | undefined): string {
  if (!typeName) return TASK_TYPES[0];
  if (TASK_TYPES.includes(typeName)) return typeName;
  if (typeName === 'Разработка') return 'Задачи';
  if (typeName === 'Обучение') return 'Обучение';
  if (typeName === 'Рутина') return 'Рутина';
  return TASK_TYPES[0];
}
