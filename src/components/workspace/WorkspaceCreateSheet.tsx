'use client';

import { useState } from 'react';
import { GlassSheet } from '@/components/ui/GlassSheet';
import { Button } from '@/components/ui/Button';
import { useWorkspaces } from '@/hooks/useWorkspaces';

interface WorkspaceCreateSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}

const PRESET_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#6366F1',
];

export function WorkspaceCreateSheet({ open, onClose, onCreated }: WorkspaceCreateSheetProps) {
  const { createWorkspace } = useWorkspaces();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const ws = await createWorkspace({ name: name.trim(), description: description.trim() || undefined, color });
      setName('');
      setDescription('');
      setColor(PRESET_COLORS[0]);
      onClose();
      onCreated?.(ws.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassSheet open={open} onClose={onClose}>
      <div className="px-6 pb-8 space-y-5">
        <h2 className="text-lg font-semibold">New Space</h2>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Job Search, School, Personal..."
            className="w-full h-10 px-3 rounded-xl bg-black/5 dark:bg-white/10 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            className="w-full h-10 px-3 rounded-xl bg-black/5 dark:bg-white/10 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase">Color</label>
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-transform"
                style={{
                  backgroundColor: c,
                  transform: color === c ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={handleCreate}
          loading={loading}
          disabled={!name.trim()}
          className="w-full"
        >
          Create Space
        </Button>
      </div>
    </GlassSheet>
  );
}
