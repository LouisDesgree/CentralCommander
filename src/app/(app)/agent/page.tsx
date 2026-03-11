'use client';

import { TopBar } from '@/components/layout/TopBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { AgentChat } from '@/components/agent/AgentChat';
import { Trash2 } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { ParticleField } from '@/components/ui/ParticleField';

export default function AgentPage() {
  const clearMessages = useAgentStore((s) => s.clearMessages);

  return (
    <>
      <TopBar
        title="AI Assistant"
        trailing={
          <button
            onClick={clearMessages}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        }
      />
      <PageTransition>
        <div className="relative">
          <ParticleField count={20} maxOpacity={0.12} speed={0.1} />
          <div className="relative z-10">
            <AgentChat />
          </div>
        </div>
      </PageTransition>
    </>
  );
}
