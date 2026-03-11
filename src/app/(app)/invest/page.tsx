'use client';

import { useEffect } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { InvestTabs } from '@/components/invest/InvestTabs';
import { PortfolioOverview } from '@/components/invest/PortfolioOverview';
import { PositionsList } from '@/components/invest/PositionsList';
import { GrowthChart } from '@/components/invest/GrowthChart';
import { StrategyProjection } from '@/components/invest/StrategyProjection';
import { AddPositionSheet } from '@/components/invest/AddPositionSheet';
import { EditPositionSheet } from '@/components/invest/EditPositionSheet';
import { usePortfolio } from '@/hooks/usePortfolio';
import { usePortfolioHistory } from '@/hooks/usePortfolioHistory';
import { useEtoroSync } from '@/hooks/useEtoroSync';
import { useInvestmentStore } from '@/stores/investmentStore';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function InvestPage() {
  const { activeTab, setActiveTab, isAddingPosition, setIsAddingPosition, editingPositionId, setEditingPositionId } = useInvestmentStore();
  const { positions, summary, allocations, addPosition, updatePosition, deletePosition, takeSnapshot } = usePortfolio();
  const { chartData, snapshots } = usePortfolioHistory();
  const { syncPortfolio, isSyncing } = useEtoroSync();

  const editingPosition = editingPositionId
    ? positions.find((p) => p.id === editingPositionId) ?? null
    : null;

  // Take a daily snapshot when the page loads
  useEffect(() => {
    if (positions.length > 0) {
      takeSnapshot();
    }
  }, [positions.length > 0]);

  return (
    <>
      <TopBar
        title="Invest"
        trailing={
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddingPosition(true)}
          >
            Add
          </Button>
        }
      />
      <PageTransition>
        <InvestTabs active={activeTab} onChange={setActiveTab} />

        <div className="py-2">
          {activeTab === 'overview' && (
            <PortfolioOverview
              summary={summary}
              allocations={allocations}
              positions={positions}
              snapshots={snapshots}
              chartData={chartData}
              onSync={syncPortfolio}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'positions' && (
            <PositionsList
              positions={positions}
              onAddPosition={() => setIsAddingPosition(true)}
              onTapPosition={(id) => setEditingPositionId(id)}
            />
          )}

          {activeTab === 'growth' && (
            <div className="space-y-4">
              <GrowthChart data={chartData} />
            </div>
          )}

          {activeTab === 'strategy' && (
            <StrategyProjection currentValue={summary.totalValue} />
          )}
        </div>
      </PageTransition>

      <AddPositionSheet
        open={isAddingPosition}
        onClose={() => setIsAddingPosition(false)}
        onSave={async (data) => { await addPosition(data); }}
      />

      <EditPositionSheet
        open={!!editingPositionId}
        position={editingPosition}
        onClose={() => setEditingPositionId(null)}
        onSave={updatePosition}
        onDelete={async (id) => { await deletePosition(id); }}
      />
    </>
  );
}
