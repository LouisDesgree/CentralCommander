'use client';

import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', className)}>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg my-1',
            checked ? 'ml-6' : 'ml-1'
          )}
        />
      </button>
      {label && <span className="text-sm text-[hsl(var(--text-secondary))]">{label}</span>}
    </label>
  );
}
