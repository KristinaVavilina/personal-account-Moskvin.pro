/** Соответствует Domain.Enums.ItemType на бэкенде (JSON: число). */
export const ItemType = {
  Folder: 0,
  Article: 1,
} as const;

export type ItemType = (typeof ItemType)[keyof typeof ItemType];

/** Ответ GET /api/Kb* и тела POST/PUT (camelCase от System.Text.Json). */
export interface KBItemResponse {
  id: string;
  parentId: string | null;
  type: ItemType;
  title: string;
  content: string | null;
}

export interface KBItemRequest {
  parentId: string | null;
  type: ItemType;
  title: string;
  content?: string | null;
}

export interface QuickLinkResponse {
  id: string;
  userId: string | null;
  kbItemId: string;
}

export interface QuickLinkRequest {
  userId?: string | null;
  kbItemId: string;
}
