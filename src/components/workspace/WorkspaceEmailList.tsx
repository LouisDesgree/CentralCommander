'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useTodos } from '@/hooks/useTodos';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Mail, Plus, X, CheckSquare, Loader2 } from 'lucide-react';
import useSWR from 'swr';

interface WorkspaceEmailListProps {
  workspaceId: string;
  emailIds: string[];
  onAddEmail: () => void;
}

async function fetchEmailPreviews(emailIds: string[]) {
  if (emailIds.length === 0) return [];
  const results = await Promise.all(
    emailIds.map(async (id) => {
      try {
        const res = await fetch(`/api/gmail/messages/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.email ?? null;
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean);
}

export function WorkspaceEmailList({ workspaceId, emailIds, onAddEmail }: WorkspaceEmailListProps) {
  const router = useRouter();
  const { removeEmailFromWorkspace } = useWorkspaces();
  const { createTodo } = useTodos(workspaceId);
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const { data: emails = [] } = useSWR(
    emailIds.length > 0 ? ['workspace-emails', ...emailIds] : null,
    () => fetchEmailPreviews(emailIds)
  );

  const handleExtractTodos = async (emailId: string, emailSubject: string, emailFrom: string) => {
    setExtractingId(emailId);
    try {
      const res = await fetch('/api/agent/extract-todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      for (const todo of data.todos ?? []) {
        await createTodo({
          workspaceId,
          title: todo.title,
          description: todo.description,
          priority: todo.priority ?? 'medium',
          dueDate: todo.dueDate ?? undefined,
          sourceEmailId: emailId,
          sourceEmailSubject: emailSubject,
          sourceEmailFrom: emailFrom,
          isAutoExtracted: true,
        });
      }
    } finally {
      setExtractingId(null);
    }
  };

  if (emailIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
          <Mail className="w-7 h-7 text-blue-400" />
        </div>
        <p className="text-sm text-gray-400 mb-4">No emails linked yet</p>
        <Button variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={onAddEmail}>
          Add Emails
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 px-4">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={onAddEmail}>
          Add
        </Button>
      </div>
      {emails.map((email: { id: string; from: { name: string; email: string }; subject: string; snippet: string; date: string }) => (
        <GlassCard
          key={email.id}
          interactive
          padding="sm"
          onClick={() => router.push(`/email/${email.id}`)}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{email.from?.name || email.from?.email || 'Unknown'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email.subject}</p>
              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{email.snippet}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExtractTodos(email.id, email.subject, email.from?.name || email.from?.email);
                }}
                disabled={extractingId === email.id}
                className="p-1.5 rounded-lg hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"
                title="Extract tasks"
              >
                {extractingId === email.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckSquare className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeEmailFromWorkspace(workspaceId, email.id);
                }}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
