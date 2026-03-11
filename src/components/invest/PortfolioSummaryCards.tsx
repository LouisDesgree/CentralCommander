'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Trophy } from 'lucide-react';
import type { PortfolioSummary } from '@/types/investment';
import { formatCurrency, formatPercent } from '@/lib/investment-utils';

interface PortfolioSummaryCardsProps {
  summary: PortfolioSummary;
  currency?: string;
}

export function PortfolioSummaryCards({ summary, currency = 'USD' }: PortfolioSummaryCardsProps) {
  const isProfitable = summary.totalPnL >= 0;

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      <GlassCard padding="sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
            <DollarSign className="w-4.5 h-4.5 text-green-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 font-medium">Total Value</p>
            <p className="text-base font-semibold truncate">{formatCurrency(summary.totalValue, currency)}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard padding="sm">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl ${isProfitable ? 'bg-green-500/10' : 'bg-red-500/10'} flex items-center justify-center shrink-0`}>
            {isProfitable ? (
              <TrendingUp className="w-4.5 h-4.5 text-green-500" />
            ) : (
              <TrendingDown className="w-4.5 h-4.5 text-red-500" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 font-medium">Total P&L</p>
            <p className={`text-base font-semibold truncate ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(summary.totalPnLPercent)}
            </p>
            <p className={`text-[10px] ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(summary.totalPnL, currency)}
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard padding="sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <BarChart3 className="w-4.5 h-4.5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 font-medium">Positions</p>
            <p className="text-base font-semibold">{summary.positionCount}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard padding="sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
            <Trophy className="w-4.5 h-4.5 text-purple-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 font-medium">Top Gainer</p>
            {summary.topGainer ? (
              <>
                <p className="text-base font-semibold truncate">{summary.topGainer.ticker}</p>
                <p className="text-[10px] text-green-400">{formatPercent(summary.topGainer.pnlPercent)}</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">—</p>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
