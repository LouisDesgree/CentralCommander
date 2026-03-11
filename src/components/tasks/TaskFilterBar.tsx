'use client';

import { useTaskStore, type TaskView } from '@/stores/taskStore';
import { TASK_CATEGORY_CONFIG, type TaskCategory } from '@/types/tasks';
import { cn } from '@/lib/cn';

const VIEW_FILTERS: { id: TaskView; label: string }[] = [
  { id: 'all', label: 'Active' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'done', label: 'Done' },
];

export function TaskFilterBar() {
  const { activeView, setActiveView, activeCategory, setActiveCategory } = useTaskStore();

  return (
    <div className="space-y-3">
      {/* View filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
        {VIEW_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveView(filter.id)}
            className={cn(
              'flex-none px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              activeView === filter.id
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                : 'bg-white/50 dark:bg-white/8 text-gray-500 dark:text-gray-400 border border-white/20 dark:border-white/10'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            'flex-none px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200',
            activeCategory === null
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-white/40 dark:bg-white/8 text-gray-500 border border-white/20 dark:border-white/10'
          )}
        >
          All
        </button>
        {(Object.entries(TASK_CATEGORY_CONFIG) as [TaskCategory, (typeof TASK_CATEGORY_CONFIG)[TaskCategory]][]).map(
          ([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              className={cn(
                'flex-none flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                activeCategory === key
                  ? `${config.bg} ${config.color} border border-current/20`
                  : 'bg-white/40 dark:bg-white/8 text-gray-500 border border-white/20 dark:border-white/10'
              )}
            >
              <span>{config.icon}</span>
              {config.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}
