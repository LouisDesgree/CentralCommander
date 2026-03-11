'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import type { AllocationSlice } from '@/types/investment';
import { formatCurrency, formatPercent } from '@/lib/investment-utils';

interface AllocationChartProps {
  allocations: AllocationSlice[];
  currency?: string;
}

export function AllocationChart({ allocations, currency = 'USD' }: AllocationChartProps) {
  if (allocations.length === 0) return null;

  return (
    <GlassCard padding="md" className="mx-4">
      <h4 className="text-sm font-semibold mb-3">Allocation</h4>
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocations}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {allocations.map((slice, i) => (
                  <Cell key={i} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), currency)}
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {allocations.map((slice) => (
            <div key={slice.assetType} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="text-xs text-gray-400 flex-1">{slice.label}</span>
              <span className="text-xs font-medium">{slice.percent.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
