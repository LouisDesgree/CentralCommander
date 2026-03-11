'use client';

import { cn } from '@/lib/cn';
import { LayoutDashboard, List, TrendingUp, Target } from 'lucide-react';
import type { InvestTab } from '@/stores/investmentStore';

interface InvestTabsProps {
  active: InvestTab;
  onChange: (tab: InvestTab) => void;
}

const tabs: { label: string; value: InvestTab; icon: typeof LayoutDashboard }[] = [
  { label: 'Overview', value: 'overview', icon: LayoutDashboard },
  { label: 'Positions', value: 'positions', icon: List },
  { label: 'Growth', value: 'growth', icon: TrendingUp },
  { label: 'Strategy', value: 'strategy', icon: Target },
];

export function InvestTabs({ active, onChange }: InvestTabsProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              active === tab.value
                ? 'bg-blue-500/15 text-blue-500'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
