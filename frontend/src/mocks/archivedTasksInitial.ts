import type { ArchivedTaskRecord } from '../components/layout/taskListTypes';
import { mockTasks } from './apiMockData';
import { taskListItemFromMockTask } from './taskListFromMockTask';

/** Период до автоудаления из архива (мок). */
export const ARCHIVE_RETENTION_DAYS = 30;

/** Сколько дней осталось до «автоудаления» из архива (демо по дате archivedAt). */
export function daysLeftFromArchivedAt(archivedAt: string): number {
  const arch = new Date(archivedAt);
  if (Number.isNaN(arch.getTime()) || arch.getUTCFullYear() < 1900) return ARCHIVE_RETENTION_DAYS;
  const deadline = new Date(arch);
  deadline.setDate(deadline.getDate() + ARCHIVE_RETENTION_DAYS);
  return Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86400000));
}

/**
 * Начальный архив из mockTasks (isArchived).
 * originalIndex = число активных моков — восстановление в конец списка (как «после всех текущих»).
 */
export function initialArchivedTaskRecords(activeMockCount: number): ArchivedTaskRecord[] {
  return mockTasks
    .filter((t) => t.isArchived)
    .map((t) => ({
      task: taskListItemFromMockTask(t),
      originalIndex: activeMockCount,
      daysLeft: daysLeftFromArchivedAt(t.archivedAt),
    }));
}
