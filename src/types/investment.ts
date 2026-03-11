export type AssetType = 'stock' | 'etf' | 'crypto' | 'commodity' | 'bond' | 'other';
export type PositionSource = 'manual' | 'etoro';

export interface PortfolioPosition {
  id: string;
  ticker: string;
  name: string;
  assetType: AssetType;
  quantity: number;
  avgCostBasis: number;
  currentPrice: number;
  currency: string;
  source: PositionSource;
  etoroPositionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SnapshotPosition {
  ticker: string;
  value: number;
  quantity: number;
  price: number;
}

export interface PortfolioSnapshot {
  id: string;
  date: string;
  totalValue: number;
  totalCostBasis: number;
  positions: SnapshotPosition[];
  createdAt: string;
}

export interface InvestmentSettings {
  id: string;
  etoroApiKey?: string;
  etoroUsername?: string;
  etoroConnected: boolean;
  defaultCurrency: string;
  snapshotFrequency: 'daily' | 'weekly';
  lastSyncAt?: string;
  strategyParams?: StrategyParams;
}

export interface StrategyParams {
  annualReturnEstimate: number;
  inflationRate: number;
  yearsToProject: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCostBasis: number;
  totalPnL: number;
  totalPnLPercent: number;
  positionCount: number;
  topGainer?: { ticker: string; pnlPercent: number };
  topLoser?: { ticker: string; pnlPercent: number };
}

export interface AllocationSlice {
  assetType: AssetType;
  label: string;
  value: number;
  percent: number;
  color: string;
}

export interface GrowthProjection {
  year: number;
  projected: number;
  withInflation: number;
}
