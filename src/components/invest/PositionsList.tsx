'use client';

import { PositionListItem } from './PositionListItem';
import { Button } from '@/components/ui/Button';
import { Plus, BarChart3 } from 'lucide-react';
import type { PortfolioPosition } from '@/types/investment';

interface PositionsListProps {
  positions: PortfolioPosition[];
  onAddPosition: () => void;
  onTapPosition: (id: string) => void;
}

export function PositionsList({ positions, onAddPosition, onTapPosition }: PositionsListProps) {
  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
          <BarChart3 className="w-7 h-7 text-blue-400" />
        </div>
        <p className="text-sm text-gray-400 mb-1">No positions yet</p>
        <p className="text-xs text-gray-500 mb-4 text-center">Add your first investment to start tracking</p>
        <Button variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={onAddPosition}>
          Add Position
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-400 uppercase">{positions.length} Position{positions.length !== 1 ? 's' : ''}</p>
        <Button variant="ghost" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={onAddPosition}>
          Add
        </Button>
      </div>
      <div className="bg-white/5 dark:bg-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        {positions.map((pos) => (
          <PositionListItem key={pos.id} position={pos} onTap={() => onTapPosition(pos.id)} />
        ))}
      </div>
    </div>
  );
}
