import type { KBItemResponse } from '../types/knowledgeBaseApi';
import { ItemType } from '../types/knowledgeBaseApi';

/** Положение узла в дереве (как в UI). */
export interface KbFileLocation {
  parentFolderIds: string[];
  pathLabels: string[];
}

export type KbKnowledgeNode =
  | {
      id: string;
      type: 'folder';
      name: string;
      location: KbFileLocation;
      children: KbKnowledgeNode[];
    }
  | {
      id: string;
      type: 'file';
      name: string;
      location: KbFileLocation;
    };

function sortSiblings(a: KBItemResponse, b: KBItemResponse): number {
  if (a.type !== b.type) return a.type - b.type;
  return a.title.localeCompare(b.title, 'ru');
}

/** Оставляет первую запись с данным id (защита от коллизий / дубликатов в ответе). */
function dedupeKbItemsById(items: KBItemResponse[]): KBItemResponse[] {
  const seen = new Set<string>();
  const out: KBItemResponse[] = [];
  for (const it of items) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}

/** Плоский список как с бэка → дерево для UI. */
export function kbFlatToTree(items: KBItemResponse[]): KbKnowledgeNode[] {
  const rows = dedupeKbItemsById(items);
  const byParent = new Map<string | null, KBItemResponse[]>();
  for (const it of rows) {
    const p = it.parentId ?? null;
    let arr = byParent.get(p);
    if (!arr) {
      arr = [];
      byParent.set(p, arr);
    }
    arr.push(it);
  }

  function buildLevel(
    parentId: string | null,
    ancestorIds: string[],
    ancestorLabels: string[],
  ): KbKnowledgeNode[] {
    const rows = (byParent.get(parentId) ?? []).slice().sort(sortSiblings);
    const out: KbKnowledgeNode[] = [];
    for (const row of rows) {
      if (row.type === ItemType.Folder) {
        const loc: KbFileLocation = { parentFolderIds: [...ancestorIds], pathLabels: [...ancestorLabels] };
        out.push({
          id: row.id,
          type: 'folder',
          name: row.title,
          location: loc,
          children: buildLevel(row.id, [...ancestorIds, row.id], [...ancestorLabels, row.title]),
        });
      } else {
        out.push({
          id: row.id,
          type: 'file',
          name: row.title,
          location: { parentFolderIds: [...ancestorIds], pathLabels: [...ancestorLabels] },
        });
      }
    }
    return out;
  }

  return buildLevel(null, [], []);
}

export function kbItemsById(items: KBItemResponse[]): Map<string, KBItemResponse> {
  return new Map(items.map((i) => [i.id, i]));
}

export function kbCollectSubtreeIds(rootId: string, items: KBItemResponse[]): string[] {
  const byParent = new Map<string | null, string[]>();
  for (const it of items) {
    const p = it.parentId ?? null;
    let ch = byParent.get(p);
    if (!ch) {
      ch = [];
      byParent.set(p, ch);
    }
    ch.push(it.id);
  }
  const out: string[] = [];
  function walk(id: string) {
    out.push(id);
    const next = byParent.get(id);
    if (!next) return;
    for (const c of next) walk(c);
  }
  walk(rootId);
  return out;
}

export function kbRemoveSubtree(items: KBItemResponse[], rootId: string): KBItemResponse[] {
  const drop = new Set(kbCollectSubtreeIds(rootId, items));
  return items.filter((i) => !drop.has(i.id));
}

export function kbArchivedRoots(archived: KBItemResponse[]): KBItemResponse[] {
  const ids = new Set(archived.map((i) => i.id));
  return archived.filter((i) => i.parentId == null || !ids.has(i.parentId));
}

export function kbAncestorLabelsForItem(
  item: KBItemResponse,
  idIndex: Map<string, KBItemResponse>,
): string[] {
  const labels: string[] = [];
  let pid: string | null | undefined = item.parentId;
  const chain: KBItemResponse[] = [];
  const guard = new Set<string>();
  while (pid) {
    if (guard.has(pid)) break;
    guard.add(pid);
    const p = idIndex.get(pid);
    if (!p || p.type !== ItemType.Folder) break;
    chain.push(p);
    pid = p.parentId;
  }
  for (let i = chain.length - 1; i >= 0; i--) {
    labels.push(chain[i]!.title);
  }
  return labels;
}
