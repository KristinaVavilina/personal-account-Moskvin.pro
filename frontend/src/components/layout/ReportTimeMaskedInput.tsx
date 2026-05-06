import type { ChangeEvent } from 'react';

type ReportTimeMaskedInputProps = {
  id?: string;
  value: string;
  onChange: (next: string) => void;
};

/** Только цифры, не больше четырёх — чч и мм. */
function extractDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 4);
}

/**
 * Маска «чч:мм» без сторонних библиотек (часы 00–23, минуты 00–59).
 * Колонка появляется после второй цифры часа.
 */
function maskHm24(digits: string): string {
  let d = extractDigits(digits);
  if (d.length >= 2) {
    const h = Math.min(23, Number.parseInt(d.slice(0, 2), 10));
    d = String(h).padStart(2, '0') + d.slice(2);
  }
  if (d.length >= 4) {
    const m = Math.min(59, Number.parseInt(d.slice(2, 4), 10));
    d = d.slice(0, 2) + String(m).padStart(2, '0');
  }
  if (d.length === 0) return '';
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

export function ReportTimeMaskedInput({ id, value, onChange }: ReportTimeMaskedInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(maskHm24(e.target.value));
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="чч:мм"
      value={value}
      onChange={handleChange}
    />
  );
}
