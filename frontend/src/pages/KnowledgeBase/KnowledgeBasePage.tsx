import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Plugin } from '@tiptap/pm/state';
import searchIcon from '../../assets/icons/search-icon.svg';
import closeIcon from '../../assets/icons/close-icon.svg';
import dropdownArrow from '../../assets/icons/dropdown-arrow-icon.svg';
import docIcon from '../../assets/icons/doc-icon.svg';
import resultDocIcon from '../../assets/icons/result-doc-icon.svg';
import undoIcon from '../../assets/icons/undo-icon.svg';
import redoIcon from '../../assets/icons/redo-icon.svg';
import italicIcon from '../../assets/icons/italic-icon.svg';
import boldIcon from '../../assets/icons/bold-icon.svg';
import underlineIcon from '../../assets/icons/underline-icon.svg';
import linkIcon from '../../assets/icons/link-icon.svg';
import favouritesIcon from '../../assets/icons/favourites-icon.svg';
import favouritesIconActive from '../../assets/icons/favourites-icon-active.svg';
import archiveFolderIcon from '../../assets/icons/archive-folder-icon.svg';
import restoreArrowIcon from '../../assets/icons/restore-arrow-icon.svg';
import trashButtonIcon from '../../assets/icons/trash-button-icon.svg';
import {
  collectFileIdsInSubtree,
  DEFAULT_FILE_CONTENT,
  getMockActiveKbItems,
  getMockArchivedKbItems,
  getMockQuickLinksForUser,
  type KnowledgeArchiveItem,
  type KnowledgeFile,
  type KnowledgeFolder,
  type KnowledgeNode,
} from '../../mocks/knowledgeBaseMock';
import {
  createKb,
  createQuickLink,
  deleteKb,
  deleteQuickLink,
  fetchKbById,
  fetchKbTree,
  updateKb,
  fetchQuickLinksAll,
  fetchQuickLinksByUser,
} from '../../api/knowledgeBase';
import { resolveDevUserId } from '../../api/devUser';
import { USE_KNOWLEDGE_BASE_MOCK } from '../../config';
import type { KBItemRequest, KBItemResponse } from '../../types/knowledgeBaseApi';
import { ItemType } from '../../types/knowledgeBaseApi';
import {
  kbCollectSubtreeIds,
  kbFlatToTree,
  kbRemoveSubtree,
} from '../../utils/knowledgeBaseTree';
import { kbArchivedFlatToArchiveRows } from './knowledgeBaseArchiveRows';
import { cn } from '../../utils';
import './KnowledgeBase.scss';

type WorkspaceTab = 'base' | 'archive';

const WORKSPACE_TABS: { id: WorkspaceTab; label: string }[] = [
  { id: 'base', label: 'База знаний' },
  { id: 'archive', label: 'Архив' },
];

/** Рекурсивно фильтрует дерево по поисковому запросу (без учёта регистра). */
function filterTree(nodes: KnowledgeNode[], query: string): KnowledgeNode[] {
  if (!query) return nodes;
  const q = query.toLocaleLowerCase('ru-RU').trim();
  if (!q) return nodes;

  const result: KnowledgeNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      if (node.name.toLocaleLowerCase('ru-RU').includes(q)) result.push(node);
      continue;
    }
    const filteredChildren = filterTree(node.children, query);
    const selfMatches = node.name.toLocaleLowerCase('ru-RU').includes(q);
    if (selfMatches || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: selfMatches ? node.children : filteredChildren,
      });
    }
  }
  return result;
}

/** Раскрывает дерево в плоский список файлов с цепочкой родительских папок. */
interface FlatFile {
  file: KnowledgeFile;
  trail: string[];
}

function flattenFiles(nodes: KnowledgeNode[], trail: string[] = []): FlatFile[] {
  const result: FlatFile[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      const trailLabels = node.location.pathLabels.length > 0 ? node.location.pathLabels : trail;
      result.push({ file: node, trail: trailLabels });
      continue;
    }
    result.push(...flattenFiles(node.children, [...trail, node.name]));
  }
  return result;
}

/** Любой узел дерева (файл или папка) с цепочкой родительских папок. */
interface FlatNode {
  node: KnowledgeNode;
  trail: string[];
}

function flattenNodes(nodes: KnowledgeNode[], trail: string[] = []): FlatNode[] {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      const trailLabels = node.location.pathLabels.length > 0 ? node.location.pathLabels : trail;
      result.push({ node, trail: trailLabels });
    } else {
      const trailLabels = node.location.pathLabels.length > 0 ? node.location.pathLabels : trail;
      result.push({ node, trail: trailLabels });
      result.push(...flattenNodes(node.children, [...trail, node.name]));
    }
  }
  return result;
}

/** Поиск по дереву, возвращающий и папки, и файлы с подходящим названием. */
function searchNodes(tree: KnowledgeNode[], query: string): FlatNode[] {
  const q = query.toLocaleLowerCase('ru-RU').trim();
  if (!q) return [];
  return flattenNodes(tree).filter(({ node }) =>
    node.name.toLocaleLowerCase('ru-RU').includes(q),
  );
}

/** Разбивает строку на части по совпадению с запросом для подсветки. */
function splitMatch(text: string, query: string): { text: string; match: boolean }[] {
  const q = query.toLocaleLowerCase('ru-RU').trim();
  if (!q) return [{ text, match: false }];
  const lower = text.toLocaleLowerCase('ru-RU');
  const idx = lower.indexOf(q);
  if (idx === -1) return [{ text, match: false }];
  return [
    { text: text.slice(0, idx), match: false },
    { text: text.slice(idx, idx + q.length), match: true },
    { text: text.slice(idx + q.length), match: false },
  ].filter((part) => part.text.length > 0);
}

// ─── Иконки ──────────────────────────────────────────────────────────────────

const IconClose = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const IconMoreHorizontal = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

export type TreeNodeMenuAction = 'create-folder' | 'create-file' | 'rename' | 'archive';

// ─── Дерево ──────────────────────────────────────────────────────────────────

interface TreeNodeRowMenuProps {
  node: KnowledgeNode;
  variant: 'folder' | 'file';
  archiveMenuLabel: string;
  onAction?: (action: TreeNodeMenuAction, node: KnowledgeNode) => void;
}

const TreeNodeRowMenu = ({ node, variant, archiveMenuLabel, onAction }: TreeNodeRowMenuProps) => (
  <DropdownMenu.Root modal={false}>
    <DropdownMenu.Trigger asChild>
      <button
        type="button"
        className="kb-tree__more"
        aria-label="Действия с элементом"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <IconMoreHorizontal />
      </button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        className="kb-tree__menu"
        side="bottom"
        align="end"
        sideOffset={10}
        alignOffset={0}
        avoidCollisions={false}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {variant === 'folder' && (
          <>
            <DropdownMenu.Item
              className="kb-tree__menu-item"
              onSelect={() => onAction?.('create-folder', node)}
            >
              Создать папку
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="kb-tree__menu-item"
              onSelect={() => onAction?.('create-file', node)}
            >
              Создать файл
            </DropdownMenu.Item>
          </>
        )}
        <DropdownMenu.Item className="kb-tree__menu-item" onSelect={() => onAction?.('rename', node)}>
          Переименовать
        </DropdownMenu.Item>
        <DropdownMenu.Item className="kb-tree__menu-item" onSelect={() => onAction?.('archive', node)}>
          {archiveMenuLabel}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);

interface TreeNodeProps {
  node: KnowledgeNode;
  depth: number;
  expanded: Set<string>;
  selectedId: string | null;
  query: string;
  archiveMenuLabel: string;
  onToggle: (id: string) => void;
  onOpenFile: (file: KnowledgeFile) => void;
  onTreeMenuAction?: (action: TreeNodeMenuAction, node: KnowledgeNode) => void;
}

const HighlightedLabel = ({ text, query }: { text: string; query: string }) => (
  <>
    {splitMatch(text, query).map((part, i) =>
      part.match ? (
        <strong key={i} className="kb-tree__match">
          {part.text}
        </strong>
      ) : (
        <span key={i}>{part.text}</span>
      ),
    )}
  </>
);

const TreeNode = ({
  node,
  depth,
  expanded,
  selectedId,
  query,
  archiveMenuLabel,
  onToggle,
  onOpenFile,
  onTreeMenuAction,
}: TreeNodeProps) => {
  if (node.type === 'file') {
    const isSelected = selectedId === node.id;
    return (
      <div
        className={cn('kb-tree__row-wrap', { 'kb-tree__row-wrap--selected': isSelected })}
        style={{ marginLeft: `${depth * 2.4}rem` }}
      >
        <button
          type="button"
          className="kb-tree__row-main kb-tree__row-main--file"
          onClick={() => onOpenFile(node)}
        >
          <span className="kb-tree__label">
            <HighlightedLabel text={node.name} query={query} />
          </span>
        </button>
        <div className="kb-tree__row-actions">
          <TreeNodeRowMenu
            node={node}
            variant="file"
            archiveMenuLabel={archiveMenuLabel}
            onAction={onTreeMenuAction}
          />
        </div>
      </div>
    );
  }

  const isOpen = expanded.has(node.id);
  return (
    <div className="kb-tree__group" style={{ marginLeft: `${depth * 2.4}rem` }}>
      <div className="kb-tree__row-wrap">
        <button
          type="button"
          className="kb-tree__row-main kb-tree__row-main--folder"
          onClick={() => onToggle(node.id)}
          aria-expanded={isOpen}
        >
          <img
            src={dropdownArrow}
            alt=""
            aria-hidden="true"
            className={cn('kb-tree__chevron', { 'kb-tree__chevron--open': isOpen })}
          />
          <span className="kb-tree__label">
            <HighlightedLabel text={node.name} query={query} />
          </span>
        </button>
        <div className="kb-tree__row-actions">
          <TreeNodeRowMenu
            node={node}
            variant="folder"
            archiveMenuLabel={archiveMenuLabel}
            onAction={onTreeMenuAction}
          />
        </div>
      </div>
      {isOpen && (
        <div className="kb-tree__children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              selectedId={selectedId}
              query={query}
              archiveMenuLabel={archiveMenuLabel}
              onToggle={onToggle}
              onOpenFile={onOpenFile}
              onTreeMenuAction={onTreeMenuAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Карточка документа ──────────────────────────────────────────────────────

interface DocCardProps {
  file: KnowledgeFile;
  onOpen: (file: KnowledgeFile) => void;
}

const DocCard = ({ file, onOpen }: DocCardProps) => (
  <button
    type="button"
    className="kb-doc-card"
    aria-label={file.name}
    onClick={() => onOpen(file)}
  >
    <span className="kb-doc-card__cover" aria-hidden="true">
      <img src={docIcon} alt="" className="kb-doc-card__cover-icon" />
    </span>
    <span className="kb-doc-card__title">{file.name}</span>
    {file.location.pathLabels.length > 0 && (
      <span className="kb-doc-card__path">{file.location.pathLabels.join(' / ')}</span>
    )}
  </button>
);

// ─── Строка результата поиска ────────────────────────────────────────────────

interface ResultRowProps {
  result: FlatNode;
  query: string;
  onOpenFile: (file: KnowledgeFile) => void;
}

const ResultRow = ({ result, query, onOpenFile }: ResultRowProps) => {
  const { node, trail } = result;
  const isFolder = node.type === 'folder';
  const breadcrumbs = ['База знаний', ...trail].join(' / ');

  return (
    <button
      type="button"
      className={cn('kb-result-row', { 'kb-result-row--folder': isFolder })}
      aria-label={node.name}
      onClick={isFolder ? undefined : () => onOpenFile(node)}
    >
      <span
        className={cn(
          'kb-result-row__icon',
          isFolder ? 'kb-result-row__icon--folder' : 'kb-result-row__icon--file',
        )}
        aria-hidden="true"
      >
        <img
          src={isFolder ? archiveFolderIcon : resultDocIcon}
          alt=""
          className="kb-result-row__icon-img"
        />
      </span>
      <span className="kb-result-row__title">
        {splitMatch(node.name, query).map((part, i) =>
          part.match ? (
            <strong key={i} className="kb-result-row__match">
              {part.text}
            </strong>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </span>
      <span className="kb-result-row__path">{breadcrumbs}</span>
    </button>
  );
};

// ─── Редактор файла ──────────────────────────────────────────────────────────

interface DocEditorProps {
  file: KnowledgeFile;
  html: string;
  isBookmarked: boolean;
  onSave: (html: string) => void | Promise<void>;
  onToggleBookmark: () => void;
  onClose: () => void;
}

/** Регулярка распознаёт прямые ссылки на изображения. */
const IMAGE_URL_RE = /^https?:\/\/\S+\.(png|jpe?g|gif|webp|svg|avif)(\?\S*)?$/i;

/**
 * Расширяем стандартный Image-extension TipTap, добавляя обработку вставки:
 * если в буфере обмена прямой URL на картинку — вместо текста вставляем <img/>.
 */
const ImageWithPaste = Image.extend({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData('text/plain')?.trim() ?? '';
            if (!text || !IMAGE_URL_RE.test(text)) return false;
            const node = view.state.schema.nodes.image.create({ src: text });
            view.dispatch(view.state.tr.replaceSelectionWith(node));
            return true;
          },
        },
      }),
    ];
  },
});

const DocEditor = ({ file, html, isBookmarked, onSave, onToggleBookmark, onClose }: DocEditorProps) => {
  const [isDirty, setIsDirty] = useState(false);

  // useEditor пересоздаёт инстанс при смене file.id, поэтому история TipTap
  // (а значит и undo/redo) начинается с нуля для каждого открытого файла.
  // Перерисовка от изменения других пропсов (например `isBookmarked`)
  // на редактор не влияет — история сохраняется только от реального ввода текста.
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          link: {
            // Клик по ссылке открывает её в новой вкладке. Редактирование
            // (изменение href / удаление) делается через BubbleMenu после
            // выделения слова мышкой или клавиатурой.
            openOnClick: true,
            autolink: true,
            HTMLAttributes: { rel: 'noreferrer noopener', target: '_blank' },
          },
        }),
        // Underline уже входит в StarterKit 3, отдельный extension не нужен.
        ImageWithPaste.configure({
          HTMLAttributes: { class: 'kb-editor__image' },
        }),
      ],
      content: html,
      editorProps: {
        attributes: {
          class: 'kb-editor__content',
          spellcheck: 'false',
        },
      },
      onUpdate: () => setIsDirty(true),
    },
    [file.id, html],
  );

  useEffect(() => {
    // Сброс «грязности» при смене документа / подгрузке контента с сервера
    // eslint-disable-next-line react-hooks/set-state-in-effect -- синхронизация вложенного редактора
    setIsDirty(false);
  }, [file.id, html]);

  const handleSetLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Введите URL ссылки', previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleSave = () => {
    if (!isDirty || !editor) return;
    const next = editor.getHTML();
    void Promise.resolve(onSave(next)).then(() => setIsDirty(false));
  };

  // Команды форматирования вешаем на mousedown и сразу глушим default —
  // иначе браузер успеет перевести фокус на кнопку ещё до click,
  // ProseMirror получит blur, выделение схлопнется и toggle применится к пустоте.
  const runOnMouseDown =
    (action: () => void) =>
    (event: React.MouseEvent) => {
      event.preventDefault();
      action();
    };

  return (
    <div className="kb-editor">
      <header className="kb-editor__header">
        <div className="kb-editor__title-block">
          <h2 className="kb-editor__title" title={file.name}>
            {file.name}
          </h2>
          {file.location.pathLabels.length > 0 && (
            <p className="kb-editor__path" title={['База знаний', ...file.location.pathLabels].join(' / ')}>
              {['База знаний', ...file.location.pathLabels].join(' / ')}
            </p>
          )}
        </div>
        <div className="kb-editor__header-actions">
          <button
            type="button"
            className={cn('kb-editor__save', { 'kb-editor__save--disabled': !isDirty })}
            onClick={handleSave}
            disabled={!isDirty}
          >
            Сохранить
          </button>
          <button
            type="button"
            className="kb-editor__icon-btn kb-editor__icon-btn--round"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <IconClose />
          </button>
        </div>
      </header>

      <div className="kb-editor__body">
        <EditorContent editor={editor} />

        {editor && (
          <BubbleMenu
            editor={editor}
            className="kb-editor__toolbar"
            options={{ placement: 'top' }}
          >
            <button
              type="button"
              className={cn('kb-editor__tool', {
                'kb-editor__tool--active': editor.isActive('italic'),
              })}
              onMouseDown={runOnMouseDown(() =>
                editor.chain().focus().toggleItalic().run(),
              )}
              aria-label="Курсив"
              aria-pressed={editor.isActive('italic')}
            >
              <img
                src={italicIcon}
                alt=""
                aria-hidden="true"
                className="kb-editor__tool-icon kb-editor__tool-icon--italic"
                draggable={false}
              />
            </button>
            <button
              type="button"
              className={cn('kb-editor__tool', {
                'kb-editor__tool--active': editor.isActive('bold'),
              })}
              onMouseDown={runOnMouseDown(() =>
                editor.chain().focus().toggleBold().run(),
              )}
              aria-label="Жирный"
              aria-pressed={editor.isActive('bold')}
            >
              <img
                src={boldIcon}
                alt=""
                aria-hidden="true"
                className="kb-editor__tool-icon kb-editor__tool-icon--bold"
                draggable={false}
              />
            </button>
            <button
              type="button"
              className={cn('kb-editor__tool', {
                'kb-editor__tool--active': editor.isActive('underline'),
              })}
              onMouseDown={runOnMouseDown(() =>
                editor.chain().focus().toggleUnderline().run(),
              )}
              aria-label="Подчёркнутый"
              aria-pressed={editor.isActive('underline')}
            >
              <img
                src={underlineIcon}
                alt=""
                aria-hidden="true"
                className="kb-editor__tool-icon kb-editor__tool-icon--underline"
                draggable={false}
              />
            </button>
            <button
              type="button"
              className={cn('kb-editor__tool kb-editor__tool--text', {
                'kb-editor__tool--active': editor.isActive('heading', { level: 1 }),
              })}
              onMouseDown={runOnMouseDown(() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run(),
              )}
              aria-label="Заголовок"
              aria-pressed={editor.isActive('heading', { level: 1 })}
            >
              h1
            </button>
            <button
              type="button"
              className={cn('kb-editor__tool', {
                'kb-editor__tool--active': editor.isActive('link'),
              })}
              onMouseDown={runOnMouseDown(handleSetLink)}
              aria-label="Ссылка"
              aria-pressed={editor.isActive('link')}
            >
              <img
                src={linkIcon}
                alt=""
                aria-hidden="true"
                className="kb-editor__tool-icon kb-editor__tool-icon--link"
                draggable={false}
              />
            </button>
          </BubbleMenu>
        )}
      </div>

      <footer className="kb-editor__footer">
        <div className="kb-editor__footer-group">
          <button
            type="button"
            className="kb-editor__icon-btn kb-editor__icon-btn--round"
            aria-label="Отменить"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
          >
            <img src={undoIcon} alt="" aria-hidden="true" className="kb-editor__icon-img" />
          </button>
          <button
            type="button"
            className="kb-editor__icon-btn kb-editor__icon-btn--round"
            aria-label="Повторить"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
          >
            <img src={redoIcon} alt="" aria-hidden="true" className="kb-editor__icon-img" />
          </button>
        </div>
        <button
          type="button"
          className={cn('kb-editor__icon-btn kb-editor__icon-btn--round', {
            'kb-editor__icon-btn--active': isBookmarked,
          })}
          aria-label={isBookmarked ? 'Убрать из закладок' : 'Добавить в закладки'}
          aria-pressed={isBookmarked}
          onClick={onToggleBookmark}
        >
          <img
            src={isBookmarked ? favouritesIconActive : favouritesIcon}
            alt=""
            aria-hidden="true"
            className="kb-editor__icon-img kb-editor__icon-img--bookmark"
          />
        </button>
      </footer>
    </div>
  );
};

// ─── Карточка архивной записи ────────────────────────────────────────────────

interface ArchiveRowProps {
  item: KnowledgeArchiveItem;
  query: string;
  onRestore: (item: KnowledgeArchiveItem) => void;
  onDelete: (item: KnowledgeArchiveItem) => void;
}

/** Подсказка о сроке удаления в склонении «через N дней / 1 день / 2 дня…». */
const formatDeleteIn = (days: number): string => {
  const mod10 = days % 10;
  const mod100 = days % 100;
  if (mod10 === 1 && mod100 !== 11) return `Удаление через: ${days} день`;
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
    return `Удаление через: ${days} дня`;
  }
  return `Удаление через: ${days} дней`;
};

const ArchiveRow = ({ item, query, onRestore, onDelete }: ArchiveRowProps) => {
  const isFolder = item.kind === 'folder';
  return (
    <div className="kb-archive-row">
      <span
        className={cn('kb-archive-row__icon', {
          'kb-archive-row__icon--folder': isFolder,
          'kb-archive-row__icon--file': !isFolder,
        })}
        aria-hidden="true"
      >
        <img src={isFolder ? archiveFolderIcon : docIcon} alt="" />
      </span>
      <div className="kb-archive-row__lead">
        <span className="kb-archive-row__title" title={item.name}>
          {splitMatch(item.name, query).map((part, i) =>
            part.match ? (
              <span key={i} className="kb-archive-row__title-strong">
                {part.text}
              </span>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </span>
        {item.restorePathLabels != null && item.restorePathLabels.length > 0 && (
          <span className="kb-archive-row__path" title={['База знаний', ...item.restorePathLabels].join(' / ')}>
            {['База знаний', ...item.restorePathLabels].join(' / ')}
          </span>
        )}
      </div>
      <span className="kb-archive-row__meta">
        <span className="kb-archive-row__meta-line">В архиве: {item.archivedAt}</span>
        {item.deleteInDays > 0 && (
          <span className="kb-archive-row__meta-line">{formatDeleteIn(item.deleteInDays)}</span>
        )}
      </span>
      {item.canRestore !== false && (
        <button
          type="button"
          className="kb-archive-row__restore"
          aria-label="Восстановить"
          onClick={() => onRestore(item)}
        >
          <img
            src={restoreArrowIcon}
            alt=""
            aria-hidden="true"
            className="kb-archive-row__restore-icon"
          />
        </button>
      )}
      <button
        type="button"
        className="kb-archive-row__delete"
        aria-label="Удалить навсегда"
        onClick={() => onDelete(item)}
      >
        <img
          src={trashButtonIcon}
          alt=""
          aria-hidden="true"
          className="kb-archive-row__delete-icon"
        />
      </button>
    </div>
  );
};

// ─── Страница ────────────────────────────────────────────────────────────────

export const KnowledgeBasePage = () => {
  const treeMenuArchiveLabel = USE_KNOWLEDGE_BASE_MOCK ? 'В архив' : 'Удалить…';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('base');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const expandInitDone = useRef(false);

  const [activeKbItems, setActiveKbItems] = useState<KBItemResponse[]>([]);
  const [archivedKbItems, setArchivedKbItems] = useState<KBItemResponse[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => new Set());
  const [quickLinkByKbId, setQuickLinkByKbId] = useState<Map<string, string>>(() => new Map());
  const [apiUserId, setApiUserId] = useState<string | null>(null);

  const [openedFile, setOpenedFile] = useState<KnowledgeFile | null>(null);
  const [isKbLoading, setIsKbLoading] = useState(true);

  const knowledgeTree = useMemo(() => kbFlatToTree(activeKbItems), [activeKbItems]);

  const archiveItems = useMemo(
    () =>
      kbArchivedFlatToArchiveRows(archivedKbItems, {
        allowRestore: USE_KNOWLEDGE_BASE_MOCK,
        archivedAtLabel: '—',
        deleteInDays: USE_KNOWLEDGE_BASE_MOCK ? 30 : 0,
      }),
    [archivedKbItems],
  );

  const reloadFromApi = useCallback(async () => {
    if (USE_KNOWLEDGE_BASE_MOCK) return;
    const [a, ar] = await Promise.all([fetchKbTree(false), fetchKbTree(true)]);
    setActiveKbItems(a);
    setArchivedKbItems(ar);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsKbLoading(true);
    (async () => {
      try {
        if (USE_KNOWLEDGE_BASE_MOCK) {
          const active = getMockActiveKbItems();
          const archived = getMockArchivedKbItems();
          const uid = import.meta.env.VITE_DEV_USER_ID?.trim() ?? null;
          const links = getMockQuickLinksForUser(uid);
          if (cancelled) return;
          setActiveKbItems(active);
          setArchivedKbItems(archived);
          setQuickLinkByKbId(new Map(links.map((l) => [l.kbItemId, l.id])));
          setBookmarks(new Set(links.map((l) => l.kbItemId)));
          setApiUserId(uid);
          return;
        }
        const uid = await resolveDevUserId();
        if (cancelled) return;
        setApiUserId(uid);
        const [active, archived, ql] = await Promise.all([
          fetchKbTree(false),
          fetchKbTree(true),
          uid ? fetchQuickLinksByUser(uid) : fetchQuickLinksAll(),
        ]);
        if (cancelled) return;
        setActiveKbItems(active);
        setArchivedKbItems(archived);
        const qlFiltered = uid ? ql.filter((l) => l.userId == null || l.userId === uid) : ql;
        setQuickLinkByKbId(new Map(qlFiltered.map((l) => [l.kbItemId, l.id])));
        setBookmarks(new Set(qlFiltered.map((l) => l.kbItemId)));
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) {
          setIsKbLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!openedFile || USE_KNOWLEDGE_BASE_MOCK) return;
    const { id: openId } = openedFile;
    let cancelled = false;
    void (async () => {
      try {
        const fresh = await fetchKbById(openId);
        if (cancelled) return;
        setActiveKbItems((rows) => {
          const idx = rows.findIndex((r) => r.id === fresh.id);
          if (idx < 0) return rows;
          const next = rows.slice();
          next[idx] = fresh;
          return next;
        });
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [openedFile]);

  const defaultExpandedIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (nodes: KnowledgeNode[]) => {
      for (const n of nodes) {
        if (n.type === 'folder') {
          ids.push(n.id);
          if (ids.length >= 2) return;
          walk(n.children);
          if (ids.length >= 2) return;
        }
      }
    };
    walk(knowledgeTree);
    return ids;
  }, [knowledgeTree]);

  useEffect(() => {
    if (expandInitDone.current || knowledgeTree.length === 0) return;
    expandInitDone.current = true;
    setExpanded(new Set(defaultExpandedIds));
  }, [knowledgeTree, defaultExpandedIds]);

  const filteredTree = useMemo(() => filterTree(knowledgeTree, searchQuery), [knowledgeTree, searchQuery]);
  const searchResults = useMemo(
    () => searchNodes(knowledgeTree, searchQuery),
    [knowledgeTree, searchQuery],
  );
  const isSearching = searchQuery.trim().length > 0;

  const allFiles = useMemo(() => flattenFiles(knowledgeTree), [knowledgeTree]);

  const bookmarkedFiles = useMemo(() => {
    const seen = new Set<string>();
    const out: KnowledgeFile[] = [];
    for (const { file } of allFiles) {
      if (!bookmarks.has(file.id) || seen.has(file.id)) continue;
      seen.add(file.id);
      out.push(file);
    }
    return out;
  }, [allFiles, bookmarks]);

  const filteredArchive = useMemo(() => {
    const q = searchQuery.toLocaleLowerCase('ru-RU').trim();
    if (!q) return archiveItems;
    return archiveItems.filter((it) => it.name.toLocaleLowerCase('ru-RU').includes(q));
  }, [archiveItems, searchQuery]);

  const openedArticle = useMemo(
    () => (openedFile ? activeKbItems.find((i) => i.id === openedFile.id) : undefined),
    [openedFile, activeKbItems],
  );

  const openedFileHtml = openedArticle?.content ?? DEFAULT_FILE_CONTENT.trim();

  const toKbRequest = useCallback((row: KBItemResponse): KBItemRequest => {
    return {
      parentId: row.parentId,
      type: row.type,
      title: row.title,
      content: row.type === ItemType.Article ? row.content : null,
    };
  }, []);

  const deleteSubtreeRemote = useCallback(async (rootId: string, items: KBItemResponse[]) => {
    const order = kbCollectSubtreeIds(rootId, items).slice().reverse();
    for (const id of order) {
      await deleteKb(id);
    }
  }, []);

  const handleSaveArticle = useCallback(
    async (html: string) => {
      if (!openedFile) return;
      const cur = activeKbItems.find((i) => i.id === openedFile.id);
      if (!cur || cur.type !== ItemType.Article) return;
      const nextRow: KBItemResponse = { ...cur, content: html };
      if (USE_KNOWLEDGE_BASE_MOCK) {
        setActiveKbItems((rows) => rows.map((r) => (r.id === cur.id ? nextRow : r)));
        return;
      }
      try {
        await updateKb(cur.id, toKbRequest(nextRow));
        await reloadFromApi();
      } catch (e) {
        console.error(e);
      }
    },
    [openedFile, activeKbItems, toKbRequest, reloadFromApi],
  );

  const handleRestore = (item: KnowledgeArchiveItem) => {
    if (!USE_KNOWLEDGE_BASE_MOCK || !item.rootKbId) return;
    const ids = new Set(kbCollectSubtreeIds(item.rootKbId, archivedKbItems));
    const toMove = archivedKbItems.filter((i) => ids.has(i.id));
    setArchivedKbItems((a) => a.filter((i) => !ids.has(i.id)));
    setActiveKbItems((x) => [...x, ...toMove]);
  };

  const handleDeleteArchived = async (item: KnowledgeArchiveItem) => {
    if (!item.rootKbId) return;
    if (USE_KNOWLEDGE_BASE_MOCK) {
      setArchivedKbItems((a) => kbRemoveSubtree(a, item.rootKbId!));
      return;
    }
    try {
      await deleteSubtreeRemote(item.rootKbId, archivedKbItems);
      await reloadFromApi();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBookmark = async (id: string) => {
    if (bookmarks.has(id)) {
      const ql = quickLinkByKbId.get(id);
      if (!USE_KNOWLEDGE_BASE_MOCK && ql) {
        try {
          await deleteQuickLink(ql);
        } catch (e) {
          console.error(e);
          return;
        }
        setQuickLinkByKbId((m) => {
          const n = new Map(m);
          n.delete(id);
          return n;
        });
      }
      setBookmarks((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
      return;
    }
    if (!USE_KNOWLEDGE_BASE_MOCK) {
      if (!apiUserId) return;
      try {
        const newId = await createQuickLink({ userId: apiUserId, kbItemId: id });
        setQuickLinkByKbId((m) => new Map(m).set(id, newId));
      } catch (e) {
        console.error(e);
        return;
      }
    }
    setBookmarks((prev) => {
      const n = new Set(prev);
      n.add(id);
      return n;
    });
  };

  const effectiveExpanded = useMemo(() => {
    if (!isSearching) return expanded;
    const ids = new Set(expanded);
    const collect = (nodes: KnowledgeNode[]) => {
      for (const n of nodes) {
        if (n.type === 'folder') {
          ids.add(n.id);
          collect(n.children);
        }
      }
    };
    collect(filteredTree);
    return ids;
  }, [expanded, filteredTree, isSearching]);

  const handleToggle = (id: string) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const handleSearchQueryChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length > 0) {
      setOpenedFile(null);
    }
  }, []);

  const handleTreeMenuAction = useCallback(
    async (action: TreeNodeMenuAction, node: KnowledgeNode) => {
      if (action === 'rename') {
        const result = window.prompt('Новое имя', node.name);
        if (result === null) return;
        const trimmed = result.trim();
        if (!trimmed || trimmed === node.name) return;
        const row = activeKbItems.find((i) => i.id === node.id);
        if (!row) return;
        const updated: KBItemResponse = { ...row, title: trimmed };
        if (USE_KNOWLEDGE_BASE_MOCK) {
          setActiveKbItems((rows) => rows.map((r) => (r.id === node.id ? updated : r)));
        } else {
          try {
            await updateKb(node.id, toKbRequest(updated));
            await reloadFromApi();
          } catch (e) {
            console.error(e);
          }
        }
        setOpenedFile((open) => (open?.id === node.id ? { ...open, name: trimmed } : open));
        return;
      }

      if (action === 'create-folder' || action === 'create-file') {
        if (node.type !== 'folder') return;
        const parent = node as KnowledgeFolder;
        if (action === 'create-folder') {
          const nameIn = window.prompt('Имя папки', 'Новая папка');
          if (nameIn === null) return;
          const name = nameIn.trim();
          if (!name) return;
          if (USE_KNOWLEDGE_BASE_MOCK) {
            const newId = crypto.randomUUID();
            setActiveKbItems((rows) => [
              ...rows,
              { id: newId, parentId: parent.id, type: ItemType.Folder, title: name, content: null },
            ]);
          } else {
            try {
              await createKb({ parentId: parent.id, type: ItemType.Folder, title: name, content: null });
              await reloadFromApi();
            } catch (e) {
              console.error(e);
            }
          }
          setExpanded((prev) => new Set(prev).add(parent.id));
          return;
        }
        const nameIn = window.prompt('Имя файла', 'Без названия');
        if (nameIn === null) return;
        const name = nameIn.trim();
        if (!name) return;
        const blank = DEFAULT_FILE_CONTENT.trim();
        if (USE_KNOWLEDGE_BASE_MOCK) {
          const newId = crypto.randomUUID();
          setActiveKbItems((rows) => [
            ...rows,
            { id: newId, parentId: parent.id, type: ItemType.Article, title: name, content: blank },
          ]);
        } else {
          try {
            await createKb({ parentId: parent.id, type: ItemType.Article, title: name, content: blank });
            await reloadFromApi();
          } catch (e) {
            console.error(e);
          }
        }
        setExpanded((prev) => new Set(prev).add(parent.id));
        return;
      }

      if (action !== 'archive') return;

      if (USE_KNOWLEDGE_BASE_MOCK) {
        const ids = new Set(kbCollectSubtreeIds(node.id, activeKbItems));
        const toMove = activeKbItems.filter((i) => ids.has(i.id));
        setActiveKbItems((a) => a.filter((i) => !ids.has(i.id)));
        setArchivedKbItems((ar) => [...toMove, ...ar]);
        if (node.type === 'file') {
          setBookmarks((b) => {
            const n = new Set(b);
            n.delete(node.id);
            return n;
          });
          setOpenedFile((o) => (o?.id === node.id ? null : o));
        } else {
          const nested = collectFileIdsInSubtree(node);
          setBookmarks((b) => {
            const n = new Set(b);
            nested.forEach((fid) => n.delete(fid));
            return n;
          });
          setOpenedFile((o) => (o && nested.includes(o.id) ? null : o));
        }
        return;
      }

      const ok = window.confirm(
        'Удалить элемент и всё содержимое с сервера? В текущем API нет переноса в архив — запись будет удалена.',
      );
      if (!ok) return;
      try {
        await deleteSubtreeRemote(node.id, activeKbItems);
        await reloadFromApi();
        if (node.type === 'file') {
          setBookmarks((b) => {
            const n = new Set(b);
            n.delete(node.id);
            return n;
          });
          setOpenedFile((o) => (o?.id === node.id ? null : o));
        } else {
          const nested = collectFileIdsInSubtree(node);
          setBookmarks((b) => {
            const n = new Set(b);
            nested.forEach((fid) => n.delete(fid));
            return n;
          });
          setOpenedFile((o) => (o && nested.includes(o.id) ? null : o));
        }
      } catch (e) {
        console.error(e);
      }
    },
    [activeKbItems, deleteSubtreeRemote, reloadFromApi, toKbRequest],
  );

  const isArchive = activeTab === 'archive';

  const renderWorkspaceContent = () => {
    if (openedFile) {
      return (
        <DocEditor
          file={openedFile}
          html={openedFileHtml}
          isBookmarked={bookmarks.has(openedFile.id)}
          onSave={handleSaveArticle}
          onToggleBookmark={() => void toggleBookmark(openedFile.id)}
          onClose={() => setOpenedFile(null)}
        />
      );
    }

    if (isArchive) {
      return (
        <div
          className={cn('kb-archive-list', isKbLoading && 'kb-archive-list--busy')}
          aria-busy={isKbLoading}
        >
          <div className="kb-archive-list__shadow" aria-hidden="true" />
          {isKbLoading ? (
            <div className="kb-panel__spinner" aria-label="Загрузка" />
          ) : filteredArchive.length === 0 ? (
            <div className="kb-archive-list__empty">
              <span>
                {isSearching
                  ? `Ничего не найдено по запросу «${searchQuery}»`
                  : 'Архив пуст'}
              </span>
            </div>
          ) : (
            <div className="kb-archive-list__inner">
              {filteredArchive.map((item) => (
                <ArchiveRow
                  key={item.id}
                  item={item}
                  query={searchQuery}
                  onRestore={handleRestore}
                  onDelete={(row) => void handleDeleteArchived(row)}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (isSearching) {
      return (
        <div
          className={cn('kb-documents', isKbLoading && 'kb-documents--busy')}
          aria-busy={isKbLoading}
        >
          <div className="kb-documents__inner-shadow" aria-hidden="true" />
          {isKbLoading ? (
            <div className="kb-panel__spinner" aria-label="Загрузка" />
          ) : searchResults.length === 0 ? (
            <div className="kb-documents__empty">
              <span className="kb-documents__empty-icon">🔍</span>
              <span>Ничего не найдено по запросу «{searchQuery}»</span>
            </div>
          ) : (
            <div className="kb-results">
              {searchResults.map((result) => (
                <ResultRow
                  key={result.node.id}
                  result={result}
                  query={searchQuery}
                  onOpenFile={setOpenedFile}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={cn('kb-documents', isKbLoading && 'kb-documents--busy')}
        aria-busy={isKbLoading}
      >
        <div className="kb-documents__inner-shadow" aria-hidden="true" />
        {isKbLoading ? (
          <div className="kb-panel__spinner" aria-label="Загрузка" />
        ) : bookmarkedFiles.length === 0 ? (
          <div className="kb-documents__empty">
            <span className="kb-documents__empty-icon">📌</span>
            <span>
              Здесь появятся файлы, которые вы добавите в закладки. Откройте файл и нажмите
              иконку закладки в нижней панели редактора.
            </span>
          </div>
        ) : (
          <div className="kb-documents__grid">
            {bookmarkedFiles.map((file) => (
              <DocCard key={file.id} file={file} onOpen={setOpenedFile} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="kb-page" aria-busy={isKbLoading}>
      <aside className="kb-sidebar" aria-label="Дерево базы знаний">
        <div className="kb-search">
          <img src={searchIcon} alt="" aria-hidden="true" className="kb-search__icon" />
          <input
            className="kb-search__input"
            type="search"
            value={searchQuery}
            onChange={handleSearchQueryChange}
            placeholder={isArchive ? 'Поиск по архиву' : 'Поиск по базе'}
            aria-label={isArchive ? 'Поиск по архиву' : 'Поиск по базе знаний'}
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              className="kb-search__clear"
              onClick={() => setSearchQuery('')}
              aria-label="Очистить поиск"
            >
              <img src={closeIcon} alt="" aria-hidden="true" className="kb-search__clear-icon" />
            </button>
          )}
        </div>

        {isArchive ? (
          isKbLoading ? (
            <div className="kb-tree" role="status" aria-busy="true" aria-label="Загрузка базы знаний">
              <div className="kb-tree__inner-shadow" aria-hidden="true" />
              <div className="kb-tree__inner kb-tree__inner--busy">
                <div className="kb-panel__spinner" aria-hidden="true" />
              </div>
            </div>
          ) : (
            <div className="kb-archive-empty" role="note">
              <span className="kb-archive-empty__text">
                В архиве иерархия файлов недоступна
              </span>
            </div>
          )
        ) : (
          <div className="kb-tree" role="tree" aria-busy={isKbLoading}>
            <div className="kb-tree__inner-shadow" aria-hidden="true" />
            <div className={cn('kb-tree__inner', isKbLoading && 'kb-tree__inner--busy')}>
              {isKbLoading ? (
                <div className="kb-panel__spinner" aria-label="Загрузка" />
              ) : filteredTree.length === 0 ? (
                <div className="kb-tree__empty">Ничего не найдено</div>
              ) : (
                filteredTree.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    depth={0}
                    expanded={effectiveExpanded}
                    selectedId={openedFile?.id ?? null}
                    query={searchQuery}
                    archiveMenuLabel={treeMenuArchiveLabel}
                    onToggle={handleToggle}
                    onOpenFile={setOpenedFile}
                    onTreeMenuAction={handleTreeMenuAction}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </aside>

      <section className="kb-workspace" aria-label="Документы базы знаний">
        <div className="kb-workspace__tabs" role="tablist" aria-label="Разделы">
          {WORKSPACE_TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              className={cn('kb-workspace__tab', { 'kb-workspace__tab--active': activeTab === id })}
              onClick={() => {
                setActiveTab(id);
                setOpenedFile(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {renderWorkspaceContent()}
      </section>
    </main>
  );
};
