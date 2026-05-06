/**
 * Мок «Хронология дня» — сегменты по категориям (часы за сутки, шкала 0–24 ч).
 * После API замените на фактические интервалы.
 */

export type DayTimelineCategory =
  | 'task'
  | 'discussion'
  | 'other'
  | 'education'
  | 'routine';

export interface DayTimelineSegment {
  id: string;
  category: DayTimelineCategory;
  /**
   * Вес на шкале 24 ч: для хронологии по **выполненным задачам** — доля типа от числа завершений за день;
   * для интервалов времени по таймлогам — длительность в часах.
   */
  hours: number;
  /** Если задано — сегмент построен по числу завершённых задач (подписи в UI). */
  completedInCategory?: number;
  completedDayTotal?: number;
}

/** Порядок и палитра как в макете Figma 473:1821 */
export const mockDayTimelineSegments: DayTimelineSegment[] = [
  { id: 'tl-1', category: 'task', hours: 2.5 },
  { id: 'tl-2', category: 'education', hours: 1.5 },
  { id: 'tl-3', category: 'other', hours: 1 },
  { id: 'tl-4', category: 'discussion', hours: 3 },
];
