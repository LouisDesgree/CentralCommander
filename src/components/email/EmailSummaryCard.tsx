'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Sparkles, CheckCircle } from 'lucide-react';

interface EmailSummaryCardProps {
  emailId: string;
}

interface Summary {
  summary: string;
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
}

const priorityVariant = {
  high: 'danger' as const,
  medium: 'warning' as const,
  low: 'success' as const,
};

export function EmailSummaryCard({ emailId }: EmailSummaryCardProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/agent/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailId }),
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch {
        // Silently fail - summary is optional
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [emailId]);

  if (loading) {
    return (
      <GlassCard variant="elevated" padding="md" className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-purple-500 shrink-0" />
        <div className="flex items-center gap-2">
          <Spinner size={16} />
          <span className="text-sm text-gray-400">Analyzing email...</span>
        </div>
      </GlassCard>
    );
  }

  if (!summary) return null;

  return (
    <GlassCard variant="elevated" padding="md" className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <span className="text-sm font-semibold">AI Summary</span>
        <Badge variant={priorityVariant[summary.priority]}>{summary.priority}</Badge>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">{summary.summary}</p>
      {summary.actionItems.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-gray-400 uppercase">Action Items</span>
          {summary.actionItems.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
