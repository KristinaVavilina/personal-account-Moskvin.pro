import type { Tab } from '../constants';
import type { AlertState } from '../constants';
import { DEADLINE_HOUR, RESET_HOUR, DASHBOARD_PATHS, ROUTE } from '../constants';

export type { Tab };

export {
  TASK_PROGRESS_STEPS,
  progressToDropdownLabel,
  labelToProgressNumber,
} from './taskProgress';

export { createClientUuid } from './createClientUuid';

export { formatHoursRu, buildDayTimelineAriaLabel } from './dayTimeline';

export { RECHARTS_NUNITO_TOOLTIP_STYLE, RECHARTS_TICK_STYLE } from './rechartsStyle';

export {
  BENEFIT_WORKLOAD_LINE_SMOOTHING,
  computeBenefitLineStrokePx,
} from './benefitWorkloadStroke';

export { parseStatusReportScaleToChart } from './benefitWorkloadRatings';

// ─── Модальные окна ──────────────────────────────────────────────────────────

export function handleOverlayClick(
  e: React.MouseEvent<HTMLDivElement>,
  onClose: () => void,
): void {
  if (e.target === e.currentTarget) onClose();
}

// ─── Календарь ───────────────────────────────────────────────────────────────

export function getDaysInMonth(monthIndex: number, year: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// ─── Время / дедлайн ─────────────────────────────────────────────────────────

export function getTimeUntilDeadline(): { hours: number; minutes: number } {
  const now = new Date();
  const deadline = new Date(now);
  deadline.setHours(DEADLINE_HOUR, 0, 0, 0);

  if (now >= deadline) return { hours: 0, minutes: 0 };

  const diff = deadline.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
}

export function computeAutoState(reportFilled: boolean): AlertState {
  const now = new Date();
  const hour = now.getHours();

  if (reportFilled) return 'done';
  if (hour >= DEADLINE_HOUR || hour < RESET_HOUR) return 'default';
  return 'time';
}

// ─── Маршрутизация ───────────────────────────────────────────────────────────

export function getInitialTab(pathname: string): Tab {
  if (pathname.startsWith(ROUTE.REPORTING)) return 'reporting';
  if (pathname.startsWith(ROUTE.CALENDAR)) return 'calendar';
  return 'progress';
}

/**
 * Проверяет, относится ли текущий pathname к одному из путей дашборда.
 */
export function isDashboardPath(pathname: string): boolean {
  return DASHBOARD_PATHS.some((p) => pathname.startsWith(p));
}

// ─── Поля ввода ──────────────────────────────────────────────────────────────

/** Оставляет только цифры и ограничивает длину строки (для type="text" inputMode="numeric"). */
export function sanitizeDigitsInput(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

// ─── Текст / склонения ───────────────────────────────────────────────────────

/** Склонение подписи: «1 задание», «2 задания», «5 заданий». */
export function pluralRuTasks(n: number): string {
  const nAbs = Math.abs(Math.trunc(n)) % 100;
  const n1 = nAbs % 10;
  if (nAbs > 10 && nAbs < 20) return 'заданий';
  if (n1 === 1) return 'задание';
  if (n1 >= 2 && n1 <= 4) return 'задания';
  return 'заданий';
}

// ─── CSS-классы ──────────────────────────────────────────────────────────────

type CnArg = string | undefined | null | false | Record<string, boolean>;

/**
 * Условная сборка CSS-классов (аналог clsx / classnames).
 */
export function cn(...args: CnArg[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string') {
      classes.push(arg);
    } else {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}
