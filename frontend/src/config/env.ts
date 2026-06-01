import {
  USE_EMPLOYEES_MOCK,
  USE_KNOWLEDGE_BASE_MOCK,
  USE_PROFILE_MOCK,
  USE_PROGRESS_MOCK,
} from './dataSources';

/** Production-сборка (`vite build`). */
export const isProduction = import.meta.env.PROD;

/**
 * Подмена userId из `.env.local` — только в dev.
 * В production всегда `null`, даже если переменная ошибочно попала в образ.
 */
export function getDevUserIdOverride(): string | null {
  if (isProduction) return null;
  const id = import.meta.env.VITE_DEV_USER_ID?.trim();
  return id || null;
}

/** Проверки перед стартом UI в production. */
export function validateProductionBuild(): void {
  if (!isProduction) return;

  if (import.meta.env.VITE_DEV_USER_ID?.trim()) {
    console.warn(
      '[deploy] VITE_DEV_USER_ID задан при сборке production и не используется. Уберите переменную из CI/Docker build.',
    );
  }

  const mocksEnabled = [
    USE_PROGRESS_MOCK,
    USE_EMPLOYEES_MOCK,
    USE_KNOWLEDGE_BASE_MOCK,
    USE_PROFILE_MOCK,
  ].some(Boolean);

  if (mocksEnabled) {
    console.error(
      '[deploy] В production-сборке включены моки (USE_*_MOCK). Отключите их в src/config/dataSources.ts.',
    );
  }
}
