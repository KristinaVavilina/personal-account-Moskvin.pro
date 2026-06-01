import { create } from 'zustand';

interface UserState {
  isAuthenticated: boolean;
  user: { name: string; role: string } | null;
  /** Числовая роль текущего пользователя из API (Domain.Enums.UserRole): 0 — Сотрудник, 1 — Руководитель, 2 — Администратор. */
  apiRole: number | null;
  /** Признак того, что роль уже загружена с бэка (нужен для защиты маршрутов до завершения запроса). */
  roleLoaded: boolean;
  login: (name: string, role: string) => void;
  logout: () => void;
  setApiRole: (role: number | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false,
  user: null,
  apiRole: null,
  roleLoaded: false,
  login: (name, role) => set({ isAuthenticated: true, user: { name, role } }),
  logout: () => set({ isAuthenticated: false, user: null, apiRole: null, roleLoaded: false }),
  setApiRole: (role) => set({ apiRole: role, roleLoaded: true }),
}));
