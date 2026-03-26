/**
 * Моковые данные в форме, близкой к ответам будущего ASP.NET API (camelCase).
 * Числовые enum совпадают с Domain.Enums в backend.
 * Никуда не подключено — импортируйте отсюда, когда будете связывать UI с «сервером».
 */

// ─── Enum-значения (как в C# по умолчанию) ───────────────────────────────────

export const UserRoleEnum = {
  Employee: 0,
  Manager: 1,
  Admin: 2,
} as const;

export type UserRoleValue = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];

export const TaskProgressEnum = {
  NotStarted: 0,
  ResearchAndDrafting: 20,
  SkeletonReady: 40,
  Detailing: 60,
  TestingAndFixes: 70,
  ReviewAndFeedback: 90,
  Completed: 100,
} as const;

export type TaskProgressValue = (typeof TaskProgressEnum)[keyof typeof TaskProgressEnum];

export const ItemTypeEnum = {
  Folder: 0,
  Article: 1,
} as const;

export type ItemTypeValue = (typeof ItemTypeEnum)[keyof typeof ItemTypeEnum];

// ─── Сущности ───────────────────────────────────────────────────────────────

export interface MockPosition {
  id: number;
  title: string;
}

export interface MockTaskType {
  id: number;
  name: string;
  color: string;
}

export interface MockUser {
  id: string;
  email: string;
  fullName: string;
  photoUrl: string | null;
  role: UserRoleValue;
  positionId: number | null;
  isArchived: boolean;
  createdAt: string;
  deletedAt: string | null;
}

export interface MockTask {
  id: string;
  userId: string;
  typeId: number;
  title: string;
  description: string | null;
  currentProgress: TaskProgressValue;
  isArchived: boolean;
  createdAt: string;
  archivedAt: string;
}

export interface MockTimeLog {
  id: string;
  taskId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  progressSnapshot: number | null;
  comment: string | null;
  createdAt: string;
}

export interface MockKnowledgeBaseItem {
  id: string;
  parentId: string | null;
  type: ItemTypeValue;
  title: string;
  content: string | null;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface MockQuickLink {
  id: string;
  userId: string | null;
  kbItemId: string;
}

export interface MockDailyReflection {
  id: string;
  userId: string;
  date: string;
  stressLevel: number;
  valueLevel: number;
}

export interface MockSystemSetting {
  key: string;
  value: string | null;
  description: string | null;
}

// ─── Идентификаторы для связей (стабильные UUID) ────────────────────────────

const U = {
  user1: 'a1000000-0000-4000-8000-000000000001',
  user2: 'a1000000-0000-4000-8000-000000000002',
  task1: 'b2000000-0000-4000-8000-000000000001',
  task2: 'b2000000-0000-4000-8000-000000000002',
  task3: 'b2000000-0000-4000-8000-000000000003',
  taskArchived: 'b2000000-0000-4000-8000-000000000099',
  kbRoot: 'c3000000-0000-4000-8000-000000000001',
  kbArticle1: 'c3000000-0000-4000-8000-000000000002',
  kbArticle2: 'c3000000-0000-4000-8000-000000000003',
} as const;

// ─── Моки ───────────────────────────────────────────────────────────────────

export const mockPositions: MockPosition[] = [
  { id: 1, title: 'Стажёр-разработчик' },
  { id: 2, title: 'Младший разработчик' },
];

export const mockTaskTypes: MockTaskType[] = [
  { id: 1, name: 'Разработка', color: '#4F8AEB' },
  { id: 2, name: 'Обучение', color: '#6BCB77' },
  { id: 3, name: 'Рутина', color: '#9CA3AF' },
];

export const mockUsers: MockUser[] = [
  {
    id: U.user1,
    email: 'ivanov@example.com',
    fullName: 'Иванов Иван Иванович',
    photoUrl: null,
    role: UserRoleEnum.Employee,
    positionId: 1,
    isArchived: false,
    createdAt: '2025-01-15T09:00:00.000Z',
    deletedAt: null,
  },
  {
    id: U.user2,
    email: 'petrova@example.com',
    fullName: 'Петрова Мария Сергеевна',
    photoUrl: null,
    role: UserRoleEnum.Manager,
    positionId: 2,
    isArchived: false,
    createdAt: '2024-11-01T10:30:00.000Z',
    deletedAt: null,
  },
];

export const mockTasks: MockTask[] = [
  {
    id: U.task1,
    userId: U.user1,
    typeId: 1,
    title: 'Личный кабинет: экран прогресса',
    description: 'Верстка и состояния по макету',
    currentProgress: TaskProgressEnum.Detailing,
    isArchived: false,
    createdAt: '2025-03-01T08:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: U.task2,
    userId: U.user1,
    typeId: 2,
    title: 'Курс по TypeScript',
    description: null,
    currentProgress: TaskProgressEnum.ResearchAndDrafting,
    isArchived: false,
    createdAt: '2025-03-10T12:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: U.task3,
    userId: U.user1,
    typeId: 1,
    title: 'API: эндпоинты задач',
    description: 'Minimal API + репозиторий',
    currentProgress: TaskProgressEnum.SkeletonReady,
    isArchived: false,
    createdAt: '2025-03-18T15:20:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: U.taskArchived,
    userId: U.user1,
    typeId: 3,
    title: 'Онбординг: доступы',
    description: null,
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2025-02-01T09:00:00.000Z',
    archivedAt: '2025-02-28T17:00:00.000Z',
  },
];

export const mockTimeLogs: MockTimeLog[] = [
  {
    id: 'd4000000-0000-4000-8000-000000000001',
    taskId: U.task1,
    userId: U.user1,
    date: '2025-03-25',
    startTime: '10:00:00',
    endTime: '13:30:00',
    progressSnapshot: 60,
    comment: 'Верстка карточек',
    createdAt: '2025-03-25T13:30:00.000Z',
  },
  {
    id: 'd4000000-0000-4000-8000-000000000002',
    taskId: U.task1,
    userId: U.user1,
    date: '2025-03-24',
    startTime: '09:15:00',
    endTime: '11:00:00',
    progressSnapshot: 40,
    comment: null,
    createdAt: '2025-03-24T11:00:00.000Z',
  },
  {
    id: 'd4000000-0000-4000-8000-000000000003',
    taskId: U.task2,
    userId: U.user1,
    date: '2025-03-25',
    startTime: '14:00:00',
    endTime: '15:00:00',
    progressSnapshot: 20,
    comment: 'Модули и типы',
    createdAt: '2025-03-25T15:00:00.000Z',
  },
];

export const mockKnowledgeBaseItems: MockKnowledgeBaseItem[] = [
  {
    id: U.kbRoot,
    parentId: null,
    type: ItemTypeEnum.Folder,
    title: 'Онбординг',
    content: null,
    isArchived: false,
    archivedAt: null,
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: null,
  },
  {
    id: U.kbArticle1,
    parentId: U.kbRoot,
    type: ItemTypeEnum.Article,
    title: 'Первый день',
    content: 'Оформление пропуска, рабочее место, учётные записи.',
    isArchived: false,
    archivedAt: null,
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-02-01T12:00:00.000Z',
  },
  {
    id: U.kbArticle2,
    parentId: U.kbRoot,
    type: ItemTypeEnum.Article,
    title: 'Репозиторий и ветки',
    content: 'Git-flow, code review, CI.',
    isArchived: false,
    archivedAt: null,
    createdAt: '2025-01-12T00:00:00.000Z',
    updatedAt: null,
  },
];

export const mockQuickLinks: MockQuickLink[] = [
  { id: 'e5000000-0000-4000-8000-000000000001', userId: U.user1, kbItemId: U.kbArticle1 },
  { id: 'e5000000-0000-4000-8000-000000000002', userId: U.user1, kbItemId: U.kbArticle2 },
];

export const mockDailyReflections: MockDailyReflection[] = [
  {
    id: 'f6000000-0000-4000-8000-000000000001',
    userId: U.user1,
    date: '2025-03-24',
    stressLevel: 3,
    valueLevel: 4,
  },
  {
    id: 'f6000000-0000-4000-8000-000000000002',
    userId: U.user1,
    date: '2025-03-25',
    stressLevel: 2,
    valueLevel: 5,
  },
];

export const mockSystemSettings: MockSystemSetting[] = [
  { key: 'workday_end_hour', value: '19', description: 'Час окончания рабочего дня (отчётность)' },
  { key: 'feature_archive_tasks', value: 'true', description: 'Доступ к архиву задач' },
];

/** Сводный объект — удобно передавать в фабрики / тесты */
export const mockApiData = {
  positions: mockPositions,
  taskTypes: mockTaskTypes,
  users: mockUsers,
  tasks: mockTasks,
  timeLogs: mockTimeLogs,
  knowledgeBaseItems: mockKnowledgeBaseItems,
  quickLinks: mockQuickLinks,
  dailyReflections: mockDailyReflections,
  systemSettings: mockSystemSettings,
} as const;
