import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { fetchTimeLogsForCurrentMonth, monthBoundsIso } from '../../api/timeLogs';
import { resolveDevUserId } from '../../api/devUser';
import { fetchUserTasksRaw } from '../../api/tasks';
import { apiTypeNameToTaskTypeLabel } from '../../api/taskTypeMap';
import {
  buildReportGroupsFromApiLogs,
  mergeMonthApiTimeLogsWithLocal,
  type ReportWidgetGroup,
} from '../../mocks/reportGroupsFromMocks';
import { useReportEntriesStore } from '../../store/useReportEntriesStore';
import { ReportEditModal, type ReportEditSavePayload } from '../../components/layout/ReportEditModal';
import { ReportViewModal } from '../../components/layout/ReportViewModal';
import type { ApiTimeLogRow } from '../../types/timeLogApi';
import type { StoredReportEntry } from '../../types/reportEntry';
import type { TaskPanelHandle } from '../../components/layout/TaskPanel';
import './Reporting.scss';

export interface ReportingPageProps {
  taskPanelRef: RefObject<TaskPanelHandle | null>;
}

type TaskMeta = {
  title: string;
  typeLabel: string;
  description: string | null;
};

/** Метаданные задач (активные + архивные): название/тип/описание — для подписей и просмотра отчётов. */
async function loadTaskMeta(): Promise<Map<string, TaskMeta>> {
  const uid = await resolveDevUserId();
  if (!uid) return new Map();
  const [active, archived] = await Promise.all([
    fetchUserTasksRaw(uid, false),
    fetchUserTasksRaw(uid, true),
  ]);
  const map = new Map<string, TaskMeta>();
  for (const t of [...active, ...archived]) {
    map.set(t.id, {
      title: t.title?.trim() || t.id,
      typeLabel: apiTypeNameToTaskTypeLabel(t.typeName),
      description: t.description ?? null,
    });
  }
  return map;
}

export const ReportingPage = ({ taskPanelRef }: ReportingPageProps) => {
  const localEntries = useReportEntriesStore((s) => s.entries);
  const [reportGroups, setReportGroups] = useState<ReportWidgetGroup[]>([]);
  const [isReportLoading, setIsReportLoading] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [viewLogId, setViewLogId] = useState<string | null>(null);
  const [mergedLogs, setMergedLogs] = useState<Array<ApiTimeLogRow | StoredReportEntry>>([]);
  const [taskMetaById, setTaskMetaById] = useState<Map<string, TaskMeta>>(new Map());

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
        const [logs, metaMap] = await Promise.all([
          fetchTimeLogsForCurrentMonth(),
          loadTaskMeta(),
        ]);
        if (cancelled) return;
        const titleMap = new Map<string, string>();
        for (const [id, m] of metaMap) titleMap.set(id, m.title);
        const merged = mergeMonthApiTimeLogsWithLocal(logs, localEntries, start, end);
        const ids = new Set(localEntries.map((e) => e.id));
        setMergedLogs(merged);
        setTaskMetaById(metaMap);
        setReportGroups(buildReportGroupsFromApiLogs(merged, ids, titleMap));
        setReportError(null);
      } catch (e) {
        if (!cancelled) {
          setReportError(e instanceof Error ? e.message : 'Не удалось загрузить отчёты');
          const mergedOnlyLocal = mergeMonthApiTimeLogsWithLocal([], localEntries, start, end);
          const ids = new Set(localEntries.map((entry) => entry.id));
          setMergedLogs(mergedOnlyLocal);
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

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewLogId(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  const getLiveTask = useCallback(
    (taskId: string) => taskPanelRef.current?.getTaskById(taskId) ?? null,
    [taskPanelRef],
  );

  const editingEntry = editingEntryId
    ? (localEntries.find((e) => e.id === editingEntryId) ?? null)
    : null;

  const viewLog = viewLogId ? (mergedLogs.find((l) => l.id === viewLogId) ?? null) : null;
  const viewMeta = viewLog ? taskMetaById.get(viewLog.taskId) : undefined;

  const openItem = (id: string, editable: boolean) => {
    if (editable) setEditingEntryId(id);
    else setViewLogId(id);
  };

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
                      'report-item' +
                      (item.editable ? ' report-item--editable' : ' report-item--preview')
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={
                      item.editable
                        ? `Редактировать отчёт: ${item.title}`
                        : `Открыть отчёт: ${item.title}`
                    }
                    onClick={() => openItem(item.id, !!item.editable)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openItem(item.id, !!item.editable);
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
      {viewLog && (
        <ReportViewModal
          log={viewLog as ApiTimeLogRow}
          taskTitle={viewMeta?.title ?? viewLog.taskId}
          taskTypeLabel={viewMeta?.typeLabel ?? ''}
          taskDescription={viewMeta?.description ?? null}
          onClose={() => setViewLogId(null)}
        />
      )}
      <div className="report-widget__inner-shadow" aria-hidden="true" />
    </section>
  );
};
