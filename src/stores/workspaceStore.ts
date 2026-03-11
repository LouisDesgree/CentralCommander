import { create } from 'zustand';

interface WorkspaceStore {
  activeWorkspaceId: string | null;
  activeTab: 'emails' | 'todos' | 'files';
  isCreating: boolean;
  isAddingEmail: boolean;
  setActiveWorkspace: (id: string | null) => void;
  setActiveTab: (tab: 'emails' | 'todos' | 'files') => void;
  setIsCreating: (creating: boolean) => void;
  setIsAddingEmail: (adding: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  activeWorkspaceId: null,
  activeTab: 'emails',
  isCreating: false,
  isAddingEmail: false,
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsCreating: (creating) => set({ isCreating: creating }),
  setIsAddingEmail: (adding) => set({ isAddingEmail: adding }),
}));
