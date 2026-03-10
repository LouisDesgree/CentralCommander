'use client';

import { cn } from '@/lib/cn';
import { Search, X } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, value, onClear, ...props }, ref) => {
    return (
      <div className={cn('relative', className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={ref}
          value={value}
          className={cn(
            'w-full bg-white/30 dark:bg-white/10 backdrop-blur-lg',
            'border border-white/20 dark:border-white/10',
            'rounded-full pl-10 pr-10 py-2.5',
            'text-sm text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
            'outline-none transition-all duration-200'
          )}
          {...props}
        />
        {value && onClear && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
