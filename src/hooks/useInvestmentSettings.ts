'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { InvestmentSettings, StrategyParams } from '@/types/investment';

const DEFAULT_SETTINGS: InvestmentSettings = {
  id: 'default',
  etoroConnected: false,
  defaultCurrency: 'USD',
  snapshotFrequency: 'daily',
  strategyParams: {
    annualReturnEstimate: 0.08,
    inflationRate: 0.03,
    yearsToProject: 10,
  },
};

export function useInvestmentSettings() {
  const settings = useLiveQuery(
    () => db.investmentSettings.get('default'),
    [],
    undefined
  );

  async function ensureSettings(): Promise<InvestmentSettings> {
    const existing = await db.investmentSettings.get('default');
    if (existing) return existing;
    await db.investmentSettings.add(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  async function updateSettings(changes: Partial<InvestmentSettings>) {
    await ensureSettings();
    await db.investmentSettings.update('default', changes);
  }

  async function saveEtoroApiKey(apiKey: string, username?: string) {
    await ensureSettings();
    await db.investmentSettings.update('default', {
      etoroApiKey: apiKey,
      etoroUsername: username,
      etoroConnected: true,
    });
  }

  async function clearEtoroConnection() {
    await ensureSettings();
    await db.investmentSettings.update('default', {
      etoroApiKey: undefined,
      etoroUsername: undefined,
      etoroConnected: false,
      lastSyncAt: undefined,
    });
  }

  async function updateStrategyParams(params: Partial<StrategyParams>) {
    const current = await ensureSettings();
    await db.investmentSettings.update('default', {
      strategyParams: { ...current.strategyParams, ...params } as StrategyParams,
    });
  }

  const resolved = settings ?? DEFAULT_SETTINGS;

  return {
    settings: resolved,
    updateSettings,
    saveEtoroApiKey,
    clearEtoroConnection,
    updateStrategyParams,
  };
}
