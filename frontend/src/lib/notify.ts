import { toast } from 'sonner';

/**
 * Преобразует произвольную ошибку (Error / строка / unknown) в читаемое сообщение.
 * Используется как единая точка нормализации серверных ошибок.
 */
export function getErrorMessage(err: unknown, fallback = 'Произошла ошибка'): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err.trim()) return err;
  if (err && typeof err === 'object') {
    const maybe = err as { message?: unknown; detail?: unknown; title?: unknown };
    if (typeof maybe.message === 'string' && maybe.message.trim()) return maybe.message;
    if (typeof maybe.detail === 'string' && maybe.detail.trim()) return maybe.detail;
    if (typeof maybe.title === 'string' && maybe.title.trim()) return maybe.title;
  }
  return fallback;
}

/**
 * Показать всплывающее уведомление об ошибке.
 * Дедупликация: одинаковые тексты не дублируются благодаря `id` на основе сообщения.
 */
export function notifyError(err: unknown, fallback?: string): string {
  const message = getErrorMessage(err, fallback);
  toast.error(message, { id: `err:${message}` });
  return message;
}

/**
 * Показать всплывающее уведомление об успешном сохранении / действии на сервере.
 * Дедупликация по тексту — как у notifyError.
 */
export function notifySuccess(message: string): void {
  toast.success(message, { id: `ok:${message}` });
}

export function notifyInfo(message: string): void {
  toast(message, { id: `info:${message}` });
}
