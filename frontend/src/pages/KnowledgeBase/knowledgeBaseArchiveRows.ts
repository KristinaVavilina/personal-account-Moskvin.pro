import type { KnowledgeArchiveItem } from '../../mocks/knowledgeBaseMock';
import type { KBItemResponse } from '../../types/knowledgeBaseApi';
import { ItemType } from '../../types/knowledgeBaseApi';
import {
  kbAncestorLabelsForItem,
  kbArchivedRoots,
  kbItemsById,
} from '../../utils/knowledgeBaseTree';

export function kbArchivedFlatToArchiveRows(
  archived: KBItemResponse[],
  options: { allowRestore: boolean; archivedAtLabel: string; deleteInDays: number },
): KnowledgeArchiveItem[] {
  const idIndex = kbItemsById(archived);
  return kbArchivedRoots(archived).map((root) => ({
    id: root.id,
    kind: root.type === ItemType.Folder ? 'folder' : 'file',
    name: root.title,
    archivedAt: options.archivedAtLabel,
    deleteInDays: options.deleteInDays,
    restorePathLabels: kbAncestorLabelsForItem(root, idIndex),
    rootKbId: root.id,
    canRestore: options.allowRestore,
  }));
}
