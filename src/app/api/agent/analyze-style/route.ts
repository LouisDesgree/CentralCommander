import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createClaudeClient, CLAUDE_MODEL } from '@/lib/claude';
import { createGmailClient, parseGmailMessage } from '@/lib/gmail';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gmail = createGmailClient(session.accessToken as string);

    // Fetch recent sent emails
    const sentList = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:sent',
      maxResults: 20,
    });

    const messageIds = sentList.data.messages ?? [];
    if (messageIds.length === 0) {
      return NextResponse.json({ error: 'No sent emails found to analyze' }, { status: 400 });
    }

    // Fetch full content of sent emails
    const emails = await Promise.all(
      messageIds.slice(0, 15).map(async (msg) => {
        try {
          const full = await gmail.users.messages.get({ userId: 'me', id: msg.id!, format: 'full' });
          return parseGmailMessage(full.data);
        } catch {
          return null;
        }
      })
    );

    const validEmails = emails.filter(Boolean);
    const emailSamples = validEmails.map((e) => {
      const body = e!.body.text || e!.body.html || '';
      return `To: ${e!.to.map((t) => t.name || t.email).join(', ')}
Subject: ${e!.subject}
---
${body.slice(0, 500)}`;
    }).join('\n\n===\n\n');

    const openai = createClaudeClient();
    const response = await openai.chat.completions.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Analyze the writing style of these sent emails. Identify patterns in:

1. Average sentence length
2. Formality level (0.0 = very casual, 1.0 = very formal)
3. Common greeting patterns (how they start emails)
4. Common closing patterns (how they end emails)
5. Common phrases they use frequently
6. Tone keywords that describe their style
7. Languages used
8. Vocabulary level (simple, moderate, advanced)

Emails:
${emailSamples}

Respond in JSON format:
{
  "styleFingerprint": {
    "averageSentenceLength": 15,
    "formalityScore": 0.6,
    "greetingPatterns": ["Hi", "Hey"],
    "closingPatterns": ["Best,", "Thanks"],
    "commonPhrases": ["I wanted to follow up on", "Let me know if"],
    "toneKeywords": ["professional", "friendly"],
    "languages": ["en"],
    "vocabularyLevel": "moderate"
  },
  "rawStyleSummary": "A 2-3 sentence description of their writing style...",
  "sampleExcerpts": ["short excerpt 1", "short excerpt 2"]
}`,
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0].message.content ?? '{}');

    return NextResponse.json({
      ...parsed,
      analyzedEmailCount: validEmails.length,
      lastAnalyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analyze style error:', error);
    return NextResponse.json({ error: 'Failed to analyze writing style' }, { status: 500 });
  }
}
