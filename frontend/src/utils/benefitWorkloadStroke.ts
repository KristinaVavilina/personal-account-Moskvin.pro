/**
 * Сглаживание линий виджета пользы / загруженности.
 * `strokeLinejoin: round` — максимум для SVG; отдельного радиуса угла нет.
 */
export const BENEFIT_WORKLOAD_LINE_SMOOTHING = {
  curveType: 'monotone' as const,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
  strokeWidth: 3,
  adaptiveStroke: {
    enabled: true,
    remMultiplier: 0.28,
    widthFactor: 0.006,
    minPx: 2,
    maxPx: 8,
  },
} as const;

export function computeBenefitLineStrokePx(containerWidthPx: number): number {
  const { strokeWidth, adaptiveStroke } = BENEFIT_WORKLOAD_LINE_SMOOTHING;
  if (!adaptiveStroke.enabled) return strokeWidth;

  const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const { remMultiplier, widthFactor, minPx, maxPx } = adaptiveStroke;
  const fromW = containerWidthPx > 0 ? containerWidthPx * widthFactor : 0;

  if (!Number.isFinite(remPx) || remPx <= 0) {
    const raw = strokeWidth + fromW;
    return Math.round(Math.min(maxPx, Math.max(minPx, raw)) * 10) / 10;
  }

  const raw = remPx * remMultiplier + fromW;
  return Math.round(Math.min(maxPx, Math.max(minPx, raw)) * 10) / 10;
}
