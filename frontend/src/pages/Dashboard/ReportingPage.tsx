import { useEffect, useState } from 'react';
import { fetchTimeLogsForCurrentMonth } from '../../api/timeLogs';
import {
  buildReportGroupsFromApiLogs,
  type ReportWidgetGroup,
} from '../../mocks/reportGroupsFromMocks';
import './Reporting.scss';

export const ReportingPage = () => {
  const [reportGroups, setReportGroups] = useState<ReportWidgetGroup[]>([]);
  const [isReportLoading, setIsReportLoading] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsReportLoading(true);
      setReportError(null);
      try {
        const logs = await fetchTimeLogsForCurrentMonth();
        if (!cancelled) setReportGroups(buildReportGroupsFromApiLogs(logs));
      } catch (e) {
        if (!cancelled) {
          setReportError(e instanceof Error ? e.message : 'Не удалось загрузить отчёты');
          setReportGroups([]);
        }
      } finally {
        if (!cancelled) setIsReportLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
                  <article key={item.id} className="report-item">
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
    </section>
  );
};
