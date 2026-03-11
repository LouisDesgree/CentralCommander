'use client';

import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmailList } from '@/components/email/EmailList';
import { EmailFilterBar } from '@/components/email/EmailFilterBar';
import { MailboxTabs } from '@/components/email/MailboxTabs';
import { useEmails } from '@/hooks/useEmails';
import { useEmailStore } from '@/stores/emailStore';
import { Badge } from '@/components/ui/Badge';
import { PenLine } from 'lucide-react';
import type { Email } from '@/types/email';

const mailboxLabelIds: Record<string, string[]> = {
  inbox: ['INBOX'],
  sent: ['SENT'],
  all: [],
};

export default function EmailPage() {
  const router = useRouter();
  const { searchQuery, setSearchQuery, activeCategory, setActiveCategory, activeMailbox, setActiveMailbox } = useEmailStore();

  const labelIds = mailboxLabelIds[activeMailbox];
  const { emails, isLoading } = useEmails({
    query: searchQuery || undefined,
    labelIds,
  });

  const handleSelect = (email: Email) => {
    router.push(`/email/${email.id}`);
  };

  const unreadCount = emails.filter((e) => e.isUnread).length;
  const title = activeMailbox === 'sent' ? 'Sent' : activeMailbox === 'all' ? 'All Mail' : 'Inbox';

  return (
    <>
      <TopBar
        title={title}
        trailing={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && activeMailbox === 'inbox' && <Badge variant="primary">{unreadCount}</Badge>}
            <button
              onClick={() => router.push('/email/compose')}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            >
              <PenLine className="w-5 h-5" />
            </button>
          </div>
        }
      />
      <PageTransition>
        <div className="px-4 pt-3">
          <SearchBar
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>
        <MailboxTabs active={activeMailbox} onChange={setActiveMailbox} />
        <EmailFilterBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <EmailList
          emails={emails}
          isLoading={isLoading}
          onSelect={handleSelect}
          mailbox={activeMailbox}
        />
      </PageTransition>
    </>
  );
}
