/** Подписи для `Domain.Enums.UserRole` (как число в JSON). */
export const API_USER_ROLE_LABELS: Record<number, string> = {
  0: 'Сотрудник',
  1: 'Руководитель',
  2: 'Администратор',
};

export function apiUserRoleLabel(role: number): string {
  return API_USER_ROLE_LABELS[role] ?? `Роль (${role})`;
}
