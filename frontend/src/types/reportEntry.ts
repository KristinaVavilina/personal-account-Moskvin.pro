import type { ApiTimeLogRow } from './timeLogApi';

/** Локальная запись отчётности с снимком полей задачи на момент сохранения (для редактирования). */
export type StoredReportEntry = ApiTimeLogRow & {
  taskTitle?: string;
  taskTypeLabel?: string;
  taskDescriptionSnapshot?: string;
};
