/**
 * Моки текущей сцены и узлов рендер-фермы.
 * Соответствуют макетам Figma (фреймы 944:2219, 964:2255 и 964:2311).
 *
 * Идея: будущая интеграция с Blender-фермой. Источник данных пока локальный,
 * без обращений к /api/*. Типы — в `types/renderFarm.ts`, метки/цвета — в
 * `constants/renderFarm.ts`.
 */

import type {
  RenderJobMock,
  RenderNodeMock,
  RenderSettingsMock,
} from '../types/renderFarm';

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
