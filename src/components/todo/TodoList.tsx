'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTodos } from '@/hooks/useTodos';
import { TodoItem } from './TodoItem';
import { TodoCreateSheet } from './TodoCreateSheet';
import { Button } from '@/components/ui/Button';
import { Plus, CheckSquare, Sparkles } from 'lucide-react';

interface TodoListProps {
  workspaceId: string;
  emailIds?: string[];
}

export function TodoList({ workspaceId, emailIds }: TodoListProps) {
  const router = useRouter();
  const { pending, inProgress, done, toggleStatus, deleteTodo, createTodo } = useTodos(workspaceId);
  const [showCreate, setShowCreate] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState('');

  const handleExtractTasks = useCallback(async () => {
    if (!emailIds || emailIds.length === 0) return;
    setExtracting(true);
    let totalExtracted = 0;

    try {
      for (let i = 0; i < emailIds.length; i++) {
        setExtractProgress(`Scanning email ${i + 1} of ${emailIds.length}...`);
        try {
          const res = await fetch('/api/agent/extract-todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailId: emailIds[i] }),
          });
          if (!res.ok) continue;
          const data = await res.json();
          const todos = data.todos ?? [];
          for (const todo of todos) {
            await createTodo({
              workspaceId,
              title: todo.title,
              description: todo.description,
              priority: todo.priority ?? 'medium',
              dueDate: todo.dueDate ?? undefined,
              sourceEmailId: emailIds[i],
              isAutoExtracted: true,
            });
            totalExtracted++;
          }
        } catch {
          // Skip individual email errors
        }
      }
      setExtractProgress(totalExtracted > 0 ? `${totalExtracted} task${totalExtracted !== 1 ? 's' : ''} found` : 'No tasks found');
      setTimeout(() => setExtractProgress(''), 3000);
    } finally {
      setExtracting(false);
    }
  }, [emailIds, workspaceId, createTodo]);

  const isEmpty = pending.length === 0 && inProgress.length === 0 && done.length === 0;
  const hasEmails = emailIds && emailIds.length > 0;

  return (
    <div className="px-4 space-y-4">
      <div className="flex justify-end gap-2">
        {hasEmails && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={handleExtractTasks}
            loading={extracting}
          >
            {extracting ? extractProgress : 'Extract tasks'}
          </Button>
        )}
        <Button variant="ghost" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowCreate(true)}>
          Add
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3">
            <CheckSquare className="w-7 h-7 text-purple-400" />
          </div>
          <p className="text-sm text-gray-400 mb-4">No tasks yet</p>
          <div className="flex items-center gap-2">
            {hasEmails && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Sparkles className="w-4 h-4" />}
                onClick={handleExtractTasks}
                loading={extracting}
              >
                {extracting ? extractProgress : 'Extract from emails'}
              </Button>
            )}
            <Button variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
              Create a Task
            </Button>
          </div>
        </div>
      ) : (
        <>
          {inProgress.length > 0 && (
            <div>
              <p className="text-xs font-medium text-blue-400 uppercase mb-1">In Progress</p>
              <div className="divide-y divide-white/5">
                {inProgress.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={() => toggleStatus(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                    onEmailClick={(emailId) => router.push(`/email/${emailId}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {pending.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase mb-1">To Do</p>
              <div className="divide-y divide-white/5">
                {pending.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={() => toggleStatus(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                    onEmailClick={(emailId) => router.push(`/email/${emailId}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <p className="text-xs font-medium text-green-400 uppercase mb-1">Done</p>
              <div className="divide-y divide-white/5">
                {done.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={() => toggleStatus(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                    onEmailClick={(emailId) => router.push(`/email/${emailId}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <TodoCreateSheet open={showCreate} onClose={() => setShowCreate(false)} workspaceId={workspaceId} />
    </div>
  );
}
