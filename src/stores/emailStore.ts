import { create } from 'zustand';
import type { EmailCategory } from '@/types/email';

interface EmailStore {
  selectedEmailId: string | null;
  searchQuery: string;
  activeCategory: EmailCategory | null;
  setSelectedEmail: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: EmailCategory | null) => void;
}

export const useEmailStore = create<EmailStore>((set) => ({
  selectedEmailId: null,
  searchQuery: '',
  activeCategory: null,
  setSelectedEmail: (id) => set({ selectedEmailId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),
}));
