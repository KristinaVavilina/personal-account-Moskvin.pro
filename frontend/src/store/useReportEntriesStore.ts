import { create } from 'zustand';
import type { StoredReportEntry } from '../types/reportEntry';

interface ReportEntriesState {
  entries: StoredReportEntry[];
  addEntry: (row: StoredReportEntry) => void;
  updateEntry: (id: string, patch: Partial<StoredReportEntry>) => void;
}

/**
 * Локально сохранённые записи отчётности (таймлоги), пока нет POST на бэк.
 * Показываются на вкладке «Отчёт» вместе с ответом GET /api/TimeLog/... .
 */
export const useReportEntriesStore = create<ReportEntriesState>((set) => ({
  entries: [],
  addEntry: (row) =>
    set((s) => ({
      entries: [...s.entries, row],
    })),
  updateEntry: (id, patch) =>
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),
}));
