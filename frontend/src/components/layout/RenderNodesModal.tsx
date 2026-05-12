import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import closeIcon from '../../assets/icons/close-icon.svg';
import {
  RENDER_NODE_STATUS_COLOR,
  RENDER_NODE_STATUS_LABEL,
  type RenderNodeMock,
} from '../../mocks/renderFarmMock';
import { handleOverlayClick } from '../../utils';
import './RenderNodesModal.scss';

export interface RenderNodesModalProps {
  onClose: () => void;
  /** Список узлов (единый источник правды с шапкой страницы рендер-фермы). */
  nodes: RenderNodeMock[];
  onNodesChange: (next: RenderNodeMock[]) => void;
}

const NODE_NAME_PLACEHOLDER = 'Например: PC-01';
const NODE_ADDRESS_PLACEHOLDER = 'Например: 192.168.0.1:15000';

/**
 * Модалка «Список узлов рендера» (Figma 964:2311).
 * Список приходит снаружи; изменения через onNodesChange.
 */
export const RenderNodesModal = ({
  onClose,
  nodes,
  onNodesChange,
}: RenderNodesModalProps) => {
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeAddress, setNewNodeAddress] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const canAdd = newNodeName.trim().length > 0 && newNodeAddress.trim().length > 0;

  const handleAddNode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canAdd) return;
    const id = `node-${Date.now()}`;
    onNodesChange([
      ...nodes,
      {
        id,
        name: newNodeName.trim(),
        address: newNodeAddress.trim(),
        status: 'offline',
        load: 0,
      },
    ]);
    setNewNodeName('');
    setNewNodeAddress('');
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    setNewNodeName(e.target.value);
  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) =>
    setNewNodeAddress(e.target.value);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div
        className="render-nodes-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="render-nodes-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="render-nodes-modal__header">
          <h2
            className="render-nodes-modal__title"
            id="render-nodes-modal-title"
          >
            Список узлов рендера
          </h2>
          <button
            type="button"
            className="render-nodes-modal__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <img src={closeIcon} alt="" />
          </button>
        </header>

        <section className="render-nodes-modal__section">
          <ul
            className="render-nodes-modal__list"
            aria-label="Подключённые узлы рендера"
          >
            {nodes.map((node) => (
              <li key={node.id} className="render-nodes-modal__item">
                <div className="render-nodes-modal__item-row">
                  <div className="render-nodes-modal__item-info">
                    <p className="render-nodes-modal__item-name">{node.name}</p>
                    <p className="render-nodes-modal__item-address">
                      {node.address}
                    </p>
                  </div>
                  <span
                    className="render-nodes-modal__item-status"
                    style={{ background: RENDER_NODE_STATUS_COLOR[node.status] }}
                    aria-label={RENDER_NODE_STATUS_LABEL[node.status]}
                  />
                </div>

                <div
                  className="render-nodes-modal__progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={node.load}
                  aria-label={`Загруженность узла ${node.name}`}
                >
                  <div
                    className="render-nodes-modal__progress-line"
                    style={{ width: `${node.load}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="render-nodes-modal__bulk-actions">
            <button type="button" className="render-nodes-modal__bulk-btn">
              Синхронизировать всё
            </button>
            <button type="button" className="render-nodes-modal__bulk-btn">
              Присоединить всё
            </button>
          </div>
        </section>

        <form
          className="render-nodes-modal__add"
          onSubmit={handleAddNode}
          aria-label="Добавить новый узел рендера"
        >
          <p className="render-nodes-modal__add-title">
            Добавление нового узла рендера
          </p>

          <div className="render-nodes-modal__add-row">
            <label className="render-nodes-modal__add-field">
              <span className="visually-hidden">Имя узла</span>
              <input
                type="text"
                className="render-nodes-modal__add-input"
                value={newNodeName}
                onChange={handleNameChange}
                placeholder={NODE_NAME_PLACEHOLDER}
              />
            </label>
            <label className="render-nodes-modal__add-field">
              <span className="visually-hidden">Адрес узла</span>
              <input
                type="text"
                className="render-nodes-modal__add-input"
                value={newNodeAddress}
                onChange={handleAddressChange}
                placeholder={NODE_ADDRESS_PLACEHOLDER}
              />
            </label>
          </div>

          <button
            type="submit"
            className="render-nodes-modal__add-submit"
            disabled={!canAdd}
          >
            Добавить новый узел
          </button>
        </form>
      </div>
    </div>
  );
};
