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

    const openai = createClaudeClient();
    const response = await openai.chat.completions.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Extract all action items, tasks, and to-dos from this email. For each task identify:
- A clear, concise title
- A brief description if needed
- Priority: "high", "medium", or "low"
- Due date if mentioned (ISO format YYYY-MM-DD)

Email:
From: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
Date: ${email.date}

${emailContent}

Respond in JSON format:
{
  "todos": [
    { "title": "...", "description": "...", "priority": "high|medium|low", "dueDate": "YYYY-MM-DD or null" }
  ]
}

If there are no action items, return { "todos": [] }. Only extract real actionable items, not general information.`,
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0].message.content ?? '{"todos":[]}');

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Extract todos error:', error);
    return NextResponse.json({ error: 'Failed to extract tasks' }, { status: 500 });
  }
}
