/** Допустимые шаги прогресса в модалках (согласовано с TASK_PROGRESS). */
export const TASK_PROGRESS_STEPS = [0, 20, 40, 60, 70, 90, 100] as const;

export function progressToDropdownLabel(progress: number): string {
  const allowed: number[] = [...TASK_PROGRESS_STEPS];
  const value = allowed.includes(progress)
    ? progress
    : allowed.reduce((a, b) => (Math.abs(b - progress) < Math.abs(a - progress) ? b : a));
  return `${value}%`;
}

export function labelToProgressNumber(label: string): number {
  const n = parseInt(label.replace('%', ''), 10);
  return Number.isFinite(n) ? n : 0;
}
