'use client';

import { cn } from '@/lib/cn';
import type { EmailCategory } from '@/types/email';

interface EmailFilterBarProps {
  activeCategory: EmailCategory | null;
  onCategoryChange: (category: EmailCategory | null) => void;
}

const categories: { label: string; value: EmailCategory | null }[] = [
  { label: 'All', value: null },
  { label: 'Important', value: 'important' },
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'personal' },
  { label: 'Finance', value: 'finance' },
  { label: 'Newsletter', value: 'newsletter' },
  { label: 'Social', value: 'social' },
  { label: 'Promo', value: 'promotional' },
];

export function EmailFilterBar({ activeCategory, onCategoryChange }: EmailFilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat.label}
          onClick={() => onCategoryChange(cat.value)}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
            activeCategory === cat.value
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-white/20 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/15'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
