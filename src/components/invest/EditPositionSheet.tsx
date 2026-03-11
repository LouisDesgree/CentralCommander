'use client';

import { useState, useEffect } from 'react';
import { GlassSheet } from '@/components/ui/GlassSheet';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { PortfolioPosition, AssetType } from '@/types/investment';
import { cn } from '@/lib/cn';

interface EditPositionSheetProps {
  open: boolean;
  position: PortfolioPosition | null;
  onClose: () => void;
  onSave: (id: string, changes: Partial<PortfolioPosition>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const assetTypes: { label: string; value: AssetType }[] = [
  { label: 'Stock', value: 'stock' },
  { label: 'ETF', value: 'etf' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Commodity', value: 'commodity' },
  { label: 'Bond', value: 'bond' },
  { label: 'Other', value: 'other' },
];

export function EditPositionSheet({ open, position, onClose, onSave, onDelete }: EditPositionSheetProps) {
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (position) {
      setTicker(position.ticker);
      setName(position.name);
      setAssetType(position.assetType);
      setQuantity(String(position.quantity));
      setAvgCost(String(position.avgCostBasis));
      setCurrentPrice(String(position.currentPrice));
      setNotes(position.notes ?? '');
    }
  }, [position]);

  const isValid = ticker.trim() && name.trim() && Number(quantity) > 0 && Number(avgCost) > 0 && Number(currentPrice) > 0;

  const handleSave = async () => {
    if (!isValid || !position) return;
    setSaving(true);
    try {
      await onSave(position.id, {
        ticker: ticker.trim().toUpperCase(),
        name: name.trim(),
        assetType,
        quantity: Number(quantity),
        avgCostBasis: Number(avgCost),
        currentPrice: Number(currentPrice),
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!position) return;
    await onDelete(position.id);
    onClose();
  };

  return (
    <GlassSheet open={open} onClose={onClose}>
      <div className="px-6 pb-8 space-y-4">
        <h3 className="text-lg font-semibold">Edit Position</h3>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Ticker" value={ticker} onChange={(e) => setTicker(e.target.value)} />
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Asset Type</label>
          <div className="flex flex-wrap gap-1.5">
            {assetTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setAssetType(type.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  assetType === type.value
                    ? 'bg-blue-500/15 text-blue-500'
                    : 'bg-white/10 text-gray-400 hover:text-gray-300'
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input label="Quantity" type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <Input label="Avg Cost" type="number" step="any" value={avgCost} onChange={(e) => setAvgCost(e.target.value)} />
          <Input label="Current $" type="number" step="any" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} />
        </div>

        <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="flex gap-3">
          <Button variant="danger" size="md" onClick={handleDelete} className="flex-1">
            Delete
          </Button>
          <Button onClick={handleSave} loading={saving} disabled={!isValid} className="flex-[2]">
            Save Changes
          </Button>
        </div>
      </div>
    </GlassSheet>
  );
}
