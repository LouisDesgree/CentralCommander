'use client';

import { cn } from '@/lib/cn';
import type { TodoPriority } from '@/types/workspace';

interface TodoPriorityBadgeProps {
  priority: TodoPriority;
}

const styles: Record<TodoPriority, string> = {
  high: 'bg-red-500/20 text-red-500',
  medium: 'bg-amber-500/20 text-amber-500',
  low: 'bg-green-500/20 text-green-500',
};

export function TodoPriorityBadge({ priority }: TodoPriorityBadgeProps) {
  return (
    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md uppercase', styles[priority])}>
      {priority}
    </span>
  );
}
