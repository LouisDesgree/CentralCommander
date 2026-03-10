import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createClaudeClient, CLAUDE_MODEL } from '@/lib/claude';
import { createGmailClient, parseGmailMessage } from '@/lib/gmail';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emailId } = await request.json();

    const gmail = createGmailClient(session.accessToken as string);
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: emailId,
      format: 'full',
    });

    const email = parseGmailMessage(message.data);
    const emailContent = email.body.text || email.body.html;

    const claude = createClaudeClient();
    const response = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Summarize this email concisely. Include: 1) A 2-3 sentence summary, 2) Any action items or deadlines, 3) Priority level (high/medium/low).

From: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
Date: ${email.date}

${emailContent}

Respond in JSON format: { "summary": "...", "actionItems": ["..."], "priority": "high|medium|low" }`,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    const parsed = JSON.parse(textContent?.text ?? '{}');

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Summarize error:', error);
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 });
  }
}
