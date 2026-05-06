import { readJson } from './http';
import type { KBItemRequest, KBItemResponse, QuickLinkRequest, QuickLinkResponse } from '../types/knowledgeBaseApi';

/**
 * HTTP-клиент базы знаний (Kb + QuickLink).
 * Использование на странице: см. `KnowledgeBasePage` и `USE_KNOWLEDGE_BASE_MOCK`.
 *
 * Покрытие маршрутов бэка: tree, children, CRUD Kb, user/all QuickLink, CRUD QuickLink.
 * `fetchKbAll` / `fetchKbChildren` / `updateQuickLink` оставлены для расширений (ленивое дерево, правки ссылок).
 */
function apiPathKbChildren(parentId: string | null): string {
  if (parentId == null) return '/api/Kb/children';
  return `/api/Kb/children/${encodeURIComponent(parentId)}`;
}

export async function fetchKbTree(isArchived: boolean): Promise<KBItemResponse[]> {
  const qs = new URLSearchParams({ isArchived: String(isArchived) });
  const res = await fetch(`/api/Kb/tree?${qs}`);
  const data = await readJson<KBItemResponse[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function fetchKbChildren(parentId: string | null): Promise<KBItemResponse[]> {
  const res = await fetch(apiPathKbChildren(parentId));
  const data = await readJson<KBItemResponse[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function fetchKbAll(): Promise<KBItemResponse[]> {
  const res = await fetch('/api/Kb');
  const data = await readJson<KBItemResponse[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function fetchKbById(id: string): Promise<KBItemResponse> {
  const res = await fetch(`/api/Kb/${encodeURIComponent(id)}`);
  return readJson<KBItemResponse>(res);
}

/** POST возвращает id созданной записи (Guid). */
export async function createKb(body: KBItemRequest): Promise<string> {
  const res = await fetch('/api/Kb', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<string>(res);
}

export async function updateKb(id: string, body: KBItemRequest): Promise<void> {
  const res = await fetch(`/api/Kb/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await readJson<string>(res);
}

export async function deleteKb(id: string): Promise<void> {
  const res = await fetch(`/api/Kb/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  await readJson<string>(res);
}

export async function fetchQuickLinksByUser(userId: string): Promise<QuickLinkResponse[]> {
  const res = await fetch(`/api/QuickLink/user/${encodeURIComponent(userId)}`);
  const data = await readJson<QuickLinkResponse[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function fetchQuickLinksAll(): Promise<QuickLinkResponse[]> {
  const res = await fetch('/api/QuickLink');
  const data = await readJson<QuickLinkResponse[]>(res);
  return Array.isArray(data) ? data : [];
}

/** POST возвращает id созданной быстрой ссылки. */
export async function createQuickLink(body: QuickLinkRequest): Promise<string> {
  const res = await fetch('/api/QuickLink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<string>(res);
}

export async function updateQuickLink(id: string, body: QuickLinkRequest): Promise<void> {
  const res = await fetch(`/api/QuickLink/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await readJson<string>(res);
}

export async function deleteQuickLink(id: string): Promise<void> {
  const res = await fetch(`/api/QuickLink/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  await readJson<string>(res);
}
