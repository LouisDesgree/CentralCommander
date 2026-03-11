'use client';

import { useState } from 'react';
import { useWorkspace } from '@/hooks/useWorkspaces';
import { useTodos } from '@/hooks/useTodos';
import { useFiles } from '@/hooks/useFiles';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { WorkspaceTabBar } from './WorkspaceTabBar';
import { WorkspaceEmailList } from './WorkspaceEmailList';
import { AddEmailSheet } from './AddEmailSheet';
import { TodoList } from '@/components/todo/TodoList';
import { FileList } from '@/components/files/FileList';

interface WorkspaceDetailProps {
  workspaceId: string;
}

export function WorkspaceDetail({ workspaceId }: WorkspaceDetailProps) {
  const workspace = useWorkspace(workspaceId);
  const { activeTab, setActiveTab } = useWorkspaceStore();
  const { todos } = useTodos(workspaceId);
  const { files } = useFiles(workspaceId);
  const [showAddEmail, setShowAddEmail] = useState(false);

  if (!workspace) return null;

  return (
    <div>
      <WorkspaceTabBar
        active={activeTab}
        onChange={setActiveTab}
        emailCount={workspace.emailIds.length}
        todoCount={todos.filter((t) => t.status !== 'done').length}
        fileCount={files.length}
      />

      {activeTab === 'emails' && (
        <WorkspaceEmailList
          workspaceId={workspaceId}
          emailIds={workspace.emailIds}
          onAddEmail={() => setShowAddEmail(true)}
        />
      )}

      {activeTab === 'todos' && (
        <TodoList workspaceId={workspaceId} emailIds={workspace.emailIds} />
      )}

      {activeTab === 'files' && (
        <FileList workspaceId={workspaceId} />
      )}

      <AddEmailSheet
        open={showAddEmail}
        onClose={() => setShowAddEmail(false)}
        workspaceId={workspaceId}
        existingEmailIds={workspace.emailIds}
      />
    </div>
  );
}
