/**
 * Переключение источника данных страницы «Профиль».
 * `true` — данные из моков (тот же вид, что `UserResponse`) без запросов к API.
 * `false` — загрузка с бэкенда: GET /api/User и выбор записи по id (как у `resolveDevUserId()`).
 *
 * В режиме мока идентификатор пользователя: `VITE_DEV_USER_ID` или дефолт из `progressSource.ts`
 * (`PROGRESS_MOCK_DEFAULT_USER_ID`), без вызова `GET /api/User` только для разрешения id.
 */
export const USE_PROFILE_MOCK = false;
