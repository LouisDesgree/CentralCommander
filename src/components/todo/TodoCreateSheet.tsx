'use client';

import { useState } from 'react';
import { GlassSheet } from '@/components/ui/GlassSheet';
import { Button } from '@/components/ui/Button';
import { useTodos } from '@/hooks/useTodos';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import type { TodoPriority } from '@/types/workspace';
import { cn } from '@/lib/cn';

interface TodoCreateSheetProps {
  open: boolean;
  onClose: () => void;
  workspaceId?: string; // optional — omit for general tasks
}

const priorities: { value: TodoPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-500/20 text-green-500 border-green-500/30' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
  { value: 'high', label: 'High', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
];

export function TodoCreateSheet({ open, onClose, workspaceId }: TodoCreateSheetProps) {
  const { createTodo } = useTodos();
  const { workspaces } = useWorkspaces();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedWsId, setSelectedWsId] = useState(workspaceId ?? 'general');

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createTodo({
      workspaceId: selectedWsId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
    });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    onClose();
  };

  return (
    <GlassSheet open={open} onClose={onClose}>
      <div className="px-6 pb-8 space-y-5">
        <h2 className="text-lg font-semibold">New Task</h2>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full h-10 px-3 rounded-xl bg-black/5 dark:bg-white/10 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow resize-none"
          />
        </div>

        {/* Workspace selector — only show when not locked to a specific workspace */}
        {!workspaceId && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase">Space</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedWsId('general')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  selectedWsId === 'general'
                    ? 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                )}
              >
                General
              </button>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => setSelectedWsId(ws.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    selectedWsId === ws.id
                      ? 'border-current opacity-100'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  )}
                  style={selectedWsId === ws.id ? { color: ws.color } : undefined}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ws.color }}
                  />
                  {ws.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase">Priority</label>
          <div className="flex items-center gap-2">
            {priorities.map((p) => (
              <button
                key={p.value}
                onClick={() => setPriority(p.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  priority === p.value ? p.color : 'border-transparent text-gray-400 hover:text-gray-600'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-black/5 dark:bg-white/10 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow"
          />
        </div>

        <Button onClick={handleCreate} disabled={!title.trim()} className="w-full">
          Add Task
        </Button>
      </div>
    </GlassSheet>
  );
}
