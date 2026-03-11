'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { WorkspaceDetail } from '@/components/workspace/WorkspaceDetail';
import { useWorkspace, useWorkspaces } from '@/hooks/useWorkspaces';
import { Pin, Trash2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function WorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const workspace = useWorkspace(id);
  const { togglePin, deleteWorkspace } = useWorkspaces();
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (confirm('Delete this space and all its tasks and files?')) {
      await deleteWorkspace(id);
      router.push('/workspaces');
    }
  };

  return (
    <>
      <TopBar
        title={workspace?.name ?? 'Space'}
        showBack
        trailing={
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
                  <button
                    onClick={() => { togglePin(id); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
                  >
                    <Pin className="w-4 h-4" />
                    {workspace?.isPinned ? 'Unpin' : 'Pin to top'}
                  </button>
                  <button
                    onClick={() => { handleDelete(); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Space
                  </button>
                </div>
              </>
            )}
          </div>
        }
      />
      <PageTransition>
        <WorkspaceDetail workspaceId={id} />
      </PageTransition>
    </>
  );
}
