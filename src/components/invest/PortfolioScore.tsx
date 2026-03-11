'use client';

import { GlassCard } from '@/components/ui/GlassCard';

interface PortfolioScoreProps {
  score: number;
  summary: string;
  loading?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#3B82F6';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Moderate';
  return 'Needs Attention';
}

export function PortfolioScore({ score, summary, loading }: PortfolioScoreProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = loading ? 0 : (score / 100) * circumference;

  return (
    <GlassCard padding="md" className="mx-4">
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={loading ? 'rgba(255,255,255,0.1)' : color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {loading ? (
              <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
            ) : (
              <>
                <span className="text-xl font-bold" style={{ color }}>{score}</span>
                <span className="text-[9px] text-gray-400 font-medium">{label}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-1">Portfolio Health</p>
          {loading ? (
            <div className="space-y-1.5">
              <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
              <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
            </div>
          ) : (
            <p className="text-xs text-gray-400 leading-relaxed">{summary}</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
