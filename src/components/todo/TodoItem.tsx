'use client';

import { cn } from '@/lib/cn';
import { TodoPriorityBadge } from './TodoPriorityBadge';
import { Trash2, Calendar, Mail } from 'lucide-react';
import type { TodoItem as TodoItemType } from '@/types/workspace';

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: () => void;
  onDelete: () => void;
  onEmailClick?: (emailId: string) => void;
  showWorkspace?: boolean;
  workspaceName?: string;
  workspaceColor?: string;
}

export function TodoItem({ todo, onToggle, onDelete, onEmailClick, showWorkspace, workspaceName, workspaceColor }: TodoItemProps) {
  const isDone = todo.status === 'done';
  const isInProgress = todo.status === 'in_progress';

  return (
    <div className="flex items-start gap-3 group py-2.5">
      <button
        onClick={onToggle}
        className={cn(
          'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
          isDone
            ? 'bg-green-500 border-green-500'
            : isInProgress
            ? 'border-blue-400 bg-blue-500/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
        )}
      >
        {isDone && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {isInProgress && (
          <div className="w-2 h-2 rounded-sm bg-blue-400" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium',
          isDone && 'line-through text-gray-400'
        )}>
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{todo.description}</p>
        )}

        {/* Source email chip */}
        {todo.sourceEmailId && (todo.sourceEmailSubject || todo.sourceEmailFrom) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEmailClick?.(todo.sourceEmailId!);
            }}
            className="flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition-colors max-w-full"
          >
            <Mail className="w-2.5 h-2.5 text-blue-400 flex-shrink-0" />
            <span className="text-[10px] text-blue-400 truncate">
              {todo.sourceEmailSubject || todo.sourceEmailFrom}
            </span>
          </button>
        )}

        <div className="flex items-center gap-2 mt-1">
          <TodoPriorityBadge priority={todo.priority} />
          {todo.dueDate && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
              <Calendar className="w-2.5 h-2.5" />
              {new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
          {showWorkspace && workspaceName && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: workspaceColor || '#6366F1' }}
              />
              {workspaceName}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
