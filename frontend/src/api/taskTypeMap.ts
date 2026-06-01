import { TASK_TYPES } from '../constants';

/** Имя типа с API должно совпадать с одной из пяти категорий виджета. */
export function apiTypeNameToTaskTypeLabel(typeName: string | null | undefined): string {
  if (!typeName) return TASK_TYPES[0];
  const t = typeName.trim();
  return (TASK_TYPES as readonly string[]).includes(t) ? t : TASK_TYPES[0];
}
