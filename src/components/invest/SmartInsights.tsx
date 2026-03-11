'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { PortfolioScore } from './PortfolioScore';
import {
  ShieldAlert, TrendingUp, PieChart, Activity, RefreshCw, Trophy, Sparkles, AlertTriangle,
} from 'lucide-react';
import type { PortfolioPosition, PortfolioSnapshot } from '@/types/investment';
import type { PortfolioInsight, PortfolioAnalysis } from '@/lib/portfolio-analysis';

interface SmartInsightsProps {
  positions: PortfolioPosition[];
  snapshots: PortfolioSnapshot[];
}

const insightConfig: Record<string, { icon: typeof ShieldAlert; color: string; bg: string }> = {
  risk: { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
  opportunity: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
  diversification: { icon: PieChart, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  performance: { icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  rebalance: { icon: RefreshCw, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  milestone: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
};

function InsightCard({ insight }: { insight: PortfolioInsight }) {
  const config = insightConfig[insight.type] ?? insightConfig.performance;
  const Icon = config.icon;

  return (
    <div className="flex gap-3 py-3">
      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium">{insight.title}</p>
          {insight.severity === 'high' && (
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">{insight.body}</p>
        {insight.action && (
          <p className="text-xs text-blue-400 mt-1">{insight.action}</p>
        )}
      </div>
    </div>
  );
}

export function SmartInsights({ positions, snapshots }: SmartInsightsProps) {
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    if (positions.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/agent/analyze-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positions, snapshots }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data: PortfolioAnalysis = await res.json();
      setAnalysis(data);
    } catch {
      setError('Could not analyze portfolio');
    } finally {
      setLoading(false);
    }
  }, [positions, snapshots]);

  // Auto-analyze when positions change
  useEffect(() => {
    if (positions.length > 0 && !analysis && !loading) {
      analyze();
    }
  }, [positions.length]);

  if (positions.length === 0) return null;

  return (
    <div className="space-y-4">
      <PortfolioScore
        score={analysis?.portfolioScore ?? 0}
        summary={analysis?.summary ?? 'Analyzing your portfolio...'}
        loading={loading}
      />

      <GlassCard padding="md" className="mx-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold">Insights</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="w-3 h-3" />}
            onClick={analyze}
            loading={loading}
          >
            {loading ? 'Analyzing' : 'Refresh'}
          </Button>
        </div>

        {loading && !analysis && (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-white/10 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 py-4 text-center">{error}</p>
        )}

        {analysis && analysis.insights.length > 0 && (
          <div className="divide-y divide-white/5">
            {analysis.insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        )}

        {analysis && analysis.insights.length === 0 && !loading && (
          <p className="text-xs text-gray-400 py-4 text-center">No insights available. Add more positions for analysis.</p>
        )}
      </GlassCard>
    </div>
  );
}
