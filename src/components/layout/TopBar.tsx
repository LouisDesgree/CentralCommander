'use client';

import { cn } from '@/lib/cn';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  trailing?: React.ReactNode;
  className?: string;
}

export function TopBar({ title, showBack = false, trailing, className }: TopBarProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        'sticky top-0 z-30',
        'bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl',
        'border-b border-white/20 dark:border-white/10',
        'pt-[env(safe-area-inset-top,0px)]',
        className
      )}
    >
      <div className="flex items-center h-12 px-4">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 -ml-1 mr-2 rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold flex-1 truncate">{title}</h1>
        {trailing && <div className="flex items-center gap-1">{trailing}</div>}
      </div>
    </header>
  );
}
