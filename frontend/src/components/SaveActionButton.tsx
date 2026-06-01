import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils';
import './SaveActionButton.scss';

export interface SaveActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: ReactNode;
}

/**
 * Кнопка сохранения: при isLoading скрывает подпись и показывает спиннер по центру,
 * сохраняя размеры кнопки (классы модалки задают width/height).
 */
export function SaveActionButton({
  isLoading = false,
  children,
  className,
  disabled,
  type = 'button',
  ...rest
}: SaveActionButtonProps) {
  return (
    <button
      type={type}
      className={cn('save-action-btn', className, isLoading && 'save-action-btn--loading')}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      <span className="save-action-btn__label">{children}</span>
      {isLoading && <span className="save-action-btn__spinner" aria-hidden="true" />}
    </button>
  );
}
