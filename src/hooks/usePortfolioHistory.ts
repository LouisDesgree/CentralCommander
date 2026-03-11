'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function usePortfolioHistory() {
  const snapshots = useLiveQuery(
    () => db.portfolioSnapshots.orderBy('date').toArray(),
    [],
    []
  );

  const chartData = snapshots.map((s) => ({
    date: s.date,
    value: Math.round(s.totalValue * 100) / 100,
    costBasis: Math.round(s.totalCostBasis * 100) / 100,
    pnl: Math.round((s.totalValue - s.totalCostBasis) * 100) / 100,
  }));

  async function deleteSnapshot(id: string) {
    await db.portfolioSnapshots.delete(id);
  }

  return { snapshots, chartData, deleteSnapshot };
}
