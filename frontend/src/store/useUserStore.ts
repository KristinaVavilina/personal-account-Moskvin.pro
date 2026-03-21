import { create } from 'zustand';

interface UserState {
  isAuthenticated: boolean;
  user: { name: string; role: string } | null;
  login: (name: string, role: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false, // Измени на true для быстрого теста внутренних страниц
  user: null,
  login: (name, role) => set({ isAuthenticated: true, user: { name, role } }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));