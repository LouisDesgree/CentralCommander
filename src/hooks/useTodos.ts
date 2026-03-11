'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateId } from '@/lib/db';
import type { TodoItem, TodoPriority, TodoStatus } from '@/types/workspace';

export function useTodos(workspaceId?: string | null) {
  const todos = useLiveQuery(
    () => {
      if (workspaceId) {
        return db.todos.where('workspaceId').equals(workspaceId).toArray();
      }
      return db.todos.toArray();
    },
    [workspaceId],
    []
  );

  const pending = todos.filter((t) => t.status === 'pending');
  const inProgress = todos.filter((t) => t.status === 'in_progress');
  const done = todos.filter((t) => t.status === 'done');

  async function createTodo(data: {
    workspaceId?: string;
    title: string;
    description?: string;
    priority?: TodoPriority;
    dueDate?: string;
    sourceEmailId?: string;
    sourceEmailSubject?: string;
    sourceEmailFrom?: string;
    isAutoExtracted?: boolean;
  }) {
    const now = new Date().toISOString();
    const todo: TodoItem = {
      id: generateId(),
      workspaceId: data.workspaceId ?? 'general',
      sourceEmailId: data.sourceEmailId,
      sourceEmailSubject: data.sourceEmailSubject,
      sourceEmailFrom: data.sourceEmailFrom,
      title: data.title,
      description: data.description,
      priority: data.priority ?? 'medium',
      status: 'pending',
      dueDate: data.dueDate,
      createdAt: now,
      updatedAt: now,
      isAutoExtracted: data.isAutoExtracted ?? false,
    };
    await db.todos.add(todo);
    return todo;
  }

  async function updateTodo(id: string, changes: Partial<TodoItem>) {
    const now = new Date().toISOString();
    const updates: Partial<TodoItem> = { ...changes, updatedAt: now };
    if (changes.status === 'done') {
      updates.completedAt = now;
    }
    await db.todos.update(id, updates);
  }

  async function toggleStatus(id: string) {
    const todo = await db.todos.get(id);
    if (!todo) return;
    const nextStatus: Record<TodoStatus, TodoStatus> = {
      pending: 'in_progress',
      in_progress: 'done',
      done: 'pending',
    };
    await updateTodo(id, { status: nextStatus[todo.status], completedAt: undefined });
  }

  async function deleteTodo(id: string) {
    await db.todos.delete(id);
  }

  return {
    todos,
    pending,
    inProgress,
    done,
    createTodo,
    updateTodo,
    toggleStatus,
    deleteTodo,
  };
}
