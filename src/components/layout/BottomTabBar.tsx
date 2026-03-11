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
        'fixed bottom-0 inset-x-0 z-30',
        'bg-white/75 dark:bg-gray-900/75 backdrop-blur-2xl',
        'border-t border-white/20 dark:border-white/10',
        'pb-[env(safe-area-inset-bottom,0px)]'
      )}
    >
      <div className="flex items-stretch h-14">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1',
                'transition-colors duration-150',
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-7 rounded-xl transition-all duration-200',
                  isActive && 'bg-blue-500/10'
                )}
              >
                <Icon
                  className="w-[19px] h-[19px]"
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium leading-none transition-colors',
                  isActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
