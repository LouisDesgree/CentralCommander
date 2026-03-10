import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createGmailClient, parseGmailMessage } from '@/lib/gmail';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const gmail = createGmailClient(session.accessToken as string);

    const message = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full',
    });

    return NextResponse.json({ email: parseGmailMessage(message.data) });
  } catch (error) {
    console.error('Get email error:', error);
    return NextResponse.json({ error: 'Failed to fetch email' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { addLabelIds, removeLabelIds } = await request.json();

    const gmail = createGmailClient(session.accessToken as string);

    await gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: {
        addLabelIds: addLabelIds ?? [],
        removeLabelIds: removeLabelIds ?? [],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Modify email error:', error);
    return NextResponse.json({ error: 'Failed to modify email' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const gmail = createGmailClient(session.accessToken as string);

    await gmail.users.messages.trash({
      userId: 'me',
      id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete email error:', error);
    return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 });
  }
}
