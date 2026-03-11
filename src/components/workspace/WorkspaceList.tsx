'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { WorkspaceCard } from './WorkspaceCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { FolderKanban } from 'lucide-react';

interface WorkspaceListProps {
  onSelect: (id: string) => void;
}

export function WorkspaceList({ onSelect }: WorkspaceListProps) {
  const { workspaces } = useWorkspaces();

  const todoCounts = useLiveQuery(async () => {
    const counts: Record<string, number> = {};
    for (const ws of workspaces) {
      counts[ws.id] = await db.todos.where('workspaceId').equals(ws.id).count();
    }
    return counts;
  }, [workspaces], {} as Record<string, number>);

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-500/10 flex items-center justify-center mb-4">
          <FolderKanban className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold mb-1">No spaces yet</h3>
        <p className="text-sm text-gray-400 text-center max-w-[240px]">
          Create a space to organize your emails, tasks, and files by project.
        </p>
      </div>
    );
  }

  const pinned = workspaces.filter((w) => w.isPinned);
  const unpinned = workspaces.filter((w) => !w.isPinned);

  return (
    <div className="space-y-4">
      {pinned.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase px-1">Pinned</p>
          <div className="grid grid-cols-2 gap-3">
            {pinned.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                todoCount={todoCounts[ws.id] ?? 0}
                onClick={() => onSelect(ws.id)}
              />
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2">
        {pinned.length > 0 && unpinned.length > 0 && (
          <p className="text-xs font-medium text-gray-400 uppercase px-1">All Spaces</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {unpinned.map((ws) => (
            <WorkspaceCard
              key={ws.id}
              workspace={ws}
              todoCount={todoCounts[ws.id] ?? 0}
              onClick={() => onSelect(ws.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
