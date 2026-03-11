'use client';

import { cn } from '@/lib/cn';
import { Mail, CheckSquare, FileText } from 'lucide-react';

type Tab = 'emails' | 'todos' | 'files';

interface WorkspaceTabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  emailCount?: number;
  todoCount?: number;
  fileCount?: number;
}

const tabs: { key: Tab; label: string; icon: typeof Mail }[] = [
  { key: 'emails', label: 'Emails', icon: Mail },
  { key: 'todos', label: 'Tasks', icon: CheckSquare },
  { key: 'files', label: 'Files', icon: FileText },
];

export function WorkspaceTabBar({ active, onChange, emailCount, todoCount, fileCount }: WorkspaceTabBarProps) {
  const counts: Record<Tab, number | undefined> = { emails: emailCount, todos: todoCount, files: fileCount };

  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        const count = counts[tab.key];
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-500/15 text-blue-500'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {count !== undefined && count > 0 && (
              <span className={cn(
                'text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-1',
                isActive ? 'bg-blue-500/20' : 'bg-gray-500/15'
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
