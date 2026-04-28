import { create } from 'zustand';

export interface TodayChartOverride {
  year: number;
  monthIndex: number;
  day: number;
  benefit: number;
  workload: number;
}

interface BenefitWorkloadLocalState {
  todayOverride: TodayChartOverride | null;
  setTodayChartPoint: (p: TodayChartOverride) => void;
}

export const useBenefitWorkloadLocalStore = create<BenefitWorkloadLocalState>((set) => ({
  todayOverride: null,
  setTodayChartPoint: (p) => set({ todayOverride: p }),
}));
