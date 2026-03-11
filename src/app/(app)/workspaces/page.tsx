'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { WorkspaceList } from '@/components/workspace/WorkspaceList';
import { WorkspaceCreateSheet } from '@/components/workspace/WorkspaceCreateSheet';
import { Plus } from 'lucide-react';

export default function WorkspacesPage() {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <TopBar
        title="Spaces"
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
        <div className="px-4 py-4">
          <WorkspaceList onSelect={(id) => router.push(`/workspaces/${id}`)} />
        </div>
      </PageTransition>

      <WorkspaceCreateSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(id) => router.push(`/workspaces/${id}`)}
      />
    </>
  );
}
