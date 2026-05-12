import type {
  RenderJobStatus,
  RenderMode,
  RenderNodeStatus,
} from '../types/renderFarm';

// ─── Лейблы и цвета задачи рендера ──────────────────────────────────────────

/** Подпись статуса задачи рендера для текстового индикатора. */
export const RENDER_STATUS_LABEL: Record<RenderJobStatus, string> = {
  idle: 'Ожидание',
  queued: 'В очереди',
  rendering: 'Рендер',
  paused: 'Пауза',
  done: 'Готово',
  error: 'Ошибка',
};

/** Hex-цвет точки статуса (см. ellipse 39 в Figma — зелёный 009966). */
export const RENDER_STATUS_COLOR: Record<RenderJobStatus, string> = {
  idle: '#a0aec0',
  queued: '#aabcdd',
  rendering: '#009966',
  paused: '#fbb67b',
  done: '#7da0fa',
  error: '#fa8a8a',
};

// ─── Лейблы и цвета узлов рендера ────────────────────────────────────────────

/** Hex-цвет точки статуса для узла рендера (Figma — зелёный 009966). */
export const RENDER_NODE_STATUS_COLOR: Record<RenderNodeStatus, string> = {
  online: '#009966',
  offline: '#a0aec0',
  busy: '#fbb67b',
  error: '#fa8a8a',
};

/** Подпись статуса узла для aria-label. */
export const RENDER_NODE_STATUS_LABEL: Record<RenderNodeStatus, string> = {
  online: 'Онлайн',
  offline: 'Оффлайн',
  busy: 'Занят',
  error: 'Ошибка',
};

// ─── UI-константы страницы и модалок ────────────────────────────────────────

/** Вкладки режима рендера (одно изображение / анимация). */
export const RENDER_MODE_TABS: { id: RenderMode; label: string }[] = [
  { id: 'image', label: 'Изображение' },
  { id: 'animation', label: 'Анимация' },
];

/** Максимальная длина числового ввода в форме настроек рендера. */
export const RENDER_NUMERIC_INPUT_MAX_LENGTH = 8;

/** Placeholder'ы формы «Добавление нового узла рендера». */
export const RENDER_NODE_NAME_PLACEHOLDER = 'Например: PC-01';
export const RENDER_NODE_ADDRESS_PLACEHOLDER = 'Например: 192.168.0.1:15000';
