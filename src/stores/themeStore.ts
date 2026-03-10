import { create } from 'zustand';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  setResolved: (resolved: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'system',
  resolved: 'light',
  setMode: (mode) => set({ mode }),
  setResolved: (resolved) => set({ resolved }),
}));
