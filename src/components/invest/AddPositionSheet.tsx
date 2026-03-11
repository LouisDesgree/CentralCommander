'use client';

import { useState } from 'react';
import { GlassSheet } from '@/components/ui/GlassSheet';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { AssetType } from '@/types/investment';
import { cn } from '@/lib/cn';

interface AddPositionSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    ticker: string;
    name: string;
    assetType: AssetType;
    quantity: number;
    avgCostBasis: number;
    currentPrice: number;
    notes?: string;
  }) => Promise<void>;
}

const assetTypes: { label: string; value: AssetType }[] = [
  { label: 'Stock', value: 'stock' },
  { label: 'ETF', value: 'etf' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Commodity', value: 'commodity' },
  { label: 'Bond', value: 'bond' },
  { label: 'Other', value: 'other' },
];

export function AddPositionSheet({ open, onClose, onSave }: AddPositionSheetProps) {
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const isValid = ticker.trim() && name.trim() && Number(quantity) > 0 && Number(avgCost) > 0 && Number(currentPrice) > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await onSave({
        ticker: ticker.trim().toUpperCase(),
        name: name.trim(),
        assetType,
        quantity: Number(quantity),
        avgCostBasis: Number(avgCost),
        currentPrice: Number(currentPrice),
        notes: notes.trim() || undefined,
      });
      // Reset form
      setTicker(''); setName(''); setAssetType('stock');
      setQuantity(''); setAvgCost(''); setCurrentPrice(''); setNotes('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassSheet open={open} onClose={onClose}>
      <div className="px-6 pb-8 space-y-4">
        <h3 className="text-lg font-semibold">Add Position</h3>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Ticker" placeholder="AAPL" value={ticker} onChange={(e) => setTicker(e.target.value)} />
          <Input label="Name" placeholder="Apple Inc." value={name} onChange={(e) => setName(e.target.value)} />
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
          <Input label="Quantity" type="number" step="any" placeholder="10" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <Input label="Avg Cost" type="number" step="any" placeholder="150.00" value={avgCost} onChange={(e) => setAvgCost(e.target.value)} />
          <Input label="Current $" type="number" step="any" placeholder="175.00" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} />
        </div>

        <Input label="Notes (optional)" placeholder="Entry reason, strategy..." value={notes} onChange={(e) => setNotes(e.target.value)} />

        <Button onClick={handleSave} loading={saving} disabled={!isValid} className="w-full">
          Add Position
        </Button>
      </div>
    </GlassSheet>
  );
}
