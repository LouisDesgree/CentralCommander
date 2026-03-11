'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { FileText, Image, File, StickyNote, Trash2 } from 'lucide-react';
import type { WorkspaceFile } from '@/types/workspace';
import { cn } from '@/lib/cn';

interface FileCardProps {
  file: WorkspaceFile;
  onClick: () => void;
  onDelete: () => void;
}

const typeIcons = {
  note: StickyNote,
  document: FileText,
  image: Image,
  other: File,
};

const typeColors = {
  note: 'text-amber-400 bg-amber-500/10',
  document: 'text-blue-400 bg-blue-500/10',
  image: 'text-pink-400 bg-pink-500/10',
  other: 'text-gray-400 bg-gray-500/10',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileCard({ file, onClick, onDelete }: FileCardProps) {
  const Icon = typeIcons[file.type];
  const colorClass = typeColors[file.type];

  return (
    <GlassCard interactive padding="sm" onClick={onClick} className="relative group">
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {file.type === 'note'
              ? `${file.content?.split('\n').length ?? 0} lines`
              : formatSize(file.size)}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {file.type === 'note' && file.content && (
        <p className="text-xs text-gray-400 line-clamp-2 mt-2 pl-[52px]">{file.content}</p>
      )}
    </GlassCard>
  );
}
