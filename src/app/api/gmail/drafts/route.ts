import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createGmailClient } from '@/lib/gmail';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gmail = createGmailClient(session.accessToken as string);
    const response = await gmail.users.drafts.list({ userId: 'me' });

    return NextResponse.json({ drafts: response.data.drafts ?? [] });
  } catch (error) {
    console.error('Drafts error:', error);
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, body, threadId } = await request.json();

    const gmail = createGmailClient(session.accessToken as string);

    const headers = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body,
    ].join('\r\n');

    const encodedMessage = Buffer.from(headers)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage,
          threadId: threadId ?? undefined,
        },
      },
    });

    return NextResponse.json({ draftId: result.data.id });
  } catch (error) {
    console.error('Create draft error:', error);
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
  }
}
