import type { ApiUserResponse } from '../types/userApi';
import { mockUsers } from './apiMockData';
import { mockUserRowToApiShape } from './employeesDirectoryMock';

/** Профиль «текущего» пользователя из демо-каталога (без сети). */
export function getMockUserProfileById(userId: string): ApiUserResponse | null {
  let u = mockUsers.find((row) => row.id === userId && !row.isArchived);
  if (!u) u = mockUsers.find((row) => !row.isArchived);
  return u ? mockUserRowToApiShape(u) : null;
}
