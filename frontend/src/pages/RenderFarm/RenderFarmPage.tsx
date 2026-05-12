import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import archiveFolderIcon from '../../assets/icons/archive-folder-icon.svg';
import nodesIcon from '../../assets/icons/nodes-icon.svg';
import playArrowIcon from '../../assets/icons/play-arrow-icon.svg';
import renderPreview from '../../assets/images/render-preview-mock.png';
import { RenderNodesModal } from '../../components/layout/RenderNodesModal';
import {
  RENDER_JOB_MOCK,
  RENDER_NODES_MOCK,
  RENDER_SETTINGS_MOCK,
  RENDER_STATUS_COLOR,
  RENDER_STATUS_LABEL,
  type RenderMode,
  type RenderNodeMock,
} from '../../mocks/renderFarmMock';
import { cn } from '../../utils';
import './RenderFarm.scss';

const RENDER_MODE_TABS: { id: RenderMode; label: string }[] = [
  { id: 'image', label: 'Изображение' },
  { id: 'animation', label: 'Анимация' },
];

/** Поля настроек: только то, что ввёл пользователь (пусто → placeholder). */
type RenderFarmSettingsFormState = {
  outputName: string;
  savePath: string;
  startFrame: string;
  endFrame: string;
  fps: string;
  samples: string;
  width: string;
  height: string;
};

const numericInputMaxLength = 8;

function emptyRenderSettingsForm(): RenderFarmSettingsFormState {
  return {
    outputName: '',
    savePath: '',
    startFrame: '',
    endFrame: '',
    fps: '',
    samples: '',
    width: '',
    height: '',
  };
}

export const RenderFarmPage = () => {
  const job = RENDER_JOB_MOCK;

  const blendFileInputRef = useRef<HTMLInputElement>(null);
  const [sceneFileName, setSceneFileName] = useState(job.fileName);
  const [mode, setMode] = useState<RenderMode>(RENDER_SETTINGS_MOCK.mode);
  const [isNodesModalOpen, setIsNodesModalOpen] = useState(false);
  const [renderNodes, setRenderNodes] = useState<RenderNodeMock[]>(() => [...RENDER_NODES_MOCK]);
  const [form, setForm] = useState<RenderFarmSettingsFormState>(emptyRenderSettingsForm);

  const sceneMetaItems = useMemo(
    () => [job.engine, `${job.width}x${job.height}`, `${job.totalFrames} frames`],
    [job.engine, job.width, job.height, job.totalFrames],
  );

  const handleTextChange =
    (key: keyof Pick<RenderFarmSettingsFormState, 'outputName' | 'savePath'>) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleNumericDigitsChange =
    (
      key: keyof Pick<
        RenderFarmSettingsFormState,
        'startFrame' | 'endFrame' | 'fps' | 'samples' | 'width' | 'height'
      >,
    ) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const cleaned = e.target.value.replace(/[^\d]/g, '').slice(0, numericInputMaxLength);
      setForm((prev) => ({ ...prev, [key]: cleaned }));
    };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleBlendFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSceneFileName(file.name);
    }
    e.target.value = '';
  };

  return (
    <>
      <main className="main-content render-farm">
        <header className="render-farm-header" aria-label="Текущая сцена">
          <div className="render-farm-header__info">
            <input
              ref={blendFileInputRef}
              type="file"
              className="render-farm-header__file-input"
              accept=".blend"
              onChange={handleBlendFileChange}
              tabIndex={-1}
              aria-hidden="true"
            />
            <button
              type="button"
              className="render-farm-header__file-btn"
              onClick={() => blendFileInputRef.current?.click()}
              aria-label="Выбрать файл сцены Blender (.blend)"
            >
              <img src={archiveFolderIcon} alt="" aria-hidden="true" />
            </button>
            <div className="render-farm-header__titles">
              <p className="render-farm-header__title">{sceneFileName}</p>
              <ul className="render-farm-header__meta" aria-label="Параметры сцены">
                {sceneMetaItems.map((item, i) => (
                  <li key={item} className="render-farm-header__meta-item">
                    {i > 0 && (
                      <span className="render-farm-header__meta-dot" aria-hidden="true" />
                    )}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            type="button"
            className="render-farm-header__nodes-btn"
            onClick={() => setIsNodesModalOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isNodesModalOpen}
          >
            <span className="render-farm-header__nodes-icon" aria-hidden="true">
              <img src={nodesIcon} alt="" />
            </span>
            <span className="render-farm-header__nodes-label">Узлы рендера</span>
            <span className="render-farm-header__nodes-count" aria-label="Количество узлов в списке">
              {renderNodes.length}
            </span>
          </button>
        </header>

        <section className="render-farm-viewport" aria-label="Превью рендера">
          <div className="render-farm-viewport__pills">
            <span className="render-farm-viewport__pill" aria-label="Прогресс по кадрам">
              Кадр {job.currentFrame} / {job.totalFrames}
            </span>
            <span className="render-farm-viewport__pill render-farm-viewport__pill--status">
              <span
                className="render-farm-viewport__status-dot"
                style={{ background: RENDER_STATUS_COLOR[job.status] }}
                aria-hidden="true"
              />
              <span style={{ color: RENDER_STATUS_COLOR[job.status] }}>
                {RENDER_STATUS_LABEL[job.status]}
              </span>
            </span>
          </div>

          <div className="render-farm-viewport__preview">
            <img src={renderPreview} alt={`Превью рендера сцены ${sceneFileName}`} />
          </div>

          <div className="render-farm-viewport__progress" aria-label="Прогресс рендера">
            <div className="render-farm-viewport__progress-head">
              <span>Прогресс рендера</span>
              <span>{job.progress}%</span>
            </div>
            <div
              className="render-farm-viewport__progress-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={job.progress}
            >
              <div
                className="render-farm-viewport__progress-line"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>
        </section>
      </main>

      <aside className="render-farm-settings" aria-label="Настройки рендера">
        <div className="render-farm-settings__head">
          <h2 className="render-farm-settings__title">Настройки рендера</h2>

          <div
            className="render-farm-settings__tabs"
            role="tablist"
            aria-label="Режим рендера"
          >
            {RENDER_MODE_TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={mode === id}
                className={cn('render-farm-settings__tab', {
                  'render-farm-settings__tab--active': mode === id,
                })}
                onClick={() => setMode(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <form
          className="render-farm-settings__form"
          aria-label="Параметры рендера"
          onSubmit={handleSubmit}
          onReset={(e) => {
            e.preventDefault();
            setForm(emptyRenderSettingsForm());
          }}
        >
          <div className="render-farm-settings__form-body">
            <label className="render-farm-field render-farm-field--full">
              <span className="render-farm-field__label">Имя файла</span>
              <span className="render-farm-field__control">
                <input
                  className="render-farm-field__input"
                  type="text"
                  value={form.outputName}
                  onChange={handleTextChange('outputName')}
                  placeholder="file_name_V2_####"
                />
              </span>
            </label>

          {mode === 'animation' && (
            <div className="render-farm-field-row">
              <label className="render-farm-field">
                <span className="render-farm-field__label">Начало рендера</span>
                <span className="render-farm-field__control">
                  <input
                    className="render-farm-field__input"
                    type="text"
                    inputMode="numeric"
                    value={form.startFrame}
                    onChange={handleNumericDigitsChange('startFrame')}
                    placeholder="1"
                  />
                </span>
              </label>
              <label className="render-farm-field">
                <span className="render-farm-field__label">Конец рендера</span>
                <span className="render-farm-field__control">
                  <input
                    className="render-farm-field__input"
                    type="text"
                    inputMode="numeric"
                    value={form.endFrame}
                    onChange={handleNumericDigitsChange('endFrame')}
                    placeholder="240"
                  />
                </span>
              </label>
            </div>
          )}

          {mode === 'image' && (
            <div className="render-farm-field-row">
              <label className="render-farm-field">
                <span className="render-farm-field__label">Ширина</span>
                <span className="render-farm-field__control">
                  <input
                    className="render-farm-field__input"
                    type="text"
                    inputMode="numeric"
                    value={form.width}
                    onChange={handleNumericDigitsChange('width')}
                    placeholder="1920"
                  />
                </span>
              </label>
              <label className="render-farm-field">
                <span className="render-farm-field__label">Высота</span>
                <span className="render-farm-field__control">
                  <input
                    className="render-farm-field__input"
                    type="text"
                    inputMode="numeric"
                    value={form.height}
                    onChange={handleNumericDigitsChange('height')}
                    placeholder="1080"
                  />
                </span>
              </label>
            </div>
          )}

          <div className="render-farm-field-row">
            {mode === 'animation' && (
              <label className="render-farm-field">
                <span className="render-farm-field__label">FPS</span>
                <span className="render-farm-field__control">
                  <input
                    className="render-farm-field__input"
                    type="text"
                    inputMode="numeric"
                    value={form.fps}
                    onChange={handleNumericDigitsChange('fps')}
                    placeholder="24"
                  />
                </span>
              </label>
            )}
            <label className="render-farm-field">
              <span className="render-farm-field__label">Сэмплы</span>
              <span className="render-farm-field__control">
                <input
                  className="render-farm-field__input"
                  type="text"
                  inputMode="numeric"
                  value={form.samples}
                  onChange={handleNumericDigitsChange('samples')}
                  placeholder="256"
                />
              </span>
            </label>
          </div>

          <label className="render-farm-field render-farm-field--full">
            <span className="render-farm-field__label">Путь сохранения</span>
            <span className="render-farm-field__control">
              <input
                className="render-farm-field__input"
                type="text"
                value={form.savePath}
                onChange={handleTextChange('savePath')}
                placeholder="//renders/2026/forest"
              />
            </span>
          </label>
          </div>

          <div className="render-farm-settings__actions">
            <button
              type="reset"
              className="render-farm-btn render-farm-btn--cancel"
            >
              Отменить
            </button>
            <button
              type="submit"
              className="render-farm-btn render-farm-btn--start"
            >
              <img
                src={playArrowIcon}
                alt=""
                className="render-farm-btn__icon"
                aria-hidden="true"
              />
              Старт
            </button>
          </div>
        </form>
      </aside>

      {isNodesModalOpen && (
        <RenderNodesModal
          nodes={renderNodes}
          onNodesChange={setRenderNodes}
          onClose={() => setIsNodesModalOpen(false)}
        />
      )}
    </>
  );
};
