import { useMemo, useState } from 'react';
import dropdownArrowIcon from '../../assets/icons/dropdown-arrow-icon.svg';
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
import { buildGanttTasksFromMocks } from '../../mocks/calendarGanttFromMocks';
import { getDaysInMonth } from '../../utils';

interface CalendarPageProps {
  onTaskSelect?: (task: GanttTask) => void;
  selectedTaskId?: string | null;
}

export const CalendarPage = ({ onTaskSelect, selectedTaskId }: CalendarPageProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(
    () => MONTHS[new Date().getMonth()],
  );
  const [isOpen, setIsOpen] = useState(false);

  const year       = new Date().getFullYear();
  const monthIndex = selectedMonth ? MONTH_INDEX[selectedMonth] : null;
  const totalDays  = monthIndex !== null ? getDaysInMonth(monthIndex, year) : 0;
  const days       = Array.from({ length: totalDays }, (_, i) => i + 1);

  const today    = new Date();
  const todayDay =
    monthIndex !== null && today.getFullYear() === year && today.getMonth() === monthIndex
      ? today.getDate()
      : null;

  const ganttTasks = useMemo(
    () => (monthIndex === null ? [] : buildGanttTasksFromMocks(year, monthIndex)),
    [year, monthIndex],
  );

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
          <div className="gantt">
            <div className="gantt__scroll">
              <div
                className="gantt__inner"
                style={{
                  minWidth: `${totalDays * GANTT_MIN_DAY_COL_WIDTH_REM}rem`,
                  '--total-days': totalDays,
                } as React.CSSProperties}
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
                    minHeight: `${ganttTasks.length * GANTT_BAR_HEIGHT_REM + Math.max(0, ganttTasks.length - 1) * GANTT_BAR_GAP_REM}rem`,
                  }}
                >
                  {todayDay !== null && (
                    <div
                      className="gantt__today-line"
                      style={{ left: `${((todayDay - 0.5) / totalDays) * 100}%` }}
                      aria-hidden="true"
                    />
                  )}

                  {ganttTasks.map((task, index) => {
                    const start = Math.max(1, task.start);
                    const end   = Math.min(totalDays, task.end);
                    if (start > totalDays || end < 1) return null;

                    const left  = ((start - 1) / totalDays) * 100;
                    const width = ((end - start + 1) / totalDays) * 100;
                    const top   = index * (GANTT_BAR_HEIGHT_REM + GANTT_BAR_GAP_REM);

                    const isSelected = selectedTaskId === task.id;

                    return (
                      <div
                        key={`task-${task.id}`}
                        className={
                          `gantt__bar gantt__bar--${task.category}` +
                          (isSelected ? ' gantt__bar--selected' : '')
                        }
                        style={{ left: `${left}%`, width: `${width}%`, top: `${top}rem` }}
                        role="button"
                        tabIndex={0}
                        aria-label={`${task.name}: ${start}–${end} ${selectedMonth}, ${task.progress}%`}
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
        ) : (
          <div className="calendar-widget__placeholder">
            {CALENDAR_PLACEHOLDER}
          </div>
        )}
      </section>
    </>
  );
};
