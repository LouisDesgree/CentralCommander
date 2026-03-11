'use client';

import { useState, useCallback } from 'react';
import { useFiles } from '@/hooks/useFiles';
import { FileCard } from './FileCard';
import { NoteEditor } from './NoteEditor';
import { FileUploadButton } from './FileUploadButton';
import { Button } from '@/components/ui/Button';
import { Plus, FileText, StickyNote } from 'lucide-react';
import type { WorkspaceFile } from '@/types/workspace';

interface FileListProps {
  workspaceId: string;
}

export function FileList({ workspaceId }: FileListProps) {
  const { files, notes, documents, deleteFile, getFileBlob } = useFiles(workspaceId);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<WorkspaceFile | undefined>();

  const handleNoteClick = (file: WorkspaceFile) => {
    if (file.type === 'note') {
      setEditingNote(file);
      setShowNoteEditor(true);
    }
  };

  const handleFileOpen = useCallback(async (file: WorkspaceFile) => {
    if (!file.blobKey) return;
    const blob = await getFileBlob(file.blobKey);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }, [getFileBlob]);

  const handleNewNote = () => {
    setEditingNote(undefined);
    setShowNoteEditor(true);
  };

  if (files.length === 0) {
    return (
      <div className="px-4">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
            <FileText className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-sm text-gray-400 mb-4">No files yet</p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<StickyNote className="w-4 h-4" />} onClick={handleNewNote}>
              New Note
            </Button>
            <FileUploadButton workspaceId={workspaceId} />
          </div>
        </div>

        <NoteEditor
          open={showNoteEditor}
          onClose={() => setShowNoteEditor(false)}
          workspaceId={workspaceId}
          existingNote={editingNote}
        />
      </div>
    );
  }

  return (
    <div className="px-4 space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" icon={<StickyNote className="w-3.5 h-3.5" />} onClick={handleNewNote}>
          Note
        </Button>
        <FileUploadButton workspaceId={workspaceId} />
      </div>

      {notes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase px-1">Notes</p>
          {notes.map((file) => (
            <FileCard key={file.id} file={file} onClick={() => handleNoteClick(file)} onDelete={() => deleteFile(file.id)} />
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase px-1">Documents</p>
          {documents.map((file) => (
            <FileCard key={file.id} file={file} onClick={() => handleFileOpen(file)} onDelete={() => deleteFile(file.id)} />
          ))}
        </div>
      )}

      <NoteEditor
        open={showNoteEditor}
        onClose={() => setShowNoteEditor(false)}
        workspaceId={workspaceId}
        existingNote={editingNote}
      />
    </div>
  );
}
