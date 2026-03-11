'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { navigationItems } from '@/config/navigation';

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-50',
        'bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl',
        'border-t border-white/20 dark:border-white/10',
        'pb-[env(safe-area-inset-bottom,0px)]'
      )}
    >
      <div className="flex items-center justify-around h-14">
        {navigationItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-14 py-1 rounded-xl transition-colors',
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-xl transition-colors',
                  isActive && 'bg-blue-500/10'
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
