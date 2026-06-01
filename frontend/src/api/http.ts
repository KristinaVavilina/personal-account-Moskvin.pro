import { notifyError } from '../lib/notify';

/**
 * Единая точка чтения JSON-ответов API.
 * При HTTP-ошибке автоматически показывает всплывающее уведомление (sonner)
 * и пробрасывает Error дальше — чтобы вызывающий код мог решить про inline-состояние.
 *
 * Текст уведомления берётся из тела ответа сервера, либо из status/statusText.
 * Благодаря дедупу в notifyError повторные одинаковые ошибки не задваиваются.
 */
export async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    const message = parseServerErrorMessage(text) || `${res.status} ${res.statusText}`;
    const err = new Error(message);
    notifyError(err);
    throw err;
  }
  const text = await res.text();
  return parseResponseBody<T>(text);
}

/** Читает тело успешного ответа: JSON или plain text (например ASP.NET `Ok("Ok")`). */
function parseResponseBody<T>(raw: string): T {
  const trimmed = raw.trim();
  if (!trimmed) return undefined as T;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return trimmed as T;
  }
}

/**
 * Достаёт человекочитаемое сообщение из тела ошибки сервера.
 * Поддерживает обычный текст и JSON вида `{ message }`, `{ detail }`, `{ title }`,
 * ASP.NET ProblemDetails и `{ errors: { Field: ["..."] } }` (валидация).
 */
function parseServerErrorMessage(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>;
        if (typeof obj.message === 'string' && obj.message.trim()) return obj.message;
        if (typeof obj.detail === 'string' && obj.detail.trim()) return obj.detail;
        if (typeof obj.title === 'string' && obj.title.trim()) return obj.title;
        if (obj.errors && typeof obj.errors === 'object') {
          const groups = Object.values(obj.errors as Record<string, unknown>);
          const flat: string[] = [];
          for (const g of groups) {
            if (Array.isArray(g)) {
              for (const item of g) if (typeof item === 'string') flat.push(item);
            } else if (typeof g === 'string') {
              flat.push(g);
            }
          }
          if (flat.length) return flat.join('\n');
        }
      }
    } catch {
      /* не JSON — отдадим исходный текст */
    }
  }
  return trimmed;
}
