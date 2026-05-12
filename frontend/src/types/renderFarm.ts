/**
 * Типы домена рендер-фермы (Figma: 944:2219 / 964:2255 / 964:2311).
 * Соответствуют будущей интеграции с Blender-фермой.
 */

export type RenderEngine = 'Cycles' | 'Eevee' | 'Workbench';

/** Статус задачи рендера. Цвет точки в UI выбирается по этому полю. */
export type RenderJobStatus = 'idle' | 'queued' | 'rendering' | 'paused' | 'done' | 'error';

/** Режим (вкладка) панели настроек: один кадр или диапазон. */
export type RenderMode = 'image' | 'animation';

/** Статус подключения отдельного узла к ферме. */
export type RenderNodeStatus = 'online' | 'offline' | 'busy' | 'error';

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

export interface RenderNodeMock {
  id: string;
  name: string;
  /** Адрес узла в формате IP:PORT. */
  address: string;
  status: RenderNodeStatus;
  /** Загруженность узла, 0..100. Отображается полосой прогресса. */
  load: number;
}
