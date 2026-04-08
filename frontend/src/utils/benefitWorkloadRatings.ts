/** Значение из modal-status (строка «1»…«5») → шкала графика 1…5 */
export function parseStatusReportScaleToChart(value: string): number {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, n));
}
