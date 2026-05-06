import { useEffect, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { fetchTimeLogsForUserDateRange, monthBoundsIso } from '../../api/timeLogs';
import { apiTypeNameToTaskTypeLabel } from '../../api/taskTypeMap';
import { fetchUserTasksRaw } from '../../api/tasks';
import { ReportViewModal } from '../../components/layout/ReportViewModal';
import type { ApiTimeLogRow } from '../../types/timeLogApi';
import {
  buildReportGroupsFromApiLogs,
  type ReportWidgetGroup,
} from '../../mocks/reportGroupsFromMocks';
import '../Dashboard/Reporting.scss';

export interface EmployeeReportReadonlyProps {
  userId: string;
}

type TaskMeta = {
  title: string;
  typeLabel: string;
  description: string | null;
};

/** Отчёт за текущий месяц: карточки кликабельны; детали — в модалке без редактирования. */
export const EmployeeReportReadonly = ({ userId }: EmployeeReportReadonlyProps) => {
  const [reportGroups, setReportGroups] = useState<ReportWidgetGroup[]>([]);
  const [monthLogs, setMonthLogs] = useState<ApiTimeLogRow[]>([]);
  const [taskMetaById, setTaskMetaById] = useState<Map<string, TaskMeta>>(new Map());
  const [viewLogId, setViewLogId] = useState<string | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    const { start, end } = monthBoundsIso(now.getFullYear(), now.getMonth());

    (async () => {
      setIsReportLoading(true);
      setReportError(null);
      try {
        const [logs, active, archived] = await Promise.all([
          fetchTimeLogsForUserDateRange(userId, start, end),
          fetchUserTasksRaw(userId, false),
          fetchUserTasksRaw(userId, true),
        ]);
        const titleByTaskId = new Map<string, string>();
        const metaByTaskId = new Map<string, TaskMeta>();
        for (const t of [...active, ...archived]) {
          titleByTaskId.set(t.id, t.title);
          metaByTaskId.set(t.id, {
            title: t.title,
            typeLabel: apiTypeNameToTaskTypeLabel(t.typeName),
            description: t.description ?? null,
          });
        }
        const groups = buildReportGroupsFromApiLogs(logs, new Set<string>(), titleByTaskId);
        if (!cancelled) {
          setTaskMetaById(metaByTaskId);
          setMonthLogs(logs);
          setReportGroups(groups);
          setReportError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setReportError(e instanceof Error ? e.message : 'Не удалось загрузить отчёты');
          setReportGroups([]);
          setMonthLogs([]);
          setTaskMetaById(new Map());
        }
      } finally {
        if (!cancelled) setIsReportLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewLogId(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  const viewLog = viewLogId ? monthLogs.find((l) => l.id === viewLogId) : undefined;
  const viewMeta = viewLog ? taskMetaById.get(viewLog.taskId) : undefined;

  const openItem = (id: string) => setViewLogId(id);

  const onArticleKeyDown = (e: ReactKeyboardEvent<HTMLElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openItem(id);
    }
  };

  return (
    <section className="report-widget employees-report-readonly" aria-label="Отчёт сотрудника за месяц">
      {isReportLoading && <div className="report-widget__spinner" aria-label="Загрузка" />}
      {reportError && (
        <p className="report-widget__error" role="alert">
          {reportError}
        </p>
      )}
      {!isReportLoading && !reportError && reportGroups.length === 0 && (
        <div className="report-widget__empty">
          <span className="report-widget__empty-icon">📭</span>
          <span>Отчётов пока нет</span>
        </div>
      )}
      {!isReportLoading && reportGroups.length > 0 && (
        <div className="report-group-list">
          {reportGroups.map((group) => (
            <div key={group.id} className="report-group-item">
              <div className="report-group-date">
                <p>{group.date}</p>
              </div>
              <div className="report-list">
                {group.items.map((item) => (
                  <article
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Открыть отчёт: ${item.title}`}
                    className="report-item report-item--preview"
                    onClick={() => openItem(item.id)}
                    onKeyDown={(e) => onArticleKeyDown(e, item.id)}
                  >
                    <div className="report-item__content">
                      <h3 className="report-item__title">{item.title}</h3>
                      <p className="report-item__text">{item.text}</p>
                    </div>
                    <div className="report-item__meta">
                      <div className="report-item__badge">{item.badge}</div>
                      <div className="report-item__time">{item.time}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="report-widget__inner-shadow" aria-hidden="true" />

      {viewLog && (
        <ReportViewModal
          log={viewLog}
          taskTitle={viewMeta?.title ?? viewLog.taskId}
          taskTypeLabel={viewMeta?.typeLabel ?? ''}
          taskDescription={viewMeta?.description ?? null}
          onClose={() => setViewLogId(null)}
        />
      )}
    </section>
  );
};
