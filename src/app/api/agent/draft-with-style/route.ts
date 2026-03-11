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

    const { to, subject, context, replyToEmailId, styleProfile } = await request.json();

    let originalEmail = '';
    if (replyToEmailId) {
      const gmail = createGmailClient(session.accessToken as string);
      const message = await gmail.users.messages.get({ userId: 'me', id: replyToEmailId, format: 'full' });
      const email = parseGmailMessage(message.data);
      originalEmail = `\n\nOriginal email being replied to:
From: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
${email.body.text || email.body.html}`;
    }

    const styleInstructions = styleProfile?.rawStyleSummary
      ? `\n\nIMPORTANT - Match this writing style:
${styleProfile.rawStyleSummary}
- Formality: ${styleProfile.styleFingerprint?.formalityScore > 0.6 ? 'formal' : styleProfile.styleFingerprint?.formalityScore > 0.3 ? 'semi-formal' : 'casual'}
- Greetings they use: ${styleProfile.styleFingerprint?.greetingPatterns?.join(', ')}
- Closings they use: ${styleProfile.styleFingerprint?.closingPatterns?.join(', ')}
- Common phrases: ${styleProfile.styleFingerprint?.commonPhrases?.join(', ')}
- Languages: ${styleProfile.styleFingerprint?.languages?.join(', ')}`
      : '';

    const openai = createClaudeClient();
    const response = await openai.chat.completions.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Draft an email with these details:
${to ? `To: ${to}` : ''}
${subject ? `Subject: ${subject}` : ''}
Context: ${context}${styleInstructions}${originalEmail}

Respond in JSON format: { "subject": "...", "body": "..." }`,
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0].message.content ?? '{}');

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Draft with style error:', error);
    return NextResponse.json({ error: 'Failed to generate styled draft' }, { status: 500 });
  }
}
