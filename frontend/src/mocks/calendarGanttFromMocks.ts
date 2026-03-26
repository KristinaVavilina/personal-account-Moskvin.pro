import type { GanttTask, TaskCategory } from '../constants';
import { getDaysInMonth } from '../utils';
import { mockTaskTypes, mockTasks, type MockTask } from './apiMockData';

/**
 * Гант строится из тех же mockTasks, что попадают в task-widget (TaskPanel: не в архиве).
 * День начала — число из createdAt (в выбранном месяце обрезается по длине месяца);
 * конец — день archivedAt, если он в этом же месяце/годе, иначе демо-окно ~10 дней.
 */

function parseArchivedAt(archivedAt: string): Date | null {
  const d = new Date(archivedAt);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getUTCFullYear() < 1900) return null;
  return d;
}

function typeIdToCategory(typeId: number): TaskCategory {
  const name = mockTaskTypes.find((tt) => tt.id === typeId)?.name ?? '';
  if (name === 'Разработка') return 'task';
  if (name === 'Обучение') return 'education';
  if (name === 'Рутина') return 'routine';
  return 'other';
}

function toGanttTask(t: MockTask, year: number, monthIndex: number, totalDays: number): GanttTask {
  const created = new Date(t.createdAt);
  let start = Math.min(Math.max(1, created.getDate()), totalDays);

  const arch = parseArchivedAt(t.archivedAt);
  let end: number;
  if (arch && arch.getFullYear() === year && arch.getMonth() === monthIndex) {
    end = Math.max(start, Math.min(totalDays, arch.getDate()));
  } else {
    end = Math.min(totalDays, start + 9);
  }
  if (end < start) end = start;

  return {
    id: t.id,
    name: t.title,
    category: typeIdToCategory(t.typeId),
    start,
    end,
    progress: t.currentProgress,
  };
}

export function buildGanttTasksFromMocks(year: number, monthIndex: number): GanttTask[] {
  const totalDays = getDaysInMonth(monthIndex, year);
  return mockTasks.filter((t) => !t.isArchived).map((t) => toGanttTask(t, year, monthIndex, totalDays));
}
