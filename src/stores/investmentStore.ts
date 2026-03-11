import { create } from 'zustand';

export type InvestTab = 'overview' | 'positions' | 'growth' | 'strategy';

interface InvestmentStore {
  activeTab: InvestTab;
  isAddingPosition: boolean;
  editingPositionId: string | null;
  isSyncing: boolean;
  setActiveTab: (tab: InvestTab) => void;
  setIsAddingPosition: (adding: boolean) => void;
  setEditingPositionId: (id: string | null) => void;
  setIsSyncing: (syncing: boolean) => void;
}

export const useInvestmentStore = create<InvestmentStore>((set) => ({
  activeTab: 'overview',
  isAddingPosition: false,
  editingPositionId: null,
  isSyncing: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsAddingPosition: (adding) => set({ isAddingPosition: adding }),
  setEditingPositionId: (id) => set({ editingPositionId: id }),
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
}));
