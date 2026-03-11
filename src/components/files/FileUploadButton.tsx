'use client';

import { useRef } from 'react';
import { useFiles } from '@/hooks/useFiles';
import { Upload } from 'lucide-react';

interface FileUploadButtonProps {
  workspaceId: string;
}

export function FileUploadButton({ workspaceId }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useFiles(workspaceId);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      await uploadFile({ workspaceId, file: files[i] });
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <Upload className="w-3.5 h-3.5" />
        Upload
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
}
