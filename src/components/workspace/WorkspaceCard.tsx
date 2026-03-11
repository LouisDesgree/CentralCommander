'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Pin, Mail, CheckSquare } from 'lucide-react';
import type { Workspace } from '@/types/workspace';

interface WorkspaceCardProps {
  workspace: Workspace;
  todoCount?: number;
  onClick: () => void;
}

export function WorkspaceCard({ workspace, todoCount = 0, onClick }: WorkspaceCardProps) {
  return (
    <GlassCard interactive padding="md" onClick={onClick} className="relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
        style={{ backgroundColor: workspace.color }}
      />
      <div className="pl-2">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm truncate flex-1">{workspace.name}</h3>
          {workspace.isPinned && (
            <Pin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-1" />
          )}
        </div>
        {workspace.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mb-3">{workspace.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Mail className="w-3 h-3" />
            <span>{workspace.emailIds.length}</span>
          </div>
          {todoCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <CheckSquare className="w-3 h-3" />
              <span>{todoCount}</span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
