import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createGmailClient, parseGmailLabel } from '@/lib/gmail';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gmail = createGmailClient(session.accessToken as string);
    const response = await gmail.users.labels.list({ userId: 'me' });

    const labels = (response.data.labels ?? []).map(parseGmailLabel);

    return NextResponse.json({ labels });
  } catch (error) {
    console.error('Labels error:', error);
    return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 });
  }
}
