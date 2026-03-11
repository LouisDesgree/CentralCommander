'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateId } from '@/lib/db';
import type { WorkspaceFile, WorkspaceFileType } from '@/types/workspace';

export function useFiles(workspaceId?: string | null) {
  const files = useLiveQuery(
    () => {
      if (workspaceId) {
        return db.files.where('workspaceId').equals(workspaceId).toArray();
      }
      return db.files.toArray();
    },
    [workspaceId],
    []
  );

  const notes = files.filter((f) => f.type === 'note');
  const documents = files.filter((f) => f.type !== 'note');

  async function createNote(data: { workspaceId: string; name: string; content: string }) {
    const now = new Date().toISOString();
    const file: WorkspaceFile = {
      id: generateId(),
      workspaceId: data.workspaceId,
      name: data.name,
      type: 'note',
      mimeType: 'text/plain',
      size: new Blob([data.content]).size,
      content: data.content,
      createdAt: now,
      updatedAt: now,
    };
    await db.files.add(file);
    return file;
  }

  async function uploadFile(data: { workspaceId: string; file: File }) {
    const now = new Date().toISOString();
    const blobKey = generateId();
    let type: WorkspaceFileType = 'other';
    if (data.file.type.startsWith('image/')) type = 'image';
    else if (data.file.type.includes('pdf') || data.file.type.includes('document') || data.file.type.includes('text'))
      type = 'document';

    await db.fileBlobs.add({ id: blobKey, blob: data.file });

    const fileRecord: WorkspaceFile = {
      id: generateId(),
      workspaceId: data.workspaceId,
      name: data.file.name,
      type,
      mimeType: data.file.type,
      size: data.file.size,
      blobKey,
      createdAt: now,
      updatedAt: now,
    };
    await db.files.add(fileRecord);
    return fileRecord;
  }

  async function updateNote(id: string, content: string) {
    await db.files.update(id, {
      content,
      size: new Blob([content]).size,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteFile(id: string) {
    const file = await db.files.get(id);
    if (file?.blobKey) {
      await db.fileBlobs.delete(file.blobKey);
    }
    await db.files.delete(id);
  }

  async function getFileBlob(blobKey: string): Promise<Blob | undefined> {
    const record = await db.fileBlobs.get(blobKey);
    return record?.blob;
  }

  return {
    files,
    notes,
    documents,
    createNote,
    uploadFile,
    updateNote,
    deleteFile,
    getFileBlob,
  };
}
