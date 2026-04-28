/** Моковые данные «Базы знаний». Используются до появления API. */

import imagePlaceholder from '../assets/icons/image-placeholder.svg';

/** Положение узла в дереве: родители до текущей папки/файла (без самого узла). */
export interface KnowledgeFileLocation {
  /** Цепочка id папок от корня до прямого родителя. */
  parentFolderIds: string[];
  /** Названия тех же папок для подписей UI и восстановления. */
  pathLabels: string[];
}

export interface KnowledgeFile {
  id: string;
  type: 'file';
  name: string;
  location: KnowledgeFileLocation;
}

export interface KnowledgeFolder {
  id: string;
  type: 'folder';
  name: string;
  location: KnowledgeFileLocation;
  children: KnowledgeNode[];
}

export type KnowledgeNode = KnowledgeFolder | KnowledgeFile;

/** Узел дерева из JSON до вычисления `location` у файлов. */
type RawFile = { id: string; type: 'file'; name: string };
type RawFolder = { id: string; type: 'folder'; name: string; children: RawNode[] };
type RawNode = RawFolder | RawFile;

export function annotateKnowledgeTreeWithLocations(
  nodes: RawNode[],
  ancestorIds: string[] = [],
  ancestorLabels: string[] = [],
): KnowledgeNode[] {
  return nodes.map((node) => {
    if (node.type === 'file') {
      const location: KnowledgeFileLocation = {
        parentFolderIds: [...ancestorIds],
        pathLabels: [...ancestorLabels],
      };
      return { id: node.id, type: 'file', name: node.name, location };
    }
    const folderLoc: KnowledgeFileLocation = {
      parentFolderIds: [...ancestorIds],
      pathLabels: [...ancestorLabels],
    };
    return {
      id: node.id,
      type: 'folder',
      name: node.name,
      location: folderLoc,
      children: annotateKnowledgeTreeWithLocations(
        node.children,
        [...ancestorIds, node.id],
        [...ancestorLabels, node.name],
      ),
    };
  });
}

/** Все id файлов внутри папки (рекурсивно). Для закладок при архивации папки. */
export function collectFileIdsInSubtree(node: KnowledgeNode): string[] {
  if (node.type === 'file') return [node.id];
  return node.children.flatMap((c) => collectFileIdsInSubtree(c));
}

export function treeContainsFolderId(nodes: KnowledgeNode[], folderId: string): boolean {
  for (const node of nodes) {
    if (node.type === 'folder') {
      if (node.id === folderId) return true;
      if (treeContainsFolderId(node.children, folderId)) return true;
    }
  }
  return false;
}

export function removeFolderFromTree(nodes: KnowledgeNode[], folderId: string): KnowledgeNode[] {
  const out: KnowledgeNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      out.push(node);
      continue;
    }
    if (node.id === folderId) continue;
    out.push({
      ...node,
      children: removeFolderFromTree(node.children, folderId),
    });
  }
  return out;
}

function insertFolderUnderParentId(
  nodes: KnowledgeNode[],
  parentId: string,
  folder: KnowledgeFolder,
): KnowledgeNode[] {
  return nodes.map((node) => {
    if (node.type === 'file') return node;
    if (node.id === parentId) {
      if (node.children.some((c) => c.id === folder.id)) return node;
      return { ...node, children: [...node.children, folder] };
    }
    return { ...node, children: insertFolderUnderParentId(node.children, parentId, folder) };
  });
}

/** Вставляет папку под указанную родительскую цепочку (`parentFolderIds` === родитель включающего узла). Пустой массив — на первый уровень деревева вместе с корневыми темами. */
export function insertFolderIntoTree(
  tree: KnowledgeNode[],
  parentFolderIds: string[],
  folder: KnowledgeFolder,
): KnowledgeNode[] {
  if (treeContainsFolderId(tree, folder.id)) return tree;
  if (parentFolderIds.length === 0) {
    return [...tree, folder];
  }
  const parentId = parentFolderIds[parentFolderIds.length - 1]!;
  return insertFolderUnderParentId(tree, parentId, folder);
}

export function treeContainsFileId(nodes: KnowledgeNode[], fileId: string): boolean {
  for (const node of nodes) {
    if (node.type === 'file') {
      if (node.id === fileId) return true;
    } else if (treeContainsFileId(node.children, fileId)) return true;
  }
  return false;
}

export function removeFileFromTree(nodes: KnowledgeNode[], fileId: string): KnowledgeNode[] {
  const out: KnowledgeNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      if (node.id !== fileId) out.push(node);
      continue;
    }
    out.push({
      ...node,
      children: removeFileFromTree(node.children, fileId),
    });
  }
  return out;
}

/** Строит подписи пути по текущему дереву и цепочке id родительских папок. */
export function buildPathLabelsForLocation(
  tree: KnowledgeNode[],
  parentFolderIds: string[],
): string[] {
  const labels: string[] = [];
  let level = tree;
  for (const id of parentFolderIds) {
    const folder = level.find((n) => n.id === id && n.type === 'folder') as KnowledgeFolder | undefined;
    if (!folder) break;
    labels.push(folder.name);
    level = folder.children;
  }
  return labels;
}

function insertFileUnderFolderId(
  nodes: KnowledgeNode[],
  folderId: string,
  file: KnowledgeFile,
): KnowledgeNode[] {
  return nodes.map((node) => {
    if (node.type === 'file') return node;
    if (node.id === folderId) {
      if (node.children.some((c) => c.type === 'file' && c.id === file.id)) return node;
      return { ...node, children: [...node.children, file] };
    }
    return { ...node, children: insertFileUnderFolderId(node.children, folderId, file) };
  });
}

/** Вставляет файл в папку с id === последнему элементу `parentFolderIds`. */
export function insertFileIntoTree(
  tree: KnowledgeNode[],
  parentFolderIds: string[],
  file: Pick<KnowledgeFile, 'id' | 'name' | 'type'>,
): KnowledgeNode[] {
  const pathLabels = buildPathLabelsForLocation(tree, parentFolderIds);
  const location: KnowledgeFileLocation = {
    parentFolderIds: [...parentFolderIds],
    pathLabels,
  };
  const fileNode: KnowledgeFile = { ...file, location };
  const targetId = parentFolderIds[parentFolderIds.length - 1];
  if (!targetId) {
    const firstFolder = tree.find((n) => n.type === 'folder') as KnowledgeFolder | undefined;
    if (!firstFolder) return tree;
    const fallbackIds = [firstFolder.id];
    const labels = buildPathLabelsForLocation(tree, fallbackIds);
    const fbLoc: KnowledgeFileLocation = { parentFolderIds: fallbackIds, pathLabels: labels };
    return insertFileUnderFolderId(tree, firstFolder.id, { ...file, location: fbLoc });
  }
  return insertFileUnderFolderId(tree, targetId, fileNode);
}

/** Полное дерево до вырезания папок, попавших только в мок «Архива». */
const RAW_MOCK_KNOWLEDGE_TREE_FULL: RawNode[] = [
  {
    id: 'folder-1',
    type: 'folder',
    name: 'Онбординг',
    children: [
      {
        id: 'folder-1-1',
        type: 'folder',
        name: 'Для новых сотрудников',
        children: [
          { id: 'file-1-1-1', type: 'file', name: 'Полезные ссылки' },
          { id: 'file-1-1-3', type: 'file', name: 'Корпоративная культура' },
        ],
      },
      {
        id: 'folder-1-2',
        type: 'folder',
        name: 'Для руководителей',
        children: [
          { id: 'file-1-2-1', type: 'file', name: 'Адаптация команды' },
          { id: 'file-1-2-2', type: 'file', name: 'План на 30/60/90 дней' },
        ],
      },
      { id: 'file-1-3', type: 'file', name: 'Чек-лист первого дня' },
    ],
  },
  {
    id: 'folder-2',
    type: 'folder',
    name: 'Регламенты',
    children: [
      { id: 'file-2-1', type: 'file', name: 'Рабочее время и отгулы' },
      { id: 'file-2-2', type: 'file', name: 'Отчётность по проектам' },
      {
        id: 'folder-2-1',
        type: 'folder',
        name: 'Безопасность',
        children: [
          { id: 'file-2-1-2', type: 'file', name: 'Защита персональных данных' },
          { id: 'file-2-1-3', type: 'file', name: 'Инцидент-репортинг' },
        ],
      },
    ],
  },
  {
    id: 'folder-3',
    type: 'folder',
    name: 'Инструменты',
    children: [
      { id: 'file-3-1', type: 'file', name: 'Корпоративный портал' },
      { id: 'file-3-2', type: 'file', name: 'Системы трекинга задач' },
      {
        id: 'folder-3-1',
        type: 'folder',
        name: 'Дизайн',
        children: [
          { id: 'file-3-1-1', type: 'file', name: 'Figma — гайд по библиотекам' },
        ],
      },
    ],
  },
  {
    id: 'folder-4',
    type: 'folder',
    name: 'Обучение',
    children: [
      {
        id: 'folder-4-1',
        type: 'folder',
        name: 'Разработка',
        children: [
          { id: 'file-4-1-1', type: 'file', name: 'Курсы по TypeScript' },
          { id: 'file-4-1-2', type: 'file', name: 'Гайд по код-ревью' },
        ],
      },
      { id: 'file-4-3', type: 'file', name: 'Записи прошедших митапов' },
    ],
  },
  {
    id: 'folder-5',
    type: 'folder',
    name: 'HR и кадры',
    children: [
      { id: 'file-5-1', type: 'file', name: 'Анкета сотрудника' },
      { id: 'file-5-3', type: 'file', name: 'Отпуск и больничный' },
    ],
  },
];

function stripFolderNodesFromRaw(nodes: RawNode[], removeIds: Set<string>): RawNode[] {
  const out: RawNode[] = [];
  for (const node of nodes) {
    if (node.type === 'folder') {
      if (removeIds.has(node.id)) continue;
      out.push({
        ...node,
        children: stripFolderNodesFromRaw(node.children, removeIds),
      });
    } else {
      out.push(node);
    }
  }
  return out;
}

function cloneFolderSubtree(tree: KnowledgeNode[], folderId: string): KnowledgeFolder | undefined {
  for (const n of tree) {
    if (n.type === 'folder') {
      if (n.id === folderId) return structuredClone(n) as KnowledgeFolder;
      const inner = cloneFolderSubtree(n.children, folderId);
      if (inner) return inner;
    }
  }
  return undefined;
}

/** Папки, которые в начальном состоянии только в архиве (снимок с полного дерева). */
const ARCHIVE_MOCK_REMOVED_FOLDER_IDS = new Set([
  'folder-1-1',
  'folder-1-2',
  'folder-2-1',
  'folder-3-1',
  'folder-4-1',
  'folder-5',
]);

const RAW_MOCK_KNOWLEDGE_TREE = stripFolderNodesFromRaw(
  RAW_MOCK_KNOWLEDGE_TREE_FULL,
  ARCHIVE_MOCK_REMOVED_FOLDER_IDS,
);

const ANNOTATED_TREE_FULL_FOR_SNAPSHOTS = annotateKnowledgeTreeWithLocations(RAW_MOCK_KNOWLEDGE_TREE_FULL);

const MOCK_ARCHIVE_FOLDER_SYNTH = annotateKnowledgeTreeWithLocations([
  {
    id: 'archive-mock-folder-synth',
    type: 'folder',
    name: 'HR-процессы и формы',
    children: [{ id: 'archive-mock-file-synth', type: 'file', name: 'Сводка процессов' }],
  },
])[0] as KnowledgeFolder;

const ARCHIVE_SNAP_FOLDER_1_1 = cloneFolderSubtree(ANNOTATED_TREE_FULL_FOR_SNAPSHOTS, 'folder-1-1')!;
const ARCHIVE_SNAP_FOLDER_1_2 = cloneFolderSubtree(ANNOTATED_TREE_FULL_FOR_SNAPSHOTS, 'folder-1-2')!;
const ARCHIVE_SNAP_FOLDER_2_1 = cloneFolderSubtree(ANNOTATED_TREE_FULL_FOR_SNAPSHOTS, 'folder-2-1')!;
const ARCHIVE_SNAP_FOLDER_3_1 = cloneFolderSubtree(ANNOTATED_TREE_FULL_FOR_SNAPSHOTS, 'folder-3-1')!;
const ARCHIVE_SNAP_FOLDER_4_1 = cloneFolderSubtree(ANNOTATED_TREE_FULL_FOR_SNAPSHOTS, 'folder-4-1')!;
const ARCHIVE_SNAP_FOLDER_5 = cloneFolderSubtree(ANNOTATED_TREE_FULL_FOR_SNAPSHOTS, 'folder-5')!;

export const mockKnowledgeTree: KnowledgeNode[] = annotateKnowledgeTreeWithLocations(
  RAW_MOCK_KNOWLEDGE_TREE,
);

/**
 * Запись в архиве «Базы знаний». Содержит дату попадания в архив и
 * количество дней до автоматического удаления.
 */
export interface KnowledgeArchiveItem {
  id: string;
  /** Тип записи — папка или одиночный файл. Влияет на иконку строки. */
  kind: 'folder' | 'file';
  /** Имя папки/файла. */
  name: string;
  /** Дата попадания в архив (в человекочитаемом виде). */
  archivedAt: string;
  /** Сколько дней осталось до окончательного удаления. */
  deleteInDays: number;
  /** Для восстановления файла в дерево: id в «Базе знаний» и путь к папке. */
  originalFileId?: string;
  /** Для папки: id в дереве. */
  originalFolderId?: string;
  /** Серпов удалённой папки со всем содержимым (необходимо для восстановления в базу). */
  storedFolderSubtree?: KnowledgeFolder;
  restoreParentFolderIds?: string[];
  restorePathLabels?: string[];
}

export const mockKnowledgeArchive: KnowledgeArchiveItem[] = [
  {
    id: 'archive-1',
    kind: 'folder',
    name: 'Для новых сотрудников',
    archivedAt: '25 сентября',
    deleteInDays: 12,
    originalFolderId: 'folder-1-1',
    storedFolderSubtree: ARCHIVE_SNAP_FOLDER_1_1,
    restoreParentFolderIds: ['folder-1'],
    restorePathLabels: ['Онбординг'],
  },
  {
    id: 'archive-2',
    kind: 'file',
    name: 'Командировки и расходы',
    archivedAt: '03 октября',
    deleteInDays: 1,
    originalFileId: 'file-2-3',
    restoreParentFolderIds: ['folder-2'],
    restorePathLabels: ['Регламенты'],
  },
  {
    id: 'archive-3',
    kind: 'folder',
    name: 'Для руководителей',
    archivedAt: '17 августа',
    deleteInDays: 45,
    originalFolderId: 'folder-1-2',
    storedFolderSubtree: ARCHIVE_SNAP_FOLDER_1_2,
    restoreParentFolderIds: ['folder-1'],
    restorePathLabels: ['Онбординг'],
  },
  {
    id: 'archive-4',
    kind: 'file',
    name: 'FAQ для новичков',
    archivedAt: '11 ноября',
    deleteInDays: 7,
    originalFileId: 'file-1-4',
    restoreParentFolderIds: ['folder-1'],
    restorePathLabels: ['Онбординг'],
  },
  {
    id: 'archive-5',
    kind: 'file',
    name: 'Мессенджеры и связь',
    archivedAt: '29 июля',
    deleteInDays: 21,
    originalFileId: 'file-3-3',
    restoreParentFolderIds: ['folder-3'],
    restorePathLabels: ['Инструменты'],
  },
  {
    id: 'archive-6',
    kind: 'folder',
    name: 'Безопасность',
    archivedAt: '02 января',
    deleteInDays: 3,
    originalFolderId: 'folder-2-1',
    storedFolderSubtree: ARCHIVE_SNAP_FOLDER_2_1,
    restoreParentFolderIds: ['folder-2'],
    restorePathLabels: ['Регламенты'],
  },
  {
    id: 'archive-7',
    kind: 'file',
    name: 'Гайд по доступам',
    archivedAt: '14 февраля',
    deleteInDays: 60,
    originalFileId: 'file-1-1-2',
    restoreParentFolderIds: ['folder-1', 'folder-1-1'],
    restorePathLabels: ['Онбординг', 'Для новых сотрудников'],
  },
  {
    id: 'archive-8',
    kind: 'folder',
    name: 'Разработка',
    archivedAt: '06 декабря',
    deleteInDays: 2,
    originalFolderId: 'folder-4-1',
    storedFolderSubtree: ARCHIVE_SNAP_FOLDER_4_1,
    restoreParentFolderIds: ['folder-4'],
    restorePathLabels: ['Обучение'],
  },
  {
    id: 'archive-9',
    kind: 'file',
    name: 'Политика паролей',
    archivedAt: '23 марта',
    deleteInDays: 90,
    originalFileId: 'file-2-1-1',
    restoreParentFolderIds: ['folder-2', 'folder-2-1'],
    restorePathLabels: ['Регламенты', 'Безопасность'],
  },
  {
    id: 'archive-10',
    kind: 'file',
    name: 'Внутренние воркшопы',
    archivedAt: '08 мая',
    deleteInDays: 15,
    originalFileId: 'file-4-2',
    restoreParentFolderIds: ['folder-4'],
    restorePathLabels: ['Обучение'],
  },
  {
    id: 'archive-11',
    kind: 'folder',
    name: 'Дизайн',
    archivedAt: '19 апреля',
    deleteInDays: 11,
    originalFolderId: 'folder-3-1',
    storedFolderSubtree: ARCHIVE_SNAP_FOLDER_3_1,
    restoreParentFolderIds: ['folder-3'],
    restorePathLabels: ['Инструменты'],
  },
  {
    id: 'archive-12',
    kind: 'file',
    name: 'Бенефиты и ДМС',
    archivedAt: '30 июня',
    deleteInDays: 5,
    originalFileId: 'file-5-2',
    restoreParentFolderIds: ['folder-5'],
    restorePathLabels: ['HR и кадры'],
  },
  {
    id: 'archive-13',
    kind: 'folder',
    name: 'HR и кадры',
    archivedAt: '12 октября',
    deleteInDays: 28,
    originalFolderId: 'folder-5',
    storedFolderSubtree: ARCHIVE_SNAP_FOLDER_5,
    restoreParentFolderIds: [],
    restorePathLabels: [],
  },
  {
    id: 'archive-14',
    kind: 'file',
    name: 'Brand book',
    archivedAt: '04 февраля',
    deleteInDays: 19,
    originalFileId: 'file-3-1-2',
    restoreParentFolderIds: ['folder-3', 'folder-3-1'],
    restorePathLabels: ['Инструменты', 'Дизайн'],
  },
  {
    id: 'archive-15',
    kind: 'folder',
    name: 'HR-процессы и формы',
    archivedAt: '21 сентября',
    deleteInDays: 4,
    originalFolderId: 'archive-mock-folder-synth',
    storedFolderSubtree: MOCK_ARCHIVE_FOLDER_SYNTH,
    restoreParentFolderIds: ['folder-4'],
    restorePathLabels: ['Обучение'],
  },
  {
    id: 'archive-16',
    kind: 'file',
    name: 'Архитектура микросервисов',
    archivedAt: '07 января',
    deleteInDays: 33,
    originalFileId: 'file-4-1-3',
    restoreParentFolderIds: ['folder-4', 'folder-4-1'],
    restorePathLabels: ['Обучение', 'Разработка'],
  },
  {
    id: 'archive-17',
    kind: 'file',
    name: 'VPN и удалённый доступ',
    archivedAt: '15 ноября',
    deleteInDays: 8,
    originalFileId: 'file-3-4',
    restoreParentFolderIds: ['folder-3'],
    restorePathLabels: ['Инструменты'],
  },
];

// ─── Контент файлов ───────────────────────────────────────────────────────────
//
// HTML-контент для каждого файла из дерева. Используется как стартовый текст
// в редакторе TipTap. По договорённости моки используют только тот набор
// элементов, который соответствует возможностям тулбара BubbleMenu:
// заголовок <h1>, обычные параграфы, форматирование текста (<strong>,
// <em>, <u>), ссылки <a> и картинки <img>. Списков, заголовков уровня h2/h3,
// цитат, inline-кода и разделителей в моках намеренно нет.

/** Базовый контент для файлов, у которых нет персонального текста. */
export const DEFAULT_FILE_CONTENT = `
<h1>Документ без описания</h1>
<p>Этот файл пока не наполнен контентом. Вы можете <strong>отредактировать</strong> его прямо здесь — поддерживаются <em>курсив</em>, <strong>жирное</strong> начертание, <u>подчёркивание</u> и ссылки.</p>
<p>Например, попробуйте выделить любое слово и нажать <span class="kb-editor__highlight">B</span>, <span class="kb-editor__highlight">I</span> или <span class="kb-editor__highlight">U</span> на плавающем тулбаре сверху — повторное нажатие снимет форматирование.</p>
`;

export const mockKnowledgeFileContents: Record<string, string> = {
  // ── Онбординг / Для новых сотрудников ─────────────────────────────────────
  'file-1-1-1': `
<h1>Полезные ссылки</h1>
<p>Подборка ресурсов, которые пригодятся в первые недели работы. Сохраните страницу в закладки — мы регулярно её обновляем.</p>
<p><strong>Корпоративные сервисы.</strong> <a href="https://portal.example.com">Корпоративный портал</a> — заявления, расчётные листы, бронирование переговорок. <a href="https://wiki.example.com">Внутренняя Wiki</a> — техническая документация и регламенты. <a href="https://tasks.example.com">Трекер задач</a> — рабочие тикеты и спринты.</p>
<p><strong>Внешние материалы.</strong> <a href="https://learn.javascript.ru">Современный учебник JavaScript</a>, <a href="https://www.typescriptlang.org/docs/">TypeScript Handbook</a>, <a href="https://refactoring.guru/ru">Рефакторинг и паттерны</a>.</p>
<p><em>Если знаете полезный ресурс — напишите в канал <strong>#knowledge-share</strong>.</em></p>
`,

  'file-1-1-2': `
<h1>Гайд по доступам</h1>
<p>В первый рабочий день вам предоставляются <strong>базовые</strong> корпоративные доступы. Остальные вы заказываете самостоятельно через портал.</p>
<p><strong>Что выдаётся автоматически.</strong> Корпоративная почта вида name@example.com, учётная запись в <strong>SSO</strong> (Single Sign-On), доступ к Wiki и общему диску.</p>
<p><strong>Как заказать дополнительный доступ.</strong> Зайдите на <a href="https://portal.example.com/access">portal.example.com/access</a>, выберите систему и нужную роль, дождитесь согласования у руководителя — обычно <em>1–2 рабочих дня</em>.</p>
<p>Не передавайте пароли коллегам и не сохраняйте их в текстовых файлах. Используйте <strong>1Password</strong> или <strong>Bitwarden</strong>. Возникли проблемы? Пишите в <span class="kb-editor__highlight">#it-support</span> — отвечаем в течение часа.</p>
`,

  'file-1-1-3': `
<h1>Корпоративная культура</h1>
<p>Мы строим компанию вокруг трёх простых принципов: <strong>уважение</strong>, <strong>честность</strong> и <u>результат</u>. Эти ценности проявляются в каждом нашем решении — от найма до архитектурных встреч.</p>
<p><em>«Лучше открыто признать ошибку, чем тихо ждать, пока её найдут»</em> — внутренний манифест команды.</p>
<p>Что мы поощряем: открытое обсуждение проблем и идей, письменную фиксацию решений, ответственность за свой код и за процесс в целом.</p>
<img src="${imagePlaceholder}" alt="" class="kb-editor__image" />
<p>Мы не любим бюрократию ради бюрократии: если правило мешает делу — обсудите его на ближайшей <em>ретроспективе</em>.</p>
`,

  // ── Онбординг / Для руководителей ─────────────────────────────────────────
  'file-1-2-1': `
<h1>Адаптация команды</h1>
<p>Эта инструкция — для тех, кто принимает в команду нового человека. Хорошая адаптация экономит компании <strong>3–4 месяца</strong> продуктивности.</p>
<p><strong>До выхода сотрудника.</strong> Согласуйте с HR дату и формат выхода. Подготовьте <em>welcome-pack</em>: ноутбук, доступы, аккаунт в трекере. Назначьте <strong>бадди</strong> — это коллега, который отвечает на бытовые вопросы.</p>
<p><strong>Первая неделя.</strong> Ежедневные 15-минутные синки. Знакомство с командой по 1-on-1. Маленькая рабочая задача, которую можно довести до конца за 2–3 дня.</p>
<p><em>Если на 5-й день человек не сделал ни одного коммита — это сигнал, а не норма.</em></p>
`,

  'file-1-2-2': `
<h1>План на 30/60/90 дней</h1>
<p>Структурированный подход к первым трём месяцам сотрудника. Используйте этот шаблон как чек-лист на регулярных 1-on-1.</p>
<p><strong>Первые 30 дней — <em>учусь</em>.</strong> Понимаю продукт, команду и ключевые процессы. Закрываю простые задачи без помощи бадди. Знаю, кто за что отвечает.</p>
<p><strong>60 дней — <em>включаюсь</em>.</strong> Беру задачи среднего размера и довожу их до прода. Активно участвую в код-ревью. Предлагаю первые улучшения процессов.</p>
<p><strong>90 дней — <em>влияю</em>.</strong> Веду небольшую инициативу как ответственный. Помогаю онбордить следующих новичков. Имею <strong>измеримый</strong> вклад в команду.</p>
<p><strong>Важно:</strong> план — это ориентир, а не контракт. Подстраивайте сроки под реальную сложность ролей.</p>
`,

  // ── Онбординг — корневые файлы ─────────────────────────────────────────────
  'file-1-3': `
<h1>Чек-лист первого дня</h1>
<p>Распечатайте или сохраните себе — этого достаточно, чтобы спокойно прожить первый рабочий день.</p>
<p><strong>До обеда.</strong> Получить пропуск и ноутбук на ресепшн. Войти в почту и подтвердить <strong>2FA</strong>. Зайти на корпоративный портал и заполнить профиль. Установить мессенджер и присоединиться к каналам команды.</p>
<p><strong>После обеда.</strong> Знакомство с командой — около 15 минут на человека. Краткий обзор продукта от <em>тимлида</em>. Прочитать страницу <a href="#">«Корпоративная культура»</a>. Задать минимум <strong>три</strong> вопроса бадди.</p>
<p><em>Не стесняйтесь спрашивать.</em> Глупых вопросов в первый день не существует — есть только незаданные.</p>
`,

  'file-1-4': `
<h1>FAQ для новичков</h1>
<p>Ответы на вопросы, которые задают <em>почти все</em>. Если вашего вопроса здесь нет — напишите HR, и мы добавим.</p>
<p><strong>Когда я получу первую зарплату?</strong> Аванс — <strong>20 числа</strong>, основная часть — <strong>5 числа</strong> следующего месяца. Подробности — в личном кабинете.</p>
<p><strong>Где взять справку 2-НДФЛ?</strong> На корпоративном портале в разделе документов. Готовится автоматически за 1–2 минуты.</p>
<p><strong>Можно ли работать из другого города?</strong> Да, но не больше <strong>14 дней подряд</strong> без согласования. Дольше — нужно <em>письменно</em> согласовать с руководителем и HR.</p>
<p>Не нашли ответа? Напишите в <span class="kb-editor__highlight">#hr-questions</span>.</p>
`,

  // ── Регламенты ─────────────────────────────────────────────────────────────
  'file-2-1': `
<h1>Рабочее время и отгулы</h1>
<p>В компании действует <strong>гибкий</strong> график. Главное — присутствие на ключевых встречах и закрытие задач в срок.</p>
<p><strong>Базовые правила.</strong> Стандартный рабочий день — <strong>8 часов</strong>. Ядро присутствия — с <em>11:00 до 16:00</em> по часовому поясу команды. Перерыв на обед — 1 час, не учитывается в рабочем времени.</p>
<p><strong>Как взять отгул.</strong> Согласуйте дату с руководителем за 2 рабочих дня. Создайте заявку в <a href="https://portal.example.com/leave">портале самообслуживания</a>. Дождитесь согласования — приходит уведомление в почту.</p>
<p><em>Отгул — не подарок, а механизм восстановления.</em> Берите их без чувства вины, если устали.</p>
`,

  'file-2-2': `
<h1>Отчётность по проектам</h1>
<p>Прозрачная отчётность экономит часы на статус-встречах. Мы используем <strong>еженедельные</strong> и <strong>ежемесячные</strong> срезы.</p>
<p><strong>Еженедельный отчёт</strong> сдаётся каждую <em>пятницу до 17:00</em>: что сделано (3–5 пунктов с тикетами), что планируется на следующую неделю, какие есть блокеры.</p>
<p><strong>Ежемесячный обзор</strong> включает свод метрик по командной OKR, демо ключевых фич и ретроспективу процессов.</p>
<p>Шаблоны отчётов лежат в Wiki: <a href="#">templates/reports</a>.</p>
`,

  'file-2-3': `
<h1>Командировки и расходы</h1>
<p>Если вы летите по работе — компания компенсирует <strong>все обоснованные</strong> расходы. Для этого важно <em>заранее</em> оформить поездку.</p>
<p><strong>Что компенсируется.</strong> Авиа- и ж/д-билеты эконом-класса. Проживание до <strong>8 000 ₽</strong>/сутки. Такси и общественный транспорт по чекам. Питание — <strong>1 500 ₽</strong>/сутки без чеков, выше — по чекам.</p>
<p><strong>Что не компенсируется.</strong> Алкоголь и развлечения. Поездки родственников. Дополнительные услуги отеля — мини-бар, прачечная сверх лимита и аналогичное.</p>
<p>Авансовый отчёт сдаётся в течение <strong>3 рабочих дней</strong> после возвращения. <em>Иначе следующая поездка не согласовывается.</em></p>
`,

  // ── Регламенты / Безопасность ──────────────────────────────────────────────
  'file-2-1-1': `
<h1>Политика паролей</h1>
<p>Слабый пароль — это <em>уязвимость на четыре года</em>. Соблюдайте минимальные требования и используйте менеджер паролей.</p>
<p><strong>Минимальные требования.</strong> Длина — не менее <strong>14 символов</strong>, заглавные и строчные буквы, цифры и спецсимволы. <u>Не использовать</u> имя, дату рождения и адрес. Уникальный пароль для каждого сервиса.</p>
<p><strong>Что делать сразу.</strong> Установите <strong>1Password</strong> или <strong>Bitwarden</strong>. Включите <strong>2FA</strong> на корпоративных сервисах. Раз в полгода проверяйте утечки на <a href="https://haveibeenpwned.com">haveibeenpwned.com</a>.</p>
<p><em>Если вы записываете пароль на стикере — это не пароль, а напоминалка для злоумышленника.</em> Ротация паролей по расписанию — <strong>раз в 90 дней</strong> для админских доступов.</p>
`,

  'file-2-1-2': `
<h1>Защита персональных данных</h1>
<p>Мы храним и обрабатываем персональные данные сотрудников и клиентов в соответствии с <strong>152-ФЗ</strong> и внутренней политикой ИБ.</p>
<p><strong>Что считается персональными данными.</strong> ФИО, дата рождения, паспортные данные. Контактные телефоны и адреса. Биометрия и медицинские сведения. Любые данные, по которым можно <em>однозначно</em> идентифицировать человека.</p>
<p><strong>Как с ними работать.</strong> Хранить только в одобренных хранилищах. Передавать через сквозное шифрование или защищённые каналы. Удалять, как только цель обработки достигнута.</p>
<p>Утечка ПДн — это не «технический инцидент», а <strong>репутационная катастрофа</strong> и штраф до 18 миллионов рублей.</p>
`,

  'file-2-1-3': `
<h1>Инцидент-репортинг</h1>
<p>Если вы заметили <em>что-то странное</em> — лучше сообщить, чем промолчать. Мы не наказываем за ложные срабатывания.</p>
<p><strong>Признаки инцидента.</strong> Неожиданные письма со ссылками или вложениями. Подозрительные авторизации в SSO. Утечка чувствительных данных в публичный канал. Странное поведение рабочего ноутбука.</p>
<p><strong>Как сообщить.</strong> Напишите в <span class="kb-editor__highlight">#security-incidents</span>. <em>Не пытайтесь «разобраться сами»</em> — этим вы можете уничтожить улики. Заполните карточку инцидента по шаблону SEC-INC.</p>
<p><strong>Реакция SOC — 15 минут</strong> в рабочее время и до 1 часа ночью.</p>
`,

  // ── Инструменты ─────────────────────────────────────────────────────────────
  'file-3-1': `
<h1>Корпоративный портал</h1>
<p>Портал — это <strong>единая точка входа</strong> ко всем кадровым и административным сервисам компании.</p>
<p><strong>Что можно сделать на портале.</strong> Заказать справку 2-НДФЛ или с места работы. Подать заявление на отпуск или командировку. Заказать оборудование и канцелярию. Согласовать договор с подрядчиком. Посмотреть расчётный лист.</p>
<p><strong>Авторизация</strong> — через <strong>SSO</strong> с обязательной <em>двухфакторной аутентификацией</em>. Ссылка: <a href="https://portal.example.com">portal.example.com</a>.</p>
<p>Если портал тормозит — это не повод откладывать заявление. У нас есть резервный канал в боте: пишите туда, помогут.</p>
`,

  'file-3-2': `
<h1>Системы трекинга задач</h1>
<p>В компании используется единый трекер для <strong>всех</strong> технических команд. Цель — прозрачность и отсутствие задач, спрятанных в личных тудушках.</p>
<p><strong>Основные сущности.</strong> Эпик — крупная инициатива на квартал. Задача — единица работы на 1–5 дней. Подзадача — атомарный шаг внутри задачи. Баг — отдельный тип со своим SLA.</p>
<p><strong>Минимальные требования к карточке.</strong> Понятное название (без <em>«доделать вчерашнее»</em>). Описание с <strong>Definition of Done</strong>. Связь с эпиком и/или OKR. Оценка трудоёмкости.</p>
<p>Готовые шаблоны карточек — в команде «template» бота трекера.</p>
`,

  'file-3-3': `
<h1>Мессенджеры и связь</h1>
<p>Мы стараемся не плодить инструменты. Все рабочие коммуникации — в одном корпоративном мессенджере.</p>
<p><strong>Каналы по умолчанию.</strong> <span class="kb-editor__highlight">#general</span> — анонсы для всей компании. <span class="kb-editor__highlight">#random</span> — мемы, котики, нерабочие темы. <span class="kb-editor__highlight">#help</span> — общие вопросы по бытовым задачам. <span class="kb-editor__highlight">#it-support</span> — заявки на ИТ-помощь.</p>
<p><strong>Этикет.</strong> Не пишите «Привет?» и ждите — сразу формулируйте вопрос. Используйте треды для <em>длинных</em> обсуждений. Звонки — по согласованию, кроме экстренных случаев.</p>
<p><strong>Не</strong> используйте личные мессенджеры (Telegram, WhatsApp) для рабочих обсуждений с чувствительными данными.</p>
`,

  'file-3-4': `
<h1>VPN и удалённый доступ</h1>
<p>Удалённый доступ к внутренним сервисам осуществляется только через корпоративный <strong>VPN</strong>. Никаких <em>«пока сойдёт и так»</em>.</p>
<p><strong>Как подключить VPN.</strong> Скачайте клиент с портала: <a href="https://portal.example.com/vpn">portal.example.com/vpn</a>. Установите клиент и импортируйте профиль company.ovpn. Авторизуйтесь через SSO с 2FA. Проверьте подключение — внутренний адрес должен открыться.</p>
<p><strong>Что нельзя.</strong> Подключаться с <strong>личных</strong> устройств без MDM. Делиться профилем VPN с коллегами. Использовать публичный Wi-Fi без VPN-сессии.</p>
<p>Если VPN не подключается — пишите в <span class="kb-editor__highlight">#it-support</span> с логами клиента.</p>
`,

  // ── Инструменты / Дизайн ────────────────────────────────────────────────────
  'file-3-1-1': `
<h1>Figma — гайд по библиотекам</h1>
<p>Все продуктовые экраны строятся <strong>только</strong> из компонентов нашей дизайн-системы. Это сокращает время и поддерживает консистентность.</p>
<p><strong>Подключение библиотек.</strong> Откройте <em>Assets → Libraries</em>. Включите <strong>Moskvin Design</strong> — это основная библиотека. При необходимости — <strong>Moskvin Charts</strong> для графиков. Сохраните файл и перезагрузите.</p>
<p><strong>Когда нужен новый компонент.</strong> Аналогичный паттерн встречается на 3+ экранах. Существующий компонент не покрывает кейс даже после <em>variants</em>. Поведение требует токена, которого нет в системе.</p>
<p><em>Прежде чем рисовать что-то новое — спросите в</em> <span class="kb-editor__highlight">#design-system</span>. Возможно, это уже есть.</p>
`,

  'file-3-1-2': `
<h1>Brand book</h1>
<p>Brand book — наш «учебник» о том, как компания <em>звучит</em> и <em>выглядит</em>. Опирайтесь на него во всём, что становится <strong>публичным</strong>.</p>
<p><strong>Tone of voice.</strong> Простой язык вместо «эффективного синергетического подхода». Уважение к клиенту, без панибратства. Конкретика и цифры там, где они уместны.</p>
<p><strong>Цветовая палитра.</strong> Основной акцент — <strong>тёмно-синий</strong>, фоны — мягкие тёплые серые. Контрастные цвета используются точечно, не больше <em>10%</em> площади.</p>
<img src="${imagePlaceholder}" alt="" class="kb-editor__image" />
<p>Полная версия brand book — в файле brand-book-v2.pdf в общем диске.</p>
`,

  // ── Обучение / Разработка ───────────────────────────────────────────────────
  'file-4-1-1': `
<h1>Курсы по TypeScript</h1>
<p>Подборка обучающих материалов от <em>джуна</em> до <em>сеньора</em>. Все курсы согласованы с тимлидами и оплачиваются компанией.</p>
<p><strong>Для начинающих.</strong> <a href="https://learn.javascript.ru">Современный учебник JavaScript</a> — фундамент. <a href="https://www.typescriptlang.org/docs/handbook/">TypeScript Handbook</a> — официально и бесплатно. Курс <strong>«TypeScript для джунов»</strong> на платформе htmlacademy.</p>
<p><strong>Уровень <em>middle</em>:</strong> Effective TypeScript (книга, 62 правила), Advanced Types — внутренние воркшопы по средам, парные сессии с тимлидом по архитектуре типов.</p>
<p><strong>Уровень <em>senior</em>:</strong> Type-Level TypeScript (продвинутые типы и метапрограммирование), чтение и обсуждение исходников zod и tanstack-query.</p>
<p>Заявку на курс отправляйте через портал — раздел <em>Обучение</em>. Бюджет на сотрудника — <strong>60 000 ₽ в год</strong>.</p>
`,

  'file-4-1-2': `
<h1>Гайд по код-ревью</h1>
<p>Ревью — это не <em>«поиск виноватого»</em>, а способ научиться у коллеги и поделиться знанием. Тон уважительный, формулировки — конкретные.</p>
<p><strong>Что проверяем в первую очередь.</strong> Покрывает ли код заявленный сценарий. Тесты — есть ли они и проверяют ли граничные случаи. Безопасность и обработка ошибок. Читаемость: имена, размер функций, побочные эффекты.</p>
<p><strong>Чего не делаем.</strong> Не переписываем стиль ради стиля — для этого есть линтер. Не оставляем токсичных комментариев. Не блокируем merge из-за <em>вкусовых</em> придирок.</p>
<p><em>«Код-ревью — это разговор, а не суд».</em> Пишите так, как хотели бы, чтобы написали вам. Целевое время первого ответа — <strong>4 часа</strong>, полного цикла — 1 рабочий день.</p>
`,

  'file-4-1-3': `
<h1>Архитектура микросервисов</h1>
<p>Этот документ описывает <strong>наш</strong> взгляд на микросервисную архитектуру. Он не про абсолютную истину, а про общие договорённости.</p>
<p><strong>Когда микросервис оправдан.</strong> Нужна <em>независимая</em> команда и релизный цикл. Разные требования к нагрузке у разных частей системы. Чётко выделенный домен с собственной моделью данных.</p>
<p><strong>Когда микросервис — лишний.</strong> Команда из 2–3 человек на весь проект. Прототип или MVP, который ещё может развернуться. Единый домен с большим количеством общих сущностей.</p>
<p><em>Сначала монолит, потом — микросервисы.</em> Распиливать проще, чем сшивать обратно.</p>
<img src="${imagePlaceholder}" alt="" class="kb-editor__image" />
<p>Подробное руководство по выделению сервисов — в файле service-extraction.md.</p>
`,

  // ── Обучение — корневые файлы ───────────────────────────────────────────────
  'file-4-2': `
<h1>Внутренние воркшопы</h1>
<p>Каждую среду в 17:00 — открытый воркшоп. Темы выбираем голосованием в <span class="kb-editor__highlight">#workshops</span>.</p>
<p><strong>Текущий цикл.</strong> <strong>Архитектура фронтенда</strong> — 6 встреч. <strong>Базы данных под нагрузкой</strong> — 4 встречи. <strong>Безопасность веб-приложений</strong> — 3 встречи.</p>
<p><strong>Как предложить тему.</strong> Опишите тему в одно предложение. Укажите, на кого рассчитан воркшоп: <em>джуны</em>, <em>миддлы</em>, <em>любые</em>. Если есть <strong>спикер</strong> — укажите его, иначе мы найдём.</p>
<p><em>Лучшие воркшопы — те, где больше половины времени отдаётся на вопросы и практику.</em></p>
`,

  'file-4-3': `
<h1>Записи прошедших митапов</h1>
<p>Все встречи записываются (если докладчик не против) и складываются в архив. Удобно пересмотреть на 1.5x во время обеда.</p>
<p><strong>Топ просмотров за квартал.</strong> <a href="#">«Как мы переехали с REST на GraphQL»</a> — 312 просмотров. <a href="#">«Внутренний дизайн-токен engine»</a> — 248 просмотров. <a href="#">«Профилирование Node.js в проде»</a> — 197 просмотров.</p>
<p><strong>Как пользоваться архивом.</strong> Поиск — по тегам и фамилии докладчика. Расшифровка генерируется автоматически, можно <em>искать по тексту</em>. Слайды доступны рядом с видео.</p>
<p>Если доклад вам пригодился — поставьте <span class="kb-editor__highlight">+1</span> в треде. Это влияет на выбор следующих тем.</p>
`,

  // ── HR и кадры ─────────────────────────────────────────────────────────────
  'file-5-1': `
<h1>Анкета сотрудника</h1>
<p>Анкета заполняется один раз и потом уточняется. Используется для оформления документов, оплаты налогов и связи в нерабочих ситуациях.</p>
<p><strong>Обязательные поля.</strong> ФИО — как в паспорте. Дата рождения. СНИЛС и ИНН. Реквизиты счёта для зарплаты.</p>
<p><strong>Опциональные поля.</strong> Контакт <strong>экстренной связи</strong>. Дата рождения детей (для оформления выплат). Особенности здоровья, важные для работы.</p>
<p><em>Анкета хранится в зашифрованном виде, доступ — только у HR-команды и службы безопасности.</em></p>
`,

  'file-5-2': `
<h1>Бенефиты и ДМС</h1>
<p>Кроме зарплаты, у каждого сотрудника есть пакет дополнительных льгот. Они <strong>не</strong> зачитываются в зарплату — это отдельная статья.</p>
<p><strong>Что входит.</strong> <strong>ДМС</strong> со стоматологией после 6 месяцев работы. Компенсация спорта — до <strong>3 000 ₽</strong> в месяц. Бюджет на обучение — <em>60 000 ₽</em> в год. Психологические консультации — 4 встречи в год бесплатно.</p>
<p><strong>Как оформить ДМС.</strong> Получите письмо со ссылкой на личный кабинет страховой. Подтвердите данные и подпишите согласие. Скачайте полис в приложение.</p>
<img src="${imagePlaceholder}" alt="" class="kb-editor__image" />
<p>Полный список бенефитов и условий — на странице <a href="#">benefits/all</a>.</p>
`,

  'file-5-3': `
<h1>Отпуск и больничный</h1>
<p>Главный принцип — <strong>предсказуемость</strong>. Заранее планируйте отпуска и сразу сообщайте о больничном.</p>
<p><strong>Отпуск</strong> — <strong>28 календарных дней</strong> в год. Оформляется не позднее, чем за <em>2 недели</em>. Минимальная неделимая часть — 7 дней подряд.</p>
<p><strong>Больничный.</strong> В первый день болезни — короткое сообщение в <span class="kb-editor__highlight">#team-channel</span>. В течение 3 дней — открыть электронный больничный. После закрытия — отправить номер ЭЛН в HR.</p>
<p><em>Болеть в рабочее время — нормально.</em> Геройство «работа важнее температуры» вредит и команде, и продукту.</p>
`,
};

/** Возвращает HTML-контент для файла или дефолтный шаблон, если контент не задан. */
export const getKnowledgeFileContent = (id: string): string =>
  mockKnowledgeFileContents[id] ?? DEFAULT_FILE_CONTENT;
