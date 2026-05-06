import type { BenefitWorkloadPoint } from '../mocks/benefitWorkloadMock';
import { getDaysInMonth } from '../mocks/benefitWorkloadMock';
import { USE_PROGRESS_MOCK } from '../config/progressSource';
import {
  getMockDailyReflectionRowsForMonth,
} from '../mocks/progressDashboardMock';
import type {
  ApiDailyReflectionResponse,
  ApiDailyReflectionWriteRequest,
} from '../types/dailyReflectionApi';
import { resolveDevUserId } from './devUser';
import { readJson } from './http';
import { dailyReflectionRowsToBenefitWorkloadSeries } from '../utils/progressDashboardTransform';

export type { ApiDailyReflectionResponse, ApiDailyReflectionWriteRequest } from '../types/dailyReflectionApi';

/**
 * Точки графика «польза / загруженность» за календарный месяц из DailyReflection.
 * Польза ← valueLevel, загруженность ← stressLevel. Дни без записи — 0/0.
 * Если за месяц нет ни одной рефлексии у пользователя — пустой массив (пустой виджет).
 */
export async function fetchBenefitWorkloadForMonth(
  year: number,
  monthIndex0: number,
): Promise<BenefitWorkloadPoint[]> {
  const dayCount = getDaysInMonth(year, monthIndex0);
  const userId = await resolveDevUserId();
  if (!userId || dayCount < 1) return [];

  if (USE_PROGRESS_MOCK) {
    const rows = getMockDailyReflectionRowsForMonth(year, monthIndex0, userId);
    return dailyReflectionRowsToBenefitWorkloadSeries(rows, userId, year, monthIndex0);
  }

  const res = await fetch('/api/DailyReflection');
  const all = await readJson<ApiDailyReflectionResponse[]>(res);
  if (!Array.isArray(all)) return [];

  return dailyReflectionRowsToBenefitWorkloadSeries(all, userId, year, monthIndex0);
}

/** Полный список рефлексий (GET /api/DailyReflection). */
export async function fetchDailyReflectionsAll(): Promise<ApiDailyReflectionResponse[]> {
  const res = await fetch('/api/DailyReflection');
  const raw = await readJson<ApiDailyReflectionResponse[]>(res);
  return Array.isArray(raw) ? raw : [];
}

export async function fetchDailyReflectionById(id: string): Promise<ApiDailyReflectionResponse> {
  const res = await fetch(`/api/DailyReflection/${encodeURIComponent(id)}`);
  return readJson<ApiDailyReflectionResponse>(res);
}

export async function createDailyReflection(body: ApiDailyReflectionWriteRequest): Promise<string> {
  const res = await fetch('/api/DailyReflection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<string>(res);
}

export async function updateDailyReflection(
  id: string,
  body: ApiDailyReflectionWriteRequest,
): Promise<void> {
  const res = await fetch(`/api/DailyReflection/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await readJson<string>(res);
}

export async function deleteDailyReflection(id: string): Promise<void> {
  const res = await fetch(`/api/DailyReflection/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await readJson<string>(res);
}
