'use client';

import { useRouter } from 'next/navigation';
import { useTodos } from '@/hooks/useTodos';
import { GlassCard } from '@/components/ui/GlassCard';
import { TodoItem } from '@/components/todo/TodoItem';
import { CheckSquare, ArrowRight } from 'lucide-react';

export function RecentTasks() {
  const router = useRouter();
  const { pending, inProgress, toggleStatus, deleteTodo } = useTodos();

  const activeTasks = [...inProgress, ...pending].slice(0, 5);

  if (activeTasks.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Active Tasks</h2>
        <button
          onClick={() => router.push('/tasks')}
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <GlassCard padding="sm">
        <div className="divide-y divide-white/5">
          {activeTasks.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggleStatus(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
              onEmailClick={(emailId) => router.push(`/email/${emailId}`)}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
