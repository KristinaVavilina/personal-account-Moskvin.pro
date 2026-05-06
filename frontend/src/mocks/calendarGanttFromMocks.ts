/**
 * Совместимость: моковые задачи → строки календаря и Ганта.
 */
import { mockTaskTypes, type MockTask } from './apiMockData';
import {
  buildGanttTasksFromCalendarRows,
  type CalendarTaskRow,
} from '../utils/calendarGantt';

export type { CalendarTaskRow } from '../utils/calendarGantt';

function mockTaskToCalendarRow(t: MockTask): CalendarTaskRow {
  return {
    id: t.id,
    typeName: mockTaskTypes.find((tt) => tt.id === t.typeId)?.name ?? null,
    title: t.title,
    currentProgress: t.currentProgress,
    isArchivedComplete: t.isArchived,
    createdAt: t.createdAt,
    archivedAt: t.archivedAt,
  };
}

export function buildGanttTasksFromMocks(
  tasks: MockTask[],
  year: number,
  monthIndex: number,
  now: Date = new Date(),
) {
  return buildGanttTasksFromCalendarRows(
    tasks.map(mockTaskToCalendarRow),
    year,
    monthIndex,
    now,
  );
}
