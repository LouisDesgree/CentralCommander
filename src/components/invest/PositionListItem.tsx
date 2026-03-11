'use client';

import { Badge } from '@/components/ui/Badge';
import type { PortfolioPosition } from '@/types/investment';
import { calculatePnL, formatCurrency, formatPercent, assetTypeLabels } from '@/lib/investment-utils';

interface PositionListItemProps {
  position: PortfolioPosition;
  onTap: () => void;
}

export function PositionListItem({ position, onTap }: PositionListItemProps) {
  const { pnl, pnlPercent, currentValue } = calculatePnL(position);
  const isProfitable = pnl >= 0;

  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-white/5 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-gray-400">
          {position.ticker.slice(0, 3)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{position.ticker}</p>
          <Badge variant="default" className="text-[9px]">
            {assetTypeLabels[position.assetType]}
          </Badge>
        </div>
        <p className="text-xs text-gray-400 truncate">{position.name}</p>
        <p className="text-[10px] text-gray-500">
          {position.quantity} × {formatCurrency(position.currentPrice, position.currency)}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-semibold">{formatCurrency(currentValue, position.currency)}</p>
        <p className={`text-xs font-medium ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
          {formatPercent(pnlPercent)}
        </p>
        <p className={`text-[10px] ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
          {isProfitable ? '+' : ''}{formatCurrency(pnl, position.currency)}
        </p>
      </div>
    </button>
  );
}
