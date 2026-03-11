'use client';

import { useState, useEffect } from 'react';
import { GlassSheet } from '@/components/ui/GlassSheet';
import { Button } from '@/components/ui/Button';
import { useFiles } from '@/hooks/useFiles';
import type { WorkspaceFile } from '@/types/workspace';

interface NoteEditorProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  existingNote?: WorkspaceFile;
}

export function NoteEditor({ open, onClose, workspaceId, existingNote }: NoteEditorProps) {
  const { createNote, updateNote } = useFiles(workspaceId);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (existingNote) {
      setName(existingNote.name);
      setContent(existingNote.content ?? '');
    } else {
      setName('');
      setContent('');
    }
  }, [existingNote, open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (existingNote) {
      await updateNote(existingNote.id, content);
    } else {
      await createNote({ workspaceId, name: name.trim(), content });
    }
    onClose();
  };

  return (
    <GlassSheet open={open} onClose={onClose}>
      <div className="px-6 pb-8 space-y-4">
        <h2 className="text-lg font-semibold">{existingNote ? 'Edit Note' : 'New Note'}</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Note title..."
          className="w-full h-10 px-3 rounded-xl bg-black/5 dark:bg-white/10 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow"
          autoFocus
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something..."
          rows={8}
          className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow resize-none font-mono"
        />

        <Button onClick={handleSave} disabled={!name.trim()} className="w-full">
          {existingNote ? 'Save' : 'Create Note'}
        </Button>
      </div>
    </GlassSheet>
  );
}
