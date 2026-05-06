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
  /** Как у UserResponse с бэка; в офлайне не используется. */
  passwordHash?: string | null;
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
  user3: 'a1000000-0000-4000-8000-000000000003',
  user4: 'a1000000-0000-4000-8000-000000000004',
  task1: 'b2000000-0000-4000-8000-000000000001',
  task2: 'b2000000-0000-4000-8000-000000000002',
  task3: 'b2000000-0000-4000-8000-000000000003',
  task4: 'b2000000-0000-4000-8000-000000000004',
  task5: 'b2000000-0000-4000-8000-000000000005',
  task6: 'b2000000-0000-4000-8000-000000000006',
  task7: 'b2000000-0000-4000-8000-000000000007',
  task8: 'b2000000-0000-4000-8000-000000000008',
  task9: 'b2000000-0000-4000-8000-000000000009',
  task10: 'b2000000-0000-4000-8000-00000000000a',
  task11: 'b2000000-0000-4000-8000-00000000000b',
  task12: 'b2000000-0000-4000-8000-00000000000c',
  demoArch1: 'b2000000-0000-4000-8000-000000000081',
  demoArch2: 'b2000000-0000-4000-8000-000000000082',
  demoArch3: 'b2000000-0000-4000-8000-000000000083',
  demoArch4: 'b2000000-0000-4000-8000-000000000084',
  demoArch5: 'b2000000-0000-4000-8000-000000000085',
  demoArch6: 'b2000000-0000-4000-8000-000000000086',
  demoArch7: 'b2000000-0000-4000-8000-000000000087',
  demoArch8: 'b2000000-0000-4000-8000-000000000088',
  taskArchived: 'b2000000-0000-4000-8000-000000000099',
  taskArchived2: 'b2000000-0000-4000-8000-000000000098',
  kbRoot: 'c3000000-0000-4000-8000-000000000001',
  kbArticle1: 'c3000000-0000-4000-8000-000000000002',
  kbArticle2: 'c3000000-0000-4000-8000-000000000003',
} as const;

/** Пользователи каталога сотрудников (моки): для демо-дат задач и таймлогов в progressDashboardMock. */
export const MOCK_CATALOG_USER_IDS = [U.user1, U.user2, U.user3, U.user4] as readonly string[];

// ─── Моки ───────────────────────────────────────────────────────────────────

export const mockPositions: MockPosition[] = [
  { id: 1, title: 'Middle Java-разработчик' },
  { id: 2, title: 'Тимлид разработки' },
];

/**
 * Имена типов — как в TaskType на бэке / TaskResponse.typeName (System.Text.Json, camelCase).
 * Совпадают с подписями виджета (`TASK_TYPES`) там, где это важно для графиков.
 */
export const mockTaskTypes: MockTaskType[] = [
  { id: 1, name: 'Задачи', color: '#4F8AEB' },
  { id: 2, name: 'Обсуждения', color: '#8B7FD8' },
  { id: 3, name: 'Рутина', color: '#9CA3AF' },
  { id: 4, name: 'Обучение', color: '#6BCB77' },
  { id: 5, name: 'Прочее', color: '#F59E0B' },
];

export const mockUsers: MockUser[] = [
  {
    id: U.user1,
    email: 'ivanov@example.com',
    fullName: 'Иванов Иван Иванович',
    photoUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=320&h=320&q=80',
    passwordHash: null,
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
    photoUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&h=320&q=80',
    passwordHash: null,
    role: UserRoleEnum.Manager,
    positionId: 2,
    isArchived: false,
    createdAt: '2024-11-01T10:30:00.000Z',
    deletedAt: null,
  },
  {
    id: U.user3,
    email: 'sidorov@example.com',
    fullName: 'Сидоров Алексей Павлович',
    photoUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&h=320&q=80',
    passwordHash: null,
    role: UserRoleEnum.Employee,
    positionId: 2,
    isArchived: false,
    createdAt: '2025-02-01T11:00:00.000Z',
    deletedAt: null,
  },
  {
    id: U.user4,
    email: 'smirnova@example.com',
    fullName: 'Смирнова Елена Дмитриевна',
    photoUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=320&h=320&q=80',
    passwordHash: null,
    role: UserRoleEnum.Admin,
    positionId: 1,
    isArchived: false,
    createdAt: '2024-06-15T08:20:00.000Z',
    deletedAt: null,
  },
];

/** Заготовки; для демо-пользователя даты пересчитывает `getDemoScopedMockTasks`. Порядок важен для рецептов архива. */
export const mockTasks: MockTask[] = [
  /* ——— активные ——— */
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
    typeId: 4,
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
    id: U.task4,
    userId: U.user1,
    typeId: 2,
    title: 'Синк с командой: дизайн-система',
    description: 'Вопросы по токенам и отступам',
    currentProgress: TaskProgressEnum.TestingAndFixes,
    isArchived: false,
    createdAt: '2025-03-19T10:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: U.task5,
    userId: U.user1,
    typeId: 5,
    title: 'Оформить отпуск в кадрах',
    description: 'Заявление до пятницы',
    currentProgress: TaskProgressEnum.ReviewAndFeedback,
    isArchived: false,
    createdAt: '2025-03-20T09:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: U.task6,
    userId: U.user1,
    typeId: 1,
    title: 'Виджет «Недельный баланс» на дашборде',
    description: null,
    currentProgress: TaskProgressEnum.ReviewAndFeedback,
    isArchived: false,
    createdAt: '2025-04-03T09:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: U.task7,
    userId: U.user1,
    typeId: 2,
    title: 'Интеграция уведомлений с почтой',
    description: null,
    currentProgress: TaskProgressEnum.TestingAndFixes,
    isArchived: false,
    createdAt: '2025-04-04T11:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: U.task8,
    userId: U.user1,
    typeId: 3,
    title: 'Правки после ревью линтера',
    description: null,
    currentProgress: TaskProgressEnum.Detailing,
    isArchived: false,
    createdAt: '2025-04-06T14:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: U.task9,
    userId: U.user1,
    typeId: 1,
    title: 'Документация API (OpenAPI)',
    description: null,
    currentProgress: TaskProgressEnum.SkeletonReady,
    isArchived: false,
    createdAt: '2025-04-08T08:30:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: U.task10,
    userId: U.user1,
    typeId: 4,
    title: 'Покрытие тестами сервиса отчётов',
    description: null,
    currentProgress: TaskProgressEnum.Detailing,
    isArchived: false,
    createdAt: '2025-04-11T10:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: U.task11,
    userId: U.user1,
    typeId: 5,
    title: 'Оптимизация запросов к графикам',
    description: null,
    currentProgress: TaskProgressEnum.ResearchAndDrafting,
    isArchived: false,
    createdAt: '2025-04-12T16:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: U.task12,
    userId: U.user1,
    typeId: 2,
    title: 'Подготовка сценария демонстрации продукта',
    description: null,
    currentProgress: TaskProgressEnum.TestingAndFixes,
    isArchived: false,
    createdAt: '2025-04-14T09:15:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  /* ——— завершённые (архив) — порядок совпадает с DEMO_ARCHIVED_RECIPES ——— */
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
  {
    id: U.taskArchived2,
    userId: U.user1,
    typeId: 2,
    title: 'Ретро спринта',
    description: null,
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2025-02-15T11:00:00.000Z',
    archivedAt: '2025-02-20T16:30:00.000Z',
  },
  {
    id: U.demoArch1,
    userId: U.user1,
    typeId: 1,
    title: 'Короткий цикл: задача 15→23 (пример длины спринта)',
    description: 'Один месяц, интервал 15–23 числа (пересчёт дат в getDemoScopedMockTasks)',
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2025-05-15T10:00:00.000Z',
    archivedAt: '2025-05-23T18:00:00.000Z',
  },
  {
    id: U.demoArch2,
    userId: U.user1,
    typeId: 4,
    title: 'Вычитка гайда по TypeScript',
    description: null,
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2025-06-02T09:00:00.000Z',
    archivedAt: '2025-06-11T12:00:00.000Z',
  },
  {
    id: U.demoArch3,
    userId: U.user1,
    typeId: 3,
    title: 'Настройка CI под ветку release',
    description: null,
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2025-07-20T11:00:00.000Z',
    archivedAt: '2025-07-28T16:00:00.000Z',
  },
  {
    id: U.demoArch4,
    userId: U.user1,
    typeId: 2,
    title: 'Аудит зависимостей и обновление пакетов',
    description: null,
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2025-08-05T08:00:00.000Z',
    archivedAt: '2025-10-25T15:30:00.000Z',
  },
  {
    id: U.demoArch5,
    userId: U.user1,
    typeId: 1,
    title: 'Миграция схемы БД: первый этап',
    description: null,
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2025-09-08T09:00:00.000Z',
    archivedAt: '2025-11-16T14:00:00.000Z',
  },
  {
    id: U.demoArch6,
    userId: U.user1,
    typeId: 5,
    title: 'Оформление релиз-нотов v0.3',
    description: null,
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2025-09-01T10:00:00.000Z',
    archivedAt: '2025-11-19T11:00:00.000Z',
  },
  {
    id: U.demoArch7,
    userId: U.user1,
    typeId: 3,
    title: 'Вводный курс по политике ИБ',
    description: null,
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2025-10-01T09:00:00.000Z',
    archivedAt: '2025-12-27T17:00:00.000Z',
  },
  {
    id: U.demoArch8,
    userId: U.user1,
    typeId: 2,
    title: 'Техдолг: вынос DTO в общую библиотеку',
    description: null,
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2025-11-12T09:00:00.000Z',
    archivedAt: '2026-01-03T12:00:00.000Z',
  },

  /* ——— user2 (просмотр статистики коллеги в моках каталога сотрудников) ——— */
  {
    id: 'b2000000-0000-4000-8000-000000000200',
    userId: U.user2,
    typeId: 1,
    title: 'Отчётность по проекту Alfa',
    description: 'Сводные таблицы за квартал',
    currentProgress: TaskProgressEnum.TestingAndFixes,
    isArchived: false,
    createdAt: '2026-03-01T09:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: 'b2000000-0000-4000-8000-000000000201',
    userId: U.user2,
    typeId: 3,
    title: 'Согласование отпусков команды',
    description: null,
    currentProgress: TaskProgressEnum.ReviewAndFeedback,
    isArchived: false,
    createdAt: '2026-03-05T14:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: 'b2000000-0000-4000-8000-000000000202',
    userId: U.user2,
    typeId: 4,
    title: 'Внутренний тренинг по Scrum',
    description: 'Подготовка кейсов',
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2026-02-10T10:00:00.000Z',
    archivedAt: '2026-03-02T16:00:00.000Z',
  },

  /* ——— user3 ——— */
  {
    id: 'b2000000-0000-4000-8000-000000000300',
    userId: U.user3,
    typeId: 1,
    title: 'Рефакторинг модуля авторизации',
    description: null,
    currentProgress: TaskProgressEnum.Detailing,
    isArchived: false,
    createdAt: '2026-02-12T09:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: 'b2000000-0000-4000-8000-000000000301',
    userId: U.user3,
    typeId: 2,
    title: 'Ретроспектива спринта 24',
    description: null,
    currentProgress: TaskProgressEnum.SkeletonReady,
    isArchived: false,
    createdAt: '2026-02-18T11:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: 'b2000000-0000-4000-8000-000000000302',
    userId: U.user3,
    typeId: 5,
    title: 'Настройка CI для ветки release',
    description: null,
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2026-01-08T10:00:00.000Z',
    archivedAt: '2026-02-01T17:00:00.000Z',
  },

  /* ——— user4 ——— */
  {
    id: 'b2000000-0000-4000-8000-000000000400',
    userId: U.user4,
    typeId: 3,
    title: 'Еженедельный отчёт по метрикам',
    description: null,
    currentProgress: TaskProgressEnum.ReviewAndFeedback,
    isArchived: false,
    createdAt: '2026-02-20T08:30:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: 'b2000000-0000-4000-8000-000000000401',
    userId: U.user4,
    typeId: 1,
    title: 'Аудит доступов в Bitbucket',
    description: null,
    currentProgress: TaskProgressEnum.TestingAndFixes,
    isArchived: false,
    createdAt: '2026-02-22T14:00:00.000Z',
    archivedAt: '0001-01-01T00:00:00.000Z',
  },
  {
    id: 'b2000000-0000-4000-8000-000000000402',
    userId: U.user4,
    typeId: 4,
    title: 'Курс по информационной безопасности',
    description: null,
    currentProgress: TaskProgressEnum.Completed,
    isArchived: true,
    createdAt: '2025-12-01T09:00:00.000Z',
    archivedAt: '2026-01-15T12:00:00.000Z',
  },
];

/**
 * Статические таймлоги не используются: актуальные данные — `getMockApiTimeLogsInRange` / `buildApiTimeLogsForMonth`
 * в `progressDashboardMock.ts` (даты привязаны к календарю).
 */
export const mockTimeLogs: MockTimeLog[] = [];

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
