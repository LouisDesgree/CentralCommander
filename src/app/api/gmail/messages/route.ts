import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createGmailClient, parseGmailMessage } from '@/lib/gmail';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const maxResults = parseInt(searchParams.get('maxResults') ?? '20', 10);
    const pageToken = searchParams.get('pageToken') ?? undefined;
    const query = searchParams.get('q') ?? undefined;
    const labelIdsParam = searchParams.get('labelIds');
    const labelIds = labelIdsParam ? labelIdsParam.split(',').filter(Boolean) : ['INBOX'];

    const gmail = createGmailClient(session.accessToken as string);

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      pageToken,
      q: query,
      ...(labelIds.length > 0 ? { labelIds } : {}),
    });

    const messageIds = listResponse.data.messages ?? [];

    const emails = await Promise.all(
      messageIds.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'full',
        });
        return parseGmailMessage(detail.data);
      })
    );

    return NextResponse.json({
      emails,
      nextPageToken: listResponse.data.nextPageToken ?? null,
      resultSizeEstimate: listResponse.data.resultSizeEstimate ?? 0,
    });
  } catch (error) {
    console.error('Gmail messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, cc, bcc, subject, body, threadId, inReplyTo } = await request.json();

    const gmail = createGmailClient(session.accessToken as string);

    const headers = [
      `To: ${to}`,
      cc ? `Cc: ${cc}` : '',
      bcc ? `Bcc: ${bcc}` : '',
      `Subject: ${subject}`,
      inReplyTo ? `In-Reply-To: ${inReplyTo}` : '',
      'Content-Type: text/html; charset=utf-8',
      '',
      body,
    ]
      .filter(Boolean)
      .join('\r\n');

    const encodedMessage = Buffer.from(headers)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: threadId ?? undefined,
      },
    });

    return NextResponse.json({ messageId: result.data.id });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
