import { create } from 'zustand';
import type { ChartWorkloadCategory } from '../constants/charts';
import type { TaskListItem } from '../components/layout/taskListTypes';
import { createClientUuid } from '../utils/createClientUuid';
import {
  formatLocalDateIso,
  taskTypeLabelToChartCategory,
} from '../utils/progressDashboardTransform';

export interface DayTimelineCompletionRecord {
  id: string;
  dateIso: string;
  category: ChartWorkloadCategory;
}

interface DayTimelineCompletionsState {
  records: DayTimelineCompletionRecord[];
  recordCompletedTask: (task: TaskListItem, at?: Date) => void;
}

export const useDayTimelineCompletionsStore = create<DayTimelineCompletionsState>((set, get) => ({
  records: [],
  recordCompletedTask: (task, at = new Date()) => {
    const dateIso = formatLocalDateIso(at);
    const category = taskTypeLabelToChartCategory(task.taskType);
    set({
      records: [
        ...get().records,
        { id: createClientUuid(), dateIso, category },
      ],
    });
  },
}));
