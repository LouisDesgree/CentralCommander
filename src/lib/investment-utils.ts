import type {
  PortfolioPosition,
  PortfolioSummary,
  AllocationSlice,
  AssetType,
  StrategyParams,
  GrowthProjection,
} from '@/types/investment';

export const assetTypeColors: Record<AssetType, string> = {
  stock: '#3B82F6',
  etf: '#8B5CF6',
  crypto: '#F59E0B',
  commodity: '#10B981',
  bond: '#6366F1',
  other: '#6B7280',
};

export const assetTypeLabels: Record<AssetType, string> = {
  stock: 'Stocks',
  etf: 'ETFs',
  crypto: 'Crypto',
  commodity: 'Commodities',
  bond: 'Bonds',
  other: 'Other',
};

export function calculatePnL(position: PortfolioPosition) {
  const currentValue = position.quantity * position.currentPrice;
  const costBasis = position.quantity * position.avgCostBasis;
  const pnl = currentValue - costBasis;
  const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
  return { pnl, pnlPercent, currentValue, costBasis };
}

export function calculatePortfolioSummary(positions: PortfolioPosition[]): PortfolioSummary {
  let totalValue = 0;
  let totalCostBasis = 0;
  let topGainer: PortfolioSummary['topGainer'] = undefined;
  let topLoser: PortfolioSummary['topLoser'] = undefined;

  for (const pos of positions) {
    const { currentValue, costBasis, pnlPercent } = calculatePnL(pos);
    totalValue += currentValue;
    totalCostBasis += costBasis;

    if (!topGainer || pnlPercent > topGainer.pnlPercent) {
      topGainer = { ticker: pos.ticker, pnlPercent };
    }
    if (!topLoser || pnlPercent < topLoser.pnlPercent) {
      topLoser = { ticker: pos.ticker, pnlPercent };
    }
  }

  const totalPnL = totalValue - totalCostBasis;
  const totalPnLPercent = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;

  return {
    totalValue,
    totalCostBasis,
    totalPnL,
    totalPnLPercent,
    positionCount: positions.length,
    topGainer: topGainer && topGainer.pnlPercent > 0 ? topGainer : undefined,
    topLoser: topLoser && topLoser.pnlPercent < 0 ? topLoser : undefined,
  };
}

export function calculateAllocations(positions: PortfolioPosition[]): AllocationSlice[] {
  const groups: Record<AssetType, number> = {
    stock: 0, etf: 0, crypto: 0, commodity: 0, bond: 0, other: 0,
  };

  let total = 0;
  for (const pos of positions) {
    const value = pos.quantity * pos.currentPrice;
    groups[pos.assetType] += value;
    total += value;
  }

  return (Object.entries(groups) as [AssetType, number][])
    .filter(([, value]) => value > 0)
    .map(([assetType, value]) => ({
      assetType,
      label: assetTypeLabels[assetType],
      value,
      percent: total > 0 ? (value / total) * 100 : 0,
      color: assetTypeColors[assetType],
    }))
    .sort((a, b) => b.value - a.value);
}

export function projectGrowth(
  currentValue: number,
  params: StrategyParams
): GrowthProjection[] {
  const projections: GrowthProjection[] = [];

  for (let year = 0; year <= params.yearsToProject; year++) {
    const projected = currentValue * Math.pow(1 + params.annualReturnEstimate, year);
    const withInflation = projected / Math.pow(1 + params.inflationRate, year);
    projections.push({
      year,
      projected: Math.round(projected * 100) / 100,
      withInflation: Math.round(withInflation * 100) / 100,
    });
  }

  return projections;
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatCompactCurrency(value: number, currency = 'USD'): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${currency === 'USD' ? '$' : ''}${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${currency === 'USD' ? '$' : ''}${(value / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(value, currency);
}
