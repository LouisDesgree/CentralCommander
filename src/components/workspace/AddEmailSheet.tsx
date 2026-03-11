'use client';

import { useState } from 'react';
import { GlassSheet } from '@/components/ui/GlassSheet';
import { GlassCard } from '@/components/ui/GlassCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { Check, Mail } from 'lucide-react';
import useSWR from 'swr';

interface AddEmailSheetProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  existingEmailIds: string[];
}

export function AddEmailSheet({ open, onClose, workspaceId, existingEmailIds }: AddEmailSheetProps) {
  const [query, setQuery] = useState('');
  const { addEmailToWorkspace } = useWorkspaces();

  const { data, isLoading } = useSWR(
    open ? `/api/gmail/messages?q=${encodeURIComponent(query)}&maxResults=20` : null,
    (url: string) => fetch(url).then((r) => r.json())
  );

  const emails = data?.emails ?? [];

  const handleToggle = async (emailId: string) => {
    if (existingEmailIds.includes(emailId)) return;
    await addEmailToWorkspace(workspaceId, emailId);
  };

  return (
    <GlassSheet open={open} onClose={onClose}>
      <div className="px-6 pb-8 space-y-4 max-h-[70vh]">
        <h2 className="text-lg font-semibold">Add Emails</h2>
        <SearchBar
          placeholder="Search emails..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
        />

        <div className="space-y-2 overflow-y-auto max-h-[50vh]">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          )}
          {!isLoading && emails.length === 0 && (
            <div className="flex flex-col items-center py-8">
              <Mail className="w-6 h-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-400">No emails found</p>
            </div>
          )}
          {emails.map((email: { id: string; from: { name: string; email: string }; subject: string; date: string }) => {
            const isLinked = existingEmailIds.includes(email.id);
            return (
              <GlassCard
                key={email.id}
                interactive={!isLinked}
                padding="sm"
                onClick={() => handleToggle(email.id)}
                className="flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{email.from?.name || email.from?.email}</p>
                  <p className="text-xs text-gray-400 truncate">{email.subject}</p>
                </div>
                {isLinked && (
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </GlassSheet>
  );
}
