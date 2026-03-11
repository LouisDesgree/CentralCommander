import { create } from 'zustand';
import type { EmailCategory } from '@/types/email';

export type Mailbox = 'inbox' | 'sent' | 'all';

interface EmailStore {
  selectedEmailId: string | null;
  searchQuery: string;
  activeCategory: EmailCategory | null;
  activeMailbox: Mailbox;
  setSelectedEmail: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: EmailCategory | null) => void;
  setActiveMailbox: (mailbox: Mailbox) => void;
}

export const useEmailStore = create<EmailStore>((set) => ({
  selectedEmailId: null,
  searchQuery: '',
  activeCategory: null,
  activeMailbox: 'inbox',
  setSelectedEmail: (id) => set({ selectedEmailId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setActiveMailbox: (mailbox) => set({ activeMailbox: mailbox }),
}));
