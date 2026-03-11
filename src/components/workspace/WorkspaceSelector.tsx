'use client';

import { useState } from 'react';
import { GlassSheet } from '@/components/ui/GlassSheet';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { Check, Plus } from 'lucide-react';
import { WorkspaceCreateSheet } from './WorkspaceCreateSheet';

interface WorkspaceSelectorProps {
  open: boolean;
  onClose: () => void;
  emailId: string;
}

export function WorkspaceSelector({ open, onClose, emailId }: WorkspaceSelectorProps) {
  const { workspaces, addEmailToWorkspace, removeEmailFromWorkspace } = useWorkspaces();
  const [showCreate, setShowCreate] = useState(false);

  const handleToggle = async (workspaceId: string, isLinked: boolean) => {
    if (isLinked) {
      await removeEmailFromWorkspace(workspaceId, emailId);
    } else {
      await addEmailToWorkspace(workspaceId, emailId);
    }
  };

  return (
    <>
      <GlassSheet open={open && !showCreate} onClose={onClose}>
        <div className="px-6 pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Add to Space</h2>
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreate(true)}
            >
              New
            </Button>
          </div>

          {workspaces.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 mb-3">No spaces yet</p>
              <Button variant="secondary" size="sm" onClick={() => setShowCreate(true)}>
                Create your first space
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {workspaces.map((ws) => {
                const isLinked = ws.emailIds.includes(emailId);
                return (
                  <GlassCard
                    key={ws.id}
                    interactive
                    padding="sm"
                    onClick={() => handleToggle(ws.id, isLinked)}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ws.color }}
                    />
                    <span className="text-sm font-medium flex-1">{ws.name}</span>
                    {isLinked && (
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </GlassSheet>

      <WorkspaceCreateSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(id) => {
          addEmailToWorkspace(id, emailId);
          setShowCreate(false);
        }}
      />
    </>
  );
}
