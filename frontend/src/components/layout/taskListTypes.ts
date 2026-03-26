export interface TaskListItem {
  id: string;
  name: string;
  progress: number;
  description: string;
  taskType: string;
}

/** Запись в архиве: полная задача + индекс в списке до удаления (для восстановления «на место»). */
export interface ArchivedTaskRecord {
  task: TaskListItem;
  originalIndex: number;
  daysLeft: number;
}
