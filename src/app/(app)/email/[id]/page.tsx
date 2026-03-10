'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { EmailDetail } from '@/components/email/EmailDetail';
import { Spinner } from '@/components/ui/Spinner';
import { useEmail } from '@/hooks/useEmails';

export default function EmailDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { email, isLoading } = useEmail(id);

  if (isLoading) {
    return (
      <>
        <TopBar title="Loading..." showBack />
        <div className="flex items-center justify-center h-64">
          <Spinner size={32} />
        </div>
      </>
    );
  }

  if (!email) {
    return (
      <>
        <TopBar title="Not Found" showBack />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Email not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={email.subject} showBack />
      <PageTransition>
        <div className="px-4 py-4">
          <EmailDetail
            email={email}
            onReply={() => router.push(`/email/compose?replyTo=${id}`)}
            onArchive={() => {
              fetch(`/api/gmail/messages/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ removeLabelIds: ['INBOX'] }),
              }).then(() => router.push('/email'));
            }}
            onDelete={() => {
              fetch(`/api/gmail/messages/${id}`, { method: 'DELETE' }).then(() =>
                router.push('/email')
              );
            }}
            onAIReply={() => router.push(`/agent?emailId=${id}`)}
          />
        </div>
      </PageTransition>
    </>
  );
}
