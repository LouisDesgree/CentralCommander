'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useTodos } from '@/hooks/useTodos';
import { TopBar } from '@/components/layout/TopBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { TodoItem } from '@/components/todo/TodoItem';
import { TodoCreateSheet } from '@/components/todo/TodoCreateSheet';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Plus, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { TodoItem as TodoItemType } from '@/types/workspace';

type FilterMode = 'all' | 'active' | 'done';

export default function TasksPage() {
  const router = useRouter();
  const { todos, toggleStatus, deleteTodo } = useTodos(); // all todos
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<FilterMode>('active');

  // Fetch all workspaces for display
  const workspaces = useLiveQuery(() => db.workspaces.toArray(), [], []);
  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));

  const filtered = filter === 'all'
    ? todos
    : filter === 'active'
    ? todos.filter((t) => t.status !== 'done')
    : todos.filter((t) => t.status === 'done');

  // Group by workspace
  const grouped: Record<string, TodoItemType[]> = {};
  for (const todo of filtered) {
    const key = todo.workspaceId;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(todo);
  }

  // Sort groups: 'general' last, others by workspace name
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
    if (a === 'general') return 1;
    if (b === 'general') return -1;
    return (wsMap[a]?.name ?? '').localeCompare(wsMap[b]?.name ?? '');
  });

  const activeCount = todos.filter((t) => t.status !== 'done').length;
  const doneCount = todos.filter((t) => t.status === 'done').length;

  return (
    <>
      <TopBar
        title="Tasks"
        showBack
        trailing={
          <button
            onClick={() => setShowCreate(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />
      <PageTransition>
        <div className="px-4 py-4 space-y-4">
          {/* Summary bar */}
          <div className="flex items-center gap-3">
            <GlassCard padding="sm" className="flex-1 flex items-center justify-center gap-2">
              <span className="text-lg font-bold">{activeCount}</span>
              <span className="text-xs text-gray-400">active</span>
            </GlassCard>
            <GlassCard padding="sm" className="flex-1 flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-green-400">{doneCount}</span>
              <span className="text-xs text-gray-400">done</span>
            </GlassCard>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1">
            {(['active', 'all', 'done'] as FilterMode[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                  filter === f
                    ? 'bg-blue-500/15 text-blue-500'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Task list */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3">
                <CheckSquare className="w-7 h-7 text-purple-400" />
              </div>
              <p className="text-sm text-gray-400 mb-4">
                {filter === 'done' ? 'No completed tasks yet' : 'No tasks yet'}
              </p>
              {filter !== 'done' && (
                <Button variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
                  Create a Task
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {sortedGroups.map(([wsId, groupTodos]) => {
                const ws = wsMap[wsId];
                const groupLabel = wsId === 'general' ? 'General' : ws?.name ?? 'Unknown';
                const groupColor = ws?.color;

                return (
                  <div key={wsId}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      {wsId !== 'general' && groupColor && (
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: groupColor }}
                        />
                      )}
                      <p className="text-xs font-medium text-gray-400 uppercase">{groupLabel}</p>
                      <span className="text-[10px] text-gray-500">{groupTodos.length}</span>
                    </div>
                    <GlassCard padding="sm">
                      <div className="divide-y divide-white/5">
                        {groupTodos.map((todo) => (
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
              })}
            </div>
          )}
        </div>
      </PageTransition>

      <TodoCreateSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </>
  );
}
