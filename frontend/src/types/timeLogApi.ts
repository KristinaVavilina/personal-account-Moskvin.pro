/** Ответ API TimeLog (camelCase, System.Text.Json). */
export interface ApiTimeLogRow {
  id: string;
  taskId: string;
  userId: string;
  /** DateOnly, YYYY-MM-DD */
  date: string;
  startTime: string;
  endTime: string;
  progressSnapshot?: number | null;
  comment?: string | null;
}
