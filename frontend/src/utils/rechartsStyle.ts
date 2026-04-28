/** Общий стиль подсказок Recharts (Nunito, как в макете). */
export const RECHARTS_NUNITO_TOOLTIP_STYLE = {
  borderRadius: '1rem',
  border: 'none',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  fontFamily: 'Nunito, sans-serif',
  fontSize: '1.4rem',
  color: 'var(--accent-dark)',
} as const;

export const RECHARTS_TICK_STYLE = {
  fill: 'var(--accent-light)',
  fontSize: 12,
  fontFamily: 'Nunito, sans-serif',
  fontWeight: 500,
} as const;
