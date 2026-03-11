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

    const { emailId, instructions, tone = 'professional' } = await request.json();

    const gmail = createGmailClient(session.accessToken as string);
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: emailId,
      format: 'full',
    });

    const email = parseGmailMessage(message.data);
    const emailContent = email.body.text || email.body.html;

    const openai = createClaudeClient();
    const response = await openai.chat.completions.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Draft a reply to this email.

Tone: ${tone}
${instructions ? `Additional instructions: ${instructions}` : ''}

Original email:
From: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
Date: ${email.date}

${emailContent}

Respond in JSON format: { "subject": "Re: ...", "body": "..." }`,
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0].message.content ?? '{}');

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Draft error:', error);
    return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 });
  }
}
