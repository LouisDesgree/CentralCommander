'use client';

import { PortfolioSummaryCards } from './PortfolioSummaryCards';
import { SmartInsights } from './SmartInsights';
import { AllocationChart } from './AllocationChart';
import { GrowthChart } from './GrowthChart';
import { EtoroConnectCard } from './EtoroConnectCard';
import type { PortfolioSummary, AllocationSlice, PortfolioPosition, PortfolioSnapshot } from '@/types/investment';

interface PortfolioOverviewProps {
  summary: PortfolioSummary;
  allocations: AllocationSlice[];
  positions: PortfolioPosition[];
  snapshots: PortfolioSnapshot[];
  chartData: { date: string; value: number; costBasis: number; pnl: number }[];
  currency?: string;
  onSync?: () => Promise<void>;
  isSyncing?: boolean;
}

export function PortfolioOverview({
  summary,
  allocations,
  positions,
  snapshots,
  chartData,
  currency = 'USD',
  onSync,
  isSyncing,
}: PortfolioOverviewProps) {
  return (
    <div className="space-y-4">
      <PortfolioSummaryCards summary={summary} currency={currency} />
      <SmartInsights positions={positions} snapshots={snapshots} />
      <AllocationChart allocations={allocations} currency={currency} />
      <GrowthChart data={chartData} currency={currency} mini />
      <EtoroConnectCard onSync={onSync} isSyncing={isSyncing} />
    </div>
  );
}
