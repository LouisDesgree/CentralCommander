import { useMemo } from 'react';
import type { StrategyParams, GrowthProjection } from '@/types/investment';
import { projectGrowth } from '@/lib/investment-utils';

const DEFAULT_PARAMS: StrategyParams = {
  annualReturnEstimate: 0.08,
  inflationRate: 0.03,
  yearsToProject: 10,
};

export function useGrowthProjection(
  currentValue: number,
  params?: StrategyParams
): GrowthProjection[] {
  const resolvedParams = params ?? DEFAULT_PARAMS;

  return useMemo(
    () => projectGrowth(currentValue, resolvedParams),
    [currentValue, resolvedParams.annualReturnEstimate, resolvedParams.inflationRate, resolvedParams.yearsToProject]
  );
}
