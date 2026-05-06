import { create } from 'zustand';

/**
 * Локальные дельты статистики «Прогресс», пока бэк не отражает завершение задачи в /completed-count.
 * После прироста числа с сервера дельта «поглощается», чтобы не было двойного учёта.
 */
interface ProgressStatsSessionState {
  completedMonthOptimistic: number;
  incrementCompletedMonthOptimistic: () => void;
  consumeCompletedMonthOptimistic: (newServerCount: number, prevServerCount: number) => void;
  resetCompletedMonthOptimistic: () => void;
}

export const useProgressStatsSessionStore = create<ProgressStatsSessionState>((set, get) => ({
  completedMonthOptimistic: 0,
  incrementCompletedMonthOptimistic: () =>
    set({ completedMonthOptimistic: get().completedMonthOptimistic + 1 }),
  consumeCompletedMonthOptimistic: (newServerCount, prevServerCount) => {
    const gained = Math.max(0, newServerCount - prevServerCount);
    if (gained === 0) return;
    set({
      completedMonthOptimistic: Math.max(0, get().completedMonthOptimistic - gained),
    });
  },
  resetCompletedMonthOptimistic: () => set({ completedMonthOptimistic: 0 }),
}));
