import { TASK_TYPES } from '../../constants';
import {
  ARCHIVE_RETENTION_DAYS,
  initialArchivedTaskRecords,
} from '../../mocks/archivedTasksInitial';
import type { ArchivedTaskRecord, TaskListItem } from './taskListTypes';

export interface TaskPanelTasksState {
  taskList: TaskListItem[];
  archivedList: ArchivedTaskRecord[];
}

export type TaskPanelTasksAction =
  | { type: 'SYNC_TASKS'; tasks: TaskListItem[] }
  | { type: 'DELETE_TO_ARCHIVE'; id: string }
  | { type: 'RESTORE_FROM_ARCHIVE'; id: string }
  | { type: 'ADD_TASK'; task: TaskListItem }
  | { type: 'UPDATE_TASK'; task: TaskListItem }
  | { type: 'UPDATE_ARCHIVED_TASK'; task: TaskListItem };

export function normalizeTaskListItem(t: TaskListItem): TaskListItem {
  return {
    ...t,
    description: t.description ?? '',
    taskType: t.taskType && TASK_TYPES.includes(t.taskType) ? t.taskType : TASK_TYPES[0],
  };
}

export function createInitialTaskPanelState(
  tasks: TaskListItem[],
  options?: { emptyArchive?: boolean },
): TaskPanelTasksState {
  const taskList = tasks.map(normalizeTaskListItem);
  return {
    taskList,
    archivedList: options?.emptyArchive
      ? []
      : initialArchivedTaskRecords(taskList.length),
  };
}

function archiveCompletedTaskEntry(
  state: TaskPanelTasksState,
  task: TaskListItem,
  originalIndex: number,
): TaskPanelTasksState {
  const normalized = normalizeTaskListItem(task);
  if (state.archivedList.some((a) => a.task.id === normalized.id)) return state;
  return {
    taskList: state.taskList.filter((t) => t.id !== normalized.id),
    archivedList: [
      { task: normalized, originalIndex, daysLeft: ARCHIVE_RETENTION_DAYS },
      ...state.archivedList,
    ],
  };
}

export function taskPanelTasksReducer(
  state: TaskPanelTasksState,
  action: TaskPanelTasksAction,
): TaskPanelTasksState {
  switch (action.type) {
    case 'SYNC_TASKS': {
      const archivedIds = new Set(state.archivedList.map((a) => a.task.id));
      const taskList = action.tasks
        .map(normalizeTaskListItem)
        .filter((t) => !archivedIds.has(t.id));
      return {
        ...state,
        taskList,
      };
    }

    case 'DELETE_TO_ARCHIVE': {
      const idx = state.taskList.findIndex((t) => t.id === action.id);
      if (idx === -1) return state;
      const task = state.taskList[idx];
      if (state.archivedList.some((a) => a.task.id === task.id)) return state;
      return {
        taskList: state.taskList.filter((t) => t.id !== action.id),
        archivedList: [
          { task, originalIndex: idx, daysLeft: ARCHIVE_RETENTION_DAYS },
          ...state.archivedList,
        ],
      };
    }

    case 'RESTORE_FROM_ARCHIVE': {
      const entry = state.archivedList.find((a) => a.task.id === action.id);
      if (!entry) return state;
      const nextList = [...state.taskList];
      const pos = Math.min(entry.originalIndex, nextList.length);
      nextList.splice(pos, 0, entry.task);
      return {
        taskList: nextList,
        archivedList: state.archivedList.filter((a) => a.task.id !== action.id),
      };
    }

    case 'ADD_TASK': {
      const next = normalizeTaskListItem(action.task);
      if (next.progress === 100) {
        return archiveCompletedTaskEntry(state, next, state.taskList.length);
      }
      return {
        ...state,
        taskList: [...state.taskList, next],
      };
    }

    case 'UPDATE_TASK': {
      const next = normalizeTaskListItem(action.task);
      if (next.progress !== 100) {
        return {
          ...state,
          taskList: state.taskList.map((t) => (t.id === next.id ? next : t)),
        };
      }
      const idx = state.taskList.findIndex((t) => t.id === next.id);
      if (idx === -1) return state;
      return archiveCompletedTaskEntry(state, next, idx);
    }

    case 'UPDATE_ARCHIVED_TASK': {
      const next = normalizeTaskListItem(action.task);
      const idx = state.archivedList.findIndex((a) => a.task.id === next.id);
      if (idx === -1) return state;
      const nextArchived = [...state.archivedList];
      nextArchived[idx] = { ...nextArchived[idx], task: next };
      return { ...state, archivedList: nextArchived };
    }
    default:
      return state;
  }
}
