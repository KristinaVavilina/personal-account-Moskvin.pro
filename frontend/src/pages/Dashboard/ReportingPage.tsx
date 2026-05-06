import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { fetchTimeLogsForCurrentMonth, monthBoundsIso } from '../../api/timeLogs';
import {
  buildReportGroupsFromApiLogs,
  mergeMonthApiTimeLogsWithLocal,
  type ReportWidgetGroup,
} from '../../mocks/reportGroupsFromMocks';
import { useReportEntriesStore } from '../../store/useReportEntriesStore';
import { ReportEditModal, type ReportEditSavePayload } from '../../components/layout/ReportEditModal';
import type { TaskPanelHandle } from '../../components/layout/TaskPanel';
import './Reporting.scss';

export interface ReportingPageProps {
  taskPanelRef: RefObject<TaskPanelHandle | null>;
}

export const ReportingPage = ({ taskPanelRef }: ReportingPageProps) => {
  const localEntries = useReportEntriesStore((s) => s.entries);
  const [reportGroups, setReportGroups] = useState<ReportWidgetGroup[]>([]);
  const [isReportLoading, setIsReportLoading] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const firstLoadRef = useRef(true);

  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    const { start, end } = monthBoundsIso(now.getFullYear(), now.getMonth());

    (async () => {
      if (firstLoadRef.current) {
        setIsReportLoading(true);
        setReportError(null);
      }
      try {
        const logs = await fetchTimeLogsForCurrentMonth();
        if (cancelled) return;
        const merged = mergeMonthApiTimeLogsWithLocal(logs, localEntries, start, end);
        const ids = new Set(localEntries.map((e) => e.id));
        setReportGroups(buildReportGroupsFromApiLogs(merged, ids));
        setReportError(null);
      } catch (e) {
        if (!cancelled) {
          setReportError(e instanceof Error ? e.message : 'Не удалось загрузить отчёты');
          const mergedOnlyLocal = mergeMonthApiTimeLogsWithLocal([], localEntries, start, end);
          const ids = new Set(localEntries.map((entry) => entry.id));
          setReportGroups(buildReportGroupsFromApiLogs(mergedOnlyLocal, ids));
        }
      } finally {
        if (!cancelled && firstLoadRef.current) {
          setIsReportLoading(false);
          firstLoadRef.current = false;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [localEntries]);

  const getLiveTask = useCallback(
    (taskId: string) => taskPanelRef.current?.getTaskById(taskId) ?? null,
    [taskPanelRef],
  );

  const editingEntry = editingEntryId
    ? (localEntries.find((e) => e.id === editingEntryId) ?? null)
    : null;

  const handleEditSave = useCallback(
    async (payload: ReportEditSavePayload) => {
      const comment =
        payload.workDescription.trim() ||
        (payload.taskDescription.trim() ? payload.taskDescription.trim() : null);
      useReportEntriesStore.getState().updateEntry(payload.entryId, {
        startTime: payload.timeStart,
        endTime: payload.timeEnd,
        progressSnapshot: payload.newProgress,
        comment,
        taskDescriptionSnapshot: payload.taskDescription,
        taskTypeLabel: payload.taskType,
      });
      const { entryId: _e, ...taskPart } = payload;
      taskPanelRef.current?.applyTaskUpdateFromReport(taskPart);
    },
    [taskPanelRef],
  );

  return (
    <section className="report-widget" aria-label="Ежедневная отчётность">
      {isReportLoading && (
        <div className="report-widget__spinner" aria-label="Загрузка" />
      )}
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
                    className={
                      'report-item' + (item.editable ? ' report-item--editable' : ' report-item--readonly')
                    }
                    role="button"
                    tabIndex={item.editable ? 0 : undefined}
                    aria-disabled={!item.editable}
                    onClick={() => {
                      if (item.editable) setEditingEntryId(item.id);
                    }}
                    onKeyDown={(e) => {
                      if (!item.editable) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setEditingEntryId(item.id);
                      }
                    }}
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
      {editingEntry && (
        <ReportEditModal
          entry={editingEntry}
          onClose={() => setEditingEntryId(null)}
          getLiveTask={getLiveTask}
          onSave={handleEditSave}
        />
      )}
      <div className="report-widget__inner-shadow" aria-hidden="true" />
    </section>
  );
};
