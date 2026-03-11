'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateId } from '@/lib/db';
import type { Workspace } from '@/types/workspace';

export function useWorkspaces() {
  const workspaces = useLiveQuery(
    () => db.workspaces.orderBy('sortOrder').toArray(),
    [],
    []
  );

  const pinnedWorkspaces = workspaces.filter((w) => w.isPinned);

  async function createWorkspace(data: Pick<Workspace, 'name' | 'color'> & Partial<Pick<Workspace, 'description' | 'icon'>>) {
    const now = new Date().toISOString();
    const maxOrder = workspaces.length > 0 ? Math.max(...workspaces.map((w) => w.sortOrder)) : 0;
    const workspace: Workspace = {
      id: generateId(),
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      emailIds: [],
      createdAt: now,
      updatedAt: now,
      isPinned: false,
      sortOrder: maxOrder + 1,
    };
    await db.workspaces.add(workspace);
    return workspace;
  }

  async function updateWorkspace(id: string, changes: Partial<Workspace>) {
    await db.workspaces.update(id, { ...changes, updatedAt: new Date().toISOString() });
  }

  async function deleteWorkspace(id: string) {
    await db.transaction('rw', [db.workspaces, db.todos, db.files, db.fileBlobs], async () => {
      const files = await db.files.where('workspaceId').equals(id).toArray();
      for (const file of files) {
        if (file.blobKey) await db.fileBlobs.delete(file.blobKey);
      }
      await db.files.where('workspaceId').equals(id).delete();
      await db.todos.where('workspaceId').equals(id).delete();
      await db.workspaces.delete(id);
    });
  }

  async function addEmailToWorkspace(workspaceId: string, emailId: string) {
    const workspace = await db.workspaces.get(workspaceId);
    if (workspace && !workspace.emailIds.includes(emailId)) {
      await db.workspaces.update(workspaceId, {
        emailIds: [...workspace.emailIds, emailId],
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async function removeEmailFromWorkspace(workspaceId: string, emailId: string) {
    const workspace = await db.workspaces.get(workspaceId);
    if (workspace) {
      await db.workspaces.update(workspaceId, {
        emailIds: workspace.emailIds.filter((id) => id !== emailId),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async function togglePin(id: string) {
    const workspace = await db.workspaces.get(id);
    if (workspace) {
      await db.workspaces.update(id, { isPinned: !workspace.isPinned, updatedAt: new Date().toISOString() });
    }
  }

  return {
    workspaces,
    pinnedWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addEmailToWorkspace,
    removeEmailFromWorkspace,
    togglePin,
  };
}

export function useWorkspace(id: string | null) {
  const workspace = useLiveQuery(
    () => (id ? db.workspaces.get(id) : undefined),
    [id],
    undefined
  );
  return workspace;
}
