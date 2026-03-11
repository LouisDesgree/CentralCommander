'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { useGrowthProjection } from '@/hooks/useGrowthProjection';
import { useInvestmentSettings } from '@/hooks/useInvestmentSettings';
import { formatCurrency } from '@/lib/investment-utils';
import type { StrategyParams } from '@/types/investment';

interface StrategyProjectionProps {
  currentValue: number;
  currency?: string;
}

export function StrategyProjection({ currentValue, currency = 'USD' }: StrategyProjectionProps) {
  const { settings, updateStrategyParams } = useInvestmentSettings();
  const params: StrategyParams = settings.strategyParams ?? {
    annualReturnEstimate: 0.08,
    inflationRate: 0.03,
    yearsToProject: 10,
  };
  const projections = useGrowthProjection(currentValue, params);

  const handleParam = (key: keyof StrategyParams, raw: string) => {
    const value = key === 'yearsToProject' ? parseInt(raw) || 0 : parseFloat(raw) / 100 || 0;
    updateStrategyParams({ [key]: value });
  };

  return (
    <div className="space-y-4 px-4">
      <GlassCard padding="md">
        <h4 className="text-sm font-semibold mb-3">Projection</h4>
        {currentValue > 0 ? (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projections} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  tickFormatter={(y) => `Y${y}`}
                  stroke="rgba(255,255,255,0.1)"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  stroke="rgba(255,255,255,0.1)"
                  width={50}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value), currency),
                    name === 'projected' ? 'Projected' : 'After Inflation',
                  ]}
                  labelFormatter={(y) => `Year ${y}`}
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend
                  formatter={(value) => (value === 'projected' ? 'Projected' : 'After Inflation')}
                  wrapperStyle={{ fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="projected" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="withInflation" stroke="#8B5CF6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-8 text-center">Add positions to see projections</p>
        )}
      </GlassCard>

      <GlassCard padding="md">
        <h4 className="text-sm font-semibold mb-3">Parameters</h4>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Return %"
            type="number"
            step="0.5"
            value={String((params.annualReturnEstimate * 100).toFixed(1))}
            onChange={(e) => handleParam('annualReturnEstimate', e.target.value)}
          />
          <Input
            label="Inflation %"
            type="number"
            step="0.5"
            value={String((params.inflationRate * 100).toFixed(1))}
            onChange={(e) => handleParam('inflationRate', e.target.value)}
          />
          <Input
            label="Years"
            type="number"
            step="1"
            value={String(params.yearsToProject)}
            onChange={(e) => handleParam('yearsToProject', e.target.value)}
          />
        </div>
        {currentValue > 0 && projections.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs">
            <span className="text-gray-400">In {params.yearsToProject} years:</span>
            <span className="font-semibold text-blue-400">{formatCurrency(projections[projections.length - 1].projected, currency)}</span>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
