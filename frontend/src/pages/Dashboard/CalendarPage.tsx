import { useState } from 'react';
import dropdownArrowIcon from '../../assets/icons/dropdown-arrow-icon.svg';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const MONTH_INDEX: Record<string, number> = Object.fromEntries(
  MONTHS.map((m, i) => [m, i]),
);

const DAY_NAMES = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

type TaskCategory = 'task' | 'discussion' | 'education' | 'routine' | 'other';

interface GanttTask {
  id: number;
  name: string;
  category: TaskCategory;
  start: number;
  end: number;
  progress: number;
}

const MOCK_TASKS: GanttTask[] = [
  { id: 1, name: 'Разработка UI',         category: 'task',       start: 1,  end: 12, progress: 75 },
  { id: 2, name: 'Совещание с командой',  category: 'discussion', start: 5,  end: 8,  progress: 100 },
  { id: 3, name: 'Обучение React',        category: 'education',  start: 10, end: 22, progress: 40 },
  { id: 4, name: 'Ежедневная рутина',     category: 'routine',    start: 1,  end: 31, progress: 60 },
  { id: 5, name: 'Прочие задачи',         category: 'other',      start: 18, end: 28, progress: 20 },
  { id: 6, name: 'Код-ревью',             category: 'task',       start: 14, end: 20, progress: 50 },
  { id: 7, name: 'Планирование спринта',  category: 'discussion', start: 22, end: 25, progress: 30 },
];

const BAR_H     = 5.4; // rem — должно совпадать с CSS
const BAR_GAP   = 1.2; // rem — должно совпадать с CSS
const MIN_COL_W = 4;   // rem — минимальная ширина колонки дня

function getDaysInMonth(monthIndex: number, year: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export const CalendarPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('Август');
  const [isOpen, setIsOpen] = useState(false);

  const year       = new Date().getFullYear();
  const monthIndex = MONTH_INDEX[selectedMonth];
  const totalDays  = getDaysInMonth(monthIndex, year);
  const days       = Array.from({ length: totalDays }, (_, i) => i + 1);

  const today    = new Date();
  const todayDay =
    today.getFullYear() === year && today.getMonth() === monthIndex
      ? today.getDate()
      : null;

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
          <span className="month-selector__label">{selectedMonth}</span>
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
        <div className="gantt">
          <div className="gantt__scroll">
            <div
              className="gantt__inner"
              style={{
                minWidth: `${totalDays * MIN_COL_W}rem`,
                '--total-days': totalDays,
              } as React.CSSProperties}
            >
              {/* Шапка: числа + дни недели */}
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

              {/* Поле: все задачи на одном слое */}
              <div
                className="gantt__field"
                style={{
                  minHeight: `${MOCK_TASKS.length * BAR_H + (MOCK_TASKS.length - 1) * BAR_GAP}rem`,
                }}
              >
                {todayDay !== null && (
                  <div
                    className="gantt__today-line"
                    style={{ left: `${((todayDay - 0.5) / totalDays) * 100}%` }}
                    aria-hidden="true"
                  />
                )}

                {MOCK_TASKS.map((task, index) => {
                  const start = Math.max(1, task.start);
                  const end   = Math.min(totalDays, task.end);
                  if (start > totalDays || end < 1) return null;

                  const left  = ((start - 1) / totalDays) * 100;
                  const width = ((end - start + 1) / totalDays) * 100;
                  const top   = index * (BAR_H + BAR_GAP);

                  return (
                    <div
                      key={`task-${task.id}`}
                      className={`gantt__bar gantt__bar--${task.category}`}
                      style={{ left: `${left}%`, width: `${width}%`, top: `${top}rem` }}
                      role="img"
                      aria-label={`${task.name}: ${start}–${end} ${selectedMonth}, ${task.progress}%`}
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
      </section>
    </>
  );
};
