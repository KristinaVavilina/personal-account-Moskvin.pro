import { mockPositions, mockUsers, type MockUser } from './apiMockData';
import type { ApiUserResponse } from '../types/userApi';

export function mockUserRowToApiShape(u: MockUser): ApiUserResponse {
  const pos = u.positionId != null ? mockPositions.find((p) => p.id === u.positionId) : undefined;
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    photoUrl: u.photoUrl,
    role: u.role,
    positionName: pos?.title ?? null,
    passwordHash: u.passwordHash ?? null,
  };
}

/** Активные пользователи каталога — как отфильтрованный список для просмотра. */
export function getMockEmployeesDirectory(): ApiUserResponse[] {
  return mockUsers.filter((u) => !u.isArchived).map(mockUserRowToApiShape);
}
