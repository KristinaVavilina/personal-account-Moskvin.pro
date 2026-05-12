import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import dropdownArrowIcon from '../../assets/icons/dropdown-arrow-icon.svg';
import { fetchCalendarTaskRows, fetchCalendarTaskRowsForUser } from '../../api/calendarTasks';
import { resolveDevUserId } from '../../api/devUser';
import { fetchTimeLogsForDateRange, fetchTimeLogsForUserDateRange, monthBoundsIso } from '../../api/timeLogs';
import { USE_PROGRESS_MOCK } from '../../config';
import {
  MONTHS,
  MONTH_INDEX,
  DAY_NAMES,
  CALENDAR_PLACEHOLDER,
  GANTT_BAR_HEIGHT_REM,
  GANTT_BAR_GAP_REM,
  GANTT_MIN_DAY_COL_WIDTH_REM,
} from '../../constants';
import type { GanttTask } from '../../constants';
import type { CalendarTaskRow } from '../../utils/calendarGantt';
import { buildGanttTasksFromCalendarRows } from '../../utils/calendarGantt';
import { getDaysInMonth } from '../../utils';
import { getMockApiTimeLogsInRange } from '../../mocks/progressDashboardMock';
import type { ApiTimeLogRow } from '../../types/timeLogApi';

interface CalendarPageProps {
  /** Если задан — данные задач и таймлогов по этому пользователю (просмотр коллеги). */
  viewUserId?: string | null;
  onTaskSelect?: (task: GanttTask) => void;
  selectedTaskId?: string | null;
}

export const CalendarPage = ({
  viewUserId = null,
  onTaskSelect,
  selectedTaskId,
}: CalendarPageProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(
    () => MONTHS[new Date().getMonth()],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [calendarRows, setCalendarRows] = useState<CalendarTaskRow[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  /** undefined — загрузка; по ним задаётся день начала полосы для задач из прошлых месяцев. */
  const [monthLogs, setMonthLogs] = useState<ApiTimeLogRow[] | undefined>(undefined);

  const year       = new Date().getFullYear();
  const monthIndex = selectedMonth ? MONTH_INDEX[selectedMonth] : null;
  const totalDays  = monthIndex !== null ? getDaysInMonth(monthIndex, year) : 0;
  const days       = Array.from({ length: totalDays }, (_, i) => i + 1);

  const today    = new Date();
  const todayDay =
    monthIndex !== null && today.getFullYear() === year && today.getMonth() === monthIndex
      ? today.getDate()
      : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCalendarLoading(true);
      try {
        const rows =
          viewUserId && viewUserId.length > 0
            ? await fetchCalendarTaskRowsForUser(viewUserId)
            : await fetchCalendarTaskRows();
        if (!cancelled) {
          setCalendarRows(rows);
          setCalendarError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setCalendarRows([]);
          setCalendarError(
            e instanceof Error ? e.message : 'Не удалось загрузить данные календаря',
          );
        }
      } finally {
        if (!cancelled) setCalendarLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewUserId]);

  useEffect(() => {
    if (monthIndex === null) {
      setMonthLogs(undefined);
      return;
    }
    let cancelled = false;
    setMonthLogs(undefined);
    const { start, end } = monthBoundsIso(year, monthIndex);

    (async () => {
      try {
        let logs: ApiTimeLogRow[];
        if (USE_PROGRESS_MOCK) {
          const uid =
            viewUserId && viewUserId.length > 0 ? viewUserId : await resolveDevUserId();
          if (!uid) {
            if (!cancelled) setMonthLogs([]);
            return;
          }
          logs = getMockApiTimeLogsInRange(uid, start, end, new Date());
        } else if (viewUserId && viewUserId.length > 0) {
          logs = await fetchTimeLogsForUserDateRange(viewUserId, start, end);
        } else {
          logs = await fetchTimeLogsForDateRange(start, end);
        }
        if (!cancelled) setMonthLogs(Array.isArray(logs) ? logs : []);
      } catch {
        if (!cancelled) setMonthLogs([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [year, monthIndex, viewUserId]);

  const ganttBarLayout = useMemo(() => {
    if (monthIndex === null || monthLogs === undefined) return [];

    const tasks = buildGanttTasksFromCalendarRows(
      calendarRows,
      year,
      monthIndex,
      new Date(),
      monthLogs,
    );

    const rows: Array<{
      task: GanttTask;
      style: CSSProperties;
      start: number;
      endToday: number;
    }> = [];

    for (const task of tasks) {
      const rawStart = Math.max(1, Math.trunc(Number(task.start)));
      const rawEnd   = Math.min(totalDays, Math.trunc(Number(task.end)));
      if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd)) continue;
      if (rawStart > totalDays || rawEnd < 1) continue;

      const endToday =
        todayDay !== null ? Math.min(rawEnd, todayDay) : rawEnd;
      const start = Math.min(rawStart, endToday);
      if (start > endToday) continue;

      /** Правый край полосы как у целых дней; обрезка до линии «сегодня» — см. maxWidth ниже */
      const startFrac       = (start - 1) / totalDays;
      const endFracFullDay = endToday / totalDays;
      const spanNatural    = endFracFullDay - startFrac;
      if (spanNatural <= 0) continue;

      const style: CSSProperties = {
        left: `${startFrac * 100}%`,
        width: `${spanNatural * 100}%`,
        top: `${rows.length * (GANTT_BAR_HEIGHT_REM + GANTT_BAR_GAP_REM)}rem`,
      };

      /**
       * Красная линия по центру колонки текущего дня: ограничиваем ширину полосой до этой координаты.
       * maxWidth переживает мелкие рассинхроны расчётов/subpixel там, где одного width мало.
       */
      if (todayDay !== null && endToday === todayDay) {
        const capSpanPct = ((todayDay - 0.5) / totalDays - startFrac) * 100;
        if (capSpanPct > 0) {
          style.maxWidth = `${capSpanPct}%`;
        }
      }

      rows.push({ task, style, start, endToday });
    }

    return rows;
  }, [calendarRows, year, monthIndex, monthLogs, todayDay, totalDays]);

  return (
    <>
      <div
        className={'month-selector' + (isOpen ? ' month-selector--open' : '')}
        style={{ position: 'relative' }}
      >
        <button
          className="month-selector__summary"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Выбрать месяц"
          aria-expanded={isOpen}
        >
          <span className="month-selector__label">{selectedMonth ?? 'Выбрать'}</span>
          <img
            className="month-selector__icon"
            src={dropdownArrowIcon}
            alt=""
            aria-hidden="true"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {isOpen && (
          <div className="month-selector__menu" role="listbox" aria-label="Месяц">
            {MONTHS.map((month) => (
              <button
                key={month}
                className={
                  'month-selector__option' +
                  (month === selectedMonth ? ' month-selector__option--active' : '')
                }
                role="option"
                aria-selected={month === selectedMonth}
                onClick={() => {
                  setSelectedMonth(month);
                  setIsOpen(false);
                }}
              >
                {month}
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="calendar-widget" aria-label="Календарь">
        {monthIndex !== null ? (
          calendarLoading ? (
            <div className="calendar-widget__placeholder">Загрузка календаря…</div>
          ) : calendarError ? (
            <div className="calendar-widget__placeholder" role="alert">
              {calendarError}
            </div>
          ) : (
          <div className="gantt">
            <div className="gantt__scroll">
              <div
                className="gantt__inner"
                style={{
                  minWidth: `${totalDays * GANTT_MIN_DAY_COL_WIDTH_REM}rem`,
                  '--total-days': totalDays,
                } as CSSProperties}
              >
                <div className="gantt__header">
                  <div className="gantt__days" aria-hidden="true">
                    {days.map((d) => {
                      const dayOfWeek = DAY_NAMES[new Date(year, monthIndex, d).getDay()];
                      const isToday   = d === todayDay;
                      const isWeekend = dayOfWeek === 'СБ' || dayOfWeek === 'ВС';
                      return (
                        <div
                          key={`day-${d}`}
                          className={
                            'gantt__day-col' +
                            (isToday   ? ' gantt__day-col--today'   : '') +
                            (isWeekend ? ' gantt__day-col--weekend' : '')
                          }
                        >
                          <span className="gantt__day-num">{d}</span>
                          <span className="gantt__day-name">{dayOfWeek}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div
                  className="gantt__field"
                  style={{
                    minHeight: `${ganttBarLayout.length * GANTT_BAR_HEIGHT_REM + Math.max(0, ganttBarLayout.length - 1) * GANTT_BAR_GAP_REM}rem`,
                  }}
                >
                  {todayDay !== null && (
                    <div
                      className="gantt__today-line"
                      style={{
                        // По горизонтали совпадает с точкой у `gantt__day-col--today::after` (центр колонки дня)
                        left: `${((todayDay - 0.5) / totalDays) * 100}%`,
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {ganttBarLayout.map((row, index) => {
                    const { task, style, start, endToday } = row;

                    const isSelected = selectedTaskId === task.id;

                    return (
                      <div
                        key={`gantt-${task.id}-${start}-${endToday}-${index}`}
                        className={
                          `gantt__bar gantt__bar--${task.category}` +
                          (isSelected ? ' gantt__bar--selected' : '')
                        }
                        style={style}
                        role="button"
                        tabIndex={0}
                        aria-label={`${task.name}: ${start}–${endToday} ${selectedMonth}, ${task.progress}%`}
                        onClick={() => onTaskSelect?.(task)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onTaskSelect?.(task);
                          }
                        }}
                      >
                        <div
                          className="gantt__bar-fill"
                          style={{ width: `${task.progress}%` }}
                          aria-hidden="true"
                        />
                        <span className="gantt__bar-name">{task.name}</span>
                        <span className="gantt__bar-progress">{task.progress}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          )
        ) : (
          <div className="calendar-widget__placeholder">
            {CALENDAR_PLACEHOLDER}
          </div>
        )}
      </section>
    </>
  );
};
