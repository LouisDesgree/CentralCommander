'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export function useTheme() {
  const { mode, resolved, setMode, setResolved } = useThemeStore();

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'system' | 'light' | 'dark' | null;
    if (stored) setMode(stored);
  }, [setMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme() {
      let isDark: boolean;
      if (mode === 'dark') {
        isDark = true;
      } else if (mode === 'light') {
        isDark = false;
      } else {
        isDark = mediaQuery.matches;
      }

      document.documentElement.classList.toggle('dark', isDark);
      setResolved(isDark ? 'dark' : 'light');
      localStorage.setItem('theme', mode);
    }

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [mode, setResolved]);

  return { mode, resolved, setMode };
}
