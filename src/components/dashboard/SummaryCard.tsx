'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

export function SummaryCard({ title, value, icon: Icon, color }: SummaryCardProps) {
  return (
    <GlassCard interactive padding="md" className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-400">{title}</p>
      </div>
    </GlassCard>
  );
}
