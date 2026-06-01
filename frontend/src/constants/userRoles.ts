/** Значения `Domain.Enums.UserRole` (как число в JSON). */
export const USER_ROLE = {
  Employee: 0,
  Manager: 1,
  Admin: 2,
} as const;

/** Подписи для `Domain.Enums.UserRole` (как число в JSON). */
export const API_USER_ROLE_LABELS: Record<number, string> = {
  [USER_ROLE.Employee]: 'Сотрудник',
  [USER_ROLE.Manager]: 'Руководитель',
  [USER_ROLE.Admin]: 'Администратор',
};

export function apiUserRoleLabel(role: number): string {
  return API_USER_ROLE_LABELS[role] ?? `Роль (${role})`;
}

/**
 * Полный доступ к функционалу (раздел «Сотрудники», архив и редактирование
 * в базе знаний). Доступен всем, кроме рядового сотрудника.
 * Пока роль не загружена (`null`) — доступ закрыт.
 */
export function canManage(role: number | null | undefined): boolean {
  return role != null && role !== USER_ROLE.Employee;
}
