'use client';

import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/investment-utils';

interface ChartDataPoint {
  date: string;
  value: number;
  costBasis: number;
  pnl: number;
}

interface GrowthChartProps {
  data: ChartDataPoint[];
  currency?: string;
  mini?: boolean;
}

type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'All';

function filterByRange(data: ChartDataPoint[], range: TimeRange): ChartDataPoint[] {
  if (range === 'All' || data.length === 0) return data;

  const now = new Date();
  const cutoff = new Date();
  switch (range) {
    case '1W': cutoff.setDate(now.getDate() - 7); break;
    case '1M': cutoff.setMonth(now.getMonth() - 1); break;
    case '3M': cutoff.setMonth(now.getMonth() - 3); break;
    case '6M': cutoff.setMonth(now.getMonth() - 6); break;
    case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break;
  }

  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return data.filter((d) => d.date >= cutoffStr);
}

export function GrowthChart({ data, currency = 'USD', mini = false }: GrowthChartProps) {
  const [range, setRange] = useState<TimeRange>('All');
  const filtered = useMemo(() => filterByRange(data, range), [data, range]);

  if (data.length === 0) {
    return (
      <GlassCard padding="md" className="mx-4">
        <h4 className="text-sm font-semibold mb-2">Growth</h4>
        <p className="text-xs text-gray-400 py-8 text-center">No data yet. Growth chart will appear as snapshots are recorded daily.</p>
      </GlassCard>
    );
  }

  const ranges: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y', 'All'];

  return (
    <GlassCard padding="md" className="mx-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Growth</h4>
        {!mini && (
          <div className="flex gap-1">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-medium transition-all',
                  range === r ? 'bg-blue-500/15 text-blue-500' : 'text-gray-500 hover:text-gray-400'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={mini ? 'h-32' : 'h-52'}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            {!mini && (
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#6B7280' }}
                tickFormatter={(d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                stroke="rgba(255,255,255,0.1)"
              />
            )}
            {!mini && (
              <YAxis
                tick={{ fontSize: 10, fill: '#6B7280' }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                stroke="rgba(255,255,255,0.1)"
                width={45}
              />
            )}
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value), currency), 'Value']}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#valueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
