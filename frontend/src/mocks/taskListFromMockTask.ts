import { TASK_TYPES } from '../constants';
import type { TaskListItem } from '../components/layout/taskListTypes';
import { mockTasks, mockTaskTypes, type MockTask } from './apiMockData';

export function mockTypeNameToTaskTypeLabel(typeName: string): string {
  if (typeName === 'Разработка') return 'Задачи';
  if (typeName === 'Обучение') return 'Обучение';
  if (typeName === 'Рутина') return 'Рутина';
  return TASK_TYPES[0];
}

export function taskListItemFromMockTask(t: MockTask): TaskListItem {
  const typeRow = mockTaskTypes.find((tt) => tt.id === t.typeId);
  return {
    id: t.id,
    name: t.title,
    progress: t.currentProgress,
    description: t.description ?? '',
    taskType: typeRow ? mockTypeNameToTaskTypeLabel(typeRow.name) : TASK_TYPES[0],
  };
}

export function getActiveTaskListFromMocks(): TaskListItem[] {
  return mockTasks.filter((t) => !t.isArchived).map(taskListItemFromMockTask);
}
