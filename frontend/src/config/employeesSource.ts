/**
 * Переключение источника данных каталога сотрудников и экрана сотрудника (метаданные из GET /api/User).
 * `true` — моки в форме ответа API (`UserResponse`, camelCase).
 * `false` — данные с бэкенда: те же поля списка пользователей.
 *
 * Примечание: задачи и таймлоги коллеги при просмотре зависят от `progressSource.ts` (`USE_PROGRESS_MOCK`)
 * и отдельных GET по `userId` (`/api/Task/user/…`, `/api/TimeLog/user/…`), а не от этого флага.
 */
export const USE_EMPLOYEES_MOCK = false;
