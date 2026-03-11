'use client';

import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Inbox, CheckSquare, FolderKanban, PenLine } from 'lucide-react';

const actions = [
  { label: 'Summarize Inbox', icon: Inbox, href: '/agent', color: 'text-blue-500' },
  { label: 'Tasks', icon: CheckSquare, href: '/tasks', color: 'text-amber-500' },
  { label: 'Spaces', icon: FolderKanban, href: '/workspaces', color: 'text-purple-500' },
  { label: 'New Email', icon: PenLine, href: '/email/compose', color: 'text-green-500' },
];

export function QuickActionsGrid() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <GlassCard
            key={action.label}
            interactive
            padding="md"
            className="flex flex-col items-center justify-center gap-2 py-6"
            onClick={() => router.push(action.href)}
          >
            <Icon className={`w-7 h-7 ${action.color}`} />
            <span className="text-sm font-medium">{action.label}</span>
          </GlassCard>
        );
      })}
    </div>
  );
}
