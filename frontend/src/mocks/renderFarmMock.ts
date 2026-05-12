/**
 * Мок текущей сцены рендер-фермы.
 * Соответствует макетам Figma (фреймы 944:2219 и 964:2255).
 *
 * Идея: это будущая интеграция с Blender-фермой. Источник данных
 * пока локальный, без обращений к /api/*.
 */

export type RenderEngine = 'Cycles' | 'Eevee' | 'Workbench';

/** Статус задачи рендера. Цвет точки в UI выбирается по этому полю. */
export type RenderJobStatus = 'idle' | 'queued' | 'rendering' | 'paused' | 'done' | 'error';

/** Режим (вкладка) панели настроек: один кадр или диапазон. */
export type RenderMode = 'image' | 'animation';

export interface RenderJobMock {
  fileName: string;
  engine: RenderEngine;
  width: number;
  height: number;
  totalFrames: number;
  currentFrame: number;
  /** Прогресс рендера, 0..100. */
  progress: number;
  status: RenderJobStatus;
  /** Кол-во подключённых нод (узлов рендера). */
  nodes: number;
}

export interface RenderSettingsMock {
  mode: RenderMode;
  outputName: string;
  startFrame: number;
  endFrame: number;
  fps: number;
  samples: number;
  width: number;
  height: number;
  savePath: string;
}

export const RENDER_JOB_MOCK: RenderJobMock = {
  fileName: 'forest_scene.blend',
  engine: 'Cycles',
  width: 1920,
  height: 1080,
  totalFrames: 240,
  currentFrame: 173,
  progress: 45,
  status: 'rendering',
  nodes: 4,
};

export const RENDER_SETTINGS_MOCK: RenderSettingsMock = {
  mode: 'animation',
  outputName: 'file_name_V2_####',
  startFrame: 1,
  endFrame: 240,
  fps: 24,
  samples: 256,
  width: 1920,
  height: 1080,
  savePath: '//renders/2026/forest',
};

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

// =====================================================
//  Узлы рендера (модалка «Список узлов рендера»)
// =====================================================

/** Статус подключения отдельного узла к ферме. */
export type RenderNodeStatus = 'online' | 'offline' | 'busy' | 'error';

export interface RenderNodeMock {
  id: string;
  name: string;
  /** Адрес узла в формате IP:PORT. */
  address: string;
  status: RenderNodeStatus;
  /** Загруженность узла, 0..100. Отображается полосой прогресса. */
  load: number;
}

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

export const RENDER_NODES_MOCK: RenderNodeMock[] = [
  { id: 'ws-01', name: 'WS-Studio-01', address: '192.168.1.0:15000', status: 'online', load: 76 },
  { id: 'ws-02', name: 'WS-Studio-02', address: '192.168.1.1:15000', status: 'online', load: 76 },
  { id: 'ws-03', name: 'WS-Studio-03', address: '192.168.1.2:15000', status: 'online', load: 76 },
  { id: 'ws-04', name: 'WS-Studio-04', address: '192.168.1.3:15000', status: 'online', load: 76 },
  { id: 'ws-05', name: 'WS-Studio-05', address: '192.168.1.4:15000', status: 'online', load: 76 },
  { id: 'ws-06', name: 'WS-Studio-06', address: '192.168.1.5:15000', status: 'online', load: 76 },
  { id: 'ws-07', name: 'WS-Studio-07', address: '192.168.1.6:15000', status: 'online', load: 76 },
  { id: 'ws-08', name: 'WS-Studio-08', address: '192.168.1.7:15000', status: 'online', load: 76 },
];
