/**
 * Локальный стейт формы настроек на странице «Рендер-ферма».
 * Хранит только то, что ввёл пользователь (пусто → placeholder).
 */

/** Поля числового ввода: ограничены цифрами через `sanitizeDigitsInput`. */
export type RenderFarmNumericField =
  | 'startFrame'
  | 'endFrame'
  | 'fps'
  | 'samples'
  | 'width'
  | 'height';

/** Поля свободного текстового ввода. */
export type RenderFarmTextField = 'outputName' | 'savePath';

export type RenderFarmSettingsFormState = Record<
  RenderFarmNumericField | RenderFarmTextField,
  string
>;

export function emptyRenderSettingsForm(): RenderFarmSettingsFormState {
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
