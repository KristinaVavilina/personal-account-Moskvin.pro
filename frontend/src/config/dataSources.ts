/**
 * Единая точка переключения источников данных по разделам приложения.
 *
 * `true` — моки (формат ответа API, camelCase) без сетевых вызовов.
 * `false` — реальные запросы к бэкенду через прокси `/api/*`.
 *
 * Замечания:
 * - Просмотр коллеги в разделе «Сотрудники» зависит от `USE_PROGRESS_MOCK`
 *   и отдельных GET по `userId`, а не от `USE_EMPLOYEES_MOCK`.
 * - В режиме `USE_PROGRESS_MOCK`/`USE_PROFILE_MOCK` идентификатор пользователя берётся
 *   из `getDevUserIdOverride()` либо из `PROGRESS_MOCK_DEFAULT_USER_ID` без вызова GET /api/User.
 */

/** Дашборд: рефлексии, таймлоги, задачи. */
export const USE_PROGRESS_MOCK = false;

/** Каталог сотрудников и метаданные пользователя. */
export const USE_EMPLOYEES_MOCK = false;

/** База знаний. */
export const USE_KNOWLEDGE_BASE_MOCK = false;

/** Страница «Профиль». */
export const USE_PROFILE_MOCK = false;

/** Совпадает с `mockUsers[0]` в apiMockData — для офлайн-моков без GET /api/User. */
export const PROGRESS_MOCK_DEFAULT_USER_ID = 'a1000000-0000-4000-8000-000000000001';
