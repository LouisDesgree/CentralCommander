'use client';

import { useState, useCallback } from 'react';
import { db, generateId } from '@/lib/db';
import { useInvestmentSettings } from './useInvestmentSettings';

export function useEtoroSync() {
  const { settings, updateSettings } = useInvestmentSettings();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  const syncPortfolio = useCallback(async () => {
    if (!settings.etoroConnected || !settings.etoroApiKey) {
      setLastSyncError('Not connected to eToro');
      return;
    }

    setIsSyncing(true);
    setLastSyncError(null);

    try {
      const res = await fetch('/api/etoro/portfolio', {
        headers: { 'X-Etoro-Api-Key': settings.etoroApiKey },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `API error ${res.status}`);
      }

      const { positions: etoroPositions } = await res.json();
      const now = new Date().toISOString();

      for (const ep of etoroPositions) {
        // Check if we already have this eToro position
        const existing = await db.portfolioPositions
          .filter((p) => p.etoroPositionId === ep.etoroPositionId)
          .first();

        if (existing) {
          // Update existing position
          await db.portfolioPositions.update(existing.id, {
            currentPrice: ep.currentPrice || existing.currentPrice,
            quantity: ep.quantity || existing.quantity,
            updatedAt: now,
          });
        } else {
          // Create new position from eToro
          await db.portfolioPositions.add({
            id: generateId(),
            ticker: ep.ticker,
            name: ep.name,
            assetType: 'stock', // Default; user can edit
            quantity: ep.quantity,
            avgCostBasis: ep.avgCostBasis,
            currentPrice: ep.currentPrice,
            currency: 'USD',
            source: 'etoro',
            etoroPositionId: ep.etoroPositionId,
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      await updateSettings({ lastSyncAt: now });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      setLastSyncError(msg);
      console.error('eToro sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [settings.etoroConnected, settings.etoroApiKey, updateSettings]);

  return {
    syncPortfolio,
    isSyncing,
    lastSyncError,
    lastSyncAt: settings.lastSyncAt ?? null,
  };
}
