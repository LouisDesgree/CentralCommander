'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateId } from '@/lib/db';
import type { PortfolioPosition, AssetType, PositionSource } from '@/types/investment';
import { calculatePortfolioSummary, calculateAllocations } from '@/lib/investment-utils';

export function usePortfolio() {
  const positions = useLiveQuery(() => db.portfolioPositions.toArray(), [], []);

  const summary = calculatePortfolioSummary(positions);
  const allocations = calculateAllocations(positions);

  async function addPosition(data: {
    ticker: string;
    name: string;
    assetType: AssetType;
    quantity: number;
    avgCostBasis: number;
    currentPrice: number;
    currency?: string;
    source?: PositionSource;
    notes?: string;
  }) {
    const now = new Date().toISOString();
    const position: PortfolioPosition = {
      id: generateId(),
      ticker: data.ticker.toUpperCase(),
      name: data.name,
      assetType: data.assetType,
      quantity: data.quantity,
      avgCostBasis: data.avgCostBasis,
      currentPrice: data.currentPrice,
      currency: data.currency ?? 'USD',
      source: data.source ?? 'manual',
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
    await db.portfolioPositions.add(position);
    return position;
  }

  async function updatePosition(id: string, changes: Partial<PortfolioPosition>) {
    await db.portfolioPositions.update(id, {
      ...changes,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deletePosition(id: string) {
    await db.portfolioPositions.delete(id);
  }

  async function updatePrice(id: string, newPrice: number) {
    await db.portfolioPositions.update(id, {
      currentPrice: newPrice,
      updatedAt: new Date().toISOString(),
    });
  }

  async function takeSnapshot() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    // Check if snapshot already exists for today
    const existing = await db.portfolioSnapshots.where('date').equals(dateStr).first();
    if (existing) return existing;

    const allPositions = await db.portfolioPositions.toArray();
    if (allPositions.length === 0) return null;

    const snap = {
      id: generateId(),
      date: dateStr,
      totalValue: allPositions.reduce((sum, p) => sum + p.quantity * p.currentPrice, 0),
      totalCostBasis: allPositions.reduce((sum, p) => sum + p.quantity * p.avgCostBasis, 0),
      positions: allPositions.map((p) => ({
        ticker: p.ticker,
        value: p.quantity * p.currentPrice,
        quantity: p.quantity,
        price: p.currentPrice,
      })),
      createdAt: now.toISOString(),
    };
    await db.portfolioSnapshots.add(snap);
    return snap;
  }

  return {
    positions,
    summary,
    allocations,
    addPosition,
    updatePosition,
    deletePosition,
    updatePrice,
    takeSnapshot,
  };
}
