'use client';

import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { EmailComposer } from '@/components/email/EmailComposer';

export default function ComposePage() {
  const router = useRouter();

  const handleSend = async (data: { to: string; subject: string; body: string }) => {
    const res = await fetch('/api/gmail/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/email');
    }
  };

  return (
    <>
      <TopBar title="New Email" showBack />
      <PageTransition>
        <EmailComposer onSend={handleSend} />
      </PageTransition>
    </>
  );
}
