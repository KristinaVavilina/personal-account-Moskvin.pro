/**
 * Переключение источника данных раздела «Прогресс» (дашборд).
 * `true` — моки в форме ответов API (рефлексии, таймлоги, задачи) + те же функции преобразования, что и для сервера.
 * `false` — данные с бэкенда: DailyReflection, Task, TimeLog; дополнительно при монтировании (только в этом режиме) вызываются TaskType, System, User (read-only prefetch).
 *
 * При `USE_PROGRESS_MOCK` функция `resolveDevUserId()` не вызывает GET /api/User: используется
 * `VITE_DEV_USER_ID` или этот идентификатор (совпадает с `mockUsers[0]` в apiMockData).
 */
export const USE_PROGRESS_MOCK = false;

/** Совпадает с `mockUsers[0]` в apiMockData — для офлайн-моков без /api/User. */
export const PROGRESS_MOCK_DEFAULT_USER_ID = 'a1000000-0000-4000-8000-000000000001';
