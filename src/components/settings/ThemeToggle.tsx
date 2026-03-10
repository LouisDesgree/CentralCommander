'use client';

import { cn } from '@/lib/cn';
import { useTheme } from '@/hooks/useTheme';
import { Monitor, Sun, Moon } from 'lucide-react';

const options = [
  { value: 'system' as const, icon: Monitor, label: 'System' },
  { value: 'light' as const, icon: Sun, label: 'Light' },
  { value: 'dark' as const, icon: Moon, label: 'Dark' },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex rounded-xl bg-white/20 dark:bg-white/10 p-1">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = mode === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setMode(opt.value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
              isActive
                ? 'bg-white dark:bg-white/20 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
