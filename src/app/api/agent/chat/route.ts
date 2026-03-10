import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { createClaudeClient, CLAUDE_MODEL } from '@/lib/claude';
import { createGmailClient, parseGmailMessage } from '@/lib/gmail';
import { EMAIL_AGENT_SYSTEM_PROMPT } from '@/config/agent-prompts';

const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'search_emails',
      description: "Search the user's Gmail inbox using Gmail query syntax",
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Gmail search query (e.g., "from:john subject:meeting")' },
          maxResults: { type: 'number', description: 'Maximum results to return (default 10)' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_email',
      description: 'Get the full content of a specific email by ID',
      parameters: {
        type: 'object',
        properties: {
          emailId: { type: 'string', description: 'The email ID' },
        },
        required: ['emailId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'draft_reply',
      description: 'Create a draft reply to an email',
      parameters: {
        type: 'object',
        properties: {
          emailId: { type: 'string', description: 'The email ID to reply to' },
          body: { type: 'string', description: 'The reply body in HTML' },
          tone: { type: 'string', enum: ['formal', 'casual', 'brief'], description: 'Tone of the reply' },
        },
        required: ['emailId', 'body'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'archive_email',
      description: 'Archive an email (remove from inbox)',
      parameters: {
        type: 'object',
        properties: {
          emailId: { type: 'string', description: 'The email ID to archive' },
        },
        required: ['emailId'],
      },
    },
  },
];

async function executeToolCall(
  toolName: string,
  toolInput: Record<string, any>,
  accessToken: string
) {
  const gmail = createGmailClient(accessToken);

  switch (toolName) {
    case 'search_emails': {
      const list = await gmail.users.messages.list({
        userId: 'me',
        q: toolInput.query,
        maxResults: toolInput.maxResults ?? 10,
      });
      const messages = await Promise.all(
        (list.data.messages ?? []).map(async (msg) => {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'metadata',
            metadataHeaders: ['From', 'Subject', 'Date'],
          });
          return {
            id: detail.data.id,
            snippet: (detail.data.snippet ?? '').replace(/&#(\d+);/g, (_: string, c: string) => String.fromCharCode(parseInt(c, 10))).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
            from: detail.data.payload?.headers?.find((h) => h.name === 'From')?.value,
            subject: detail.data.payload?.headers?.find((h) => h.name === 'Subject')?.value,
            date: detail.data.payload?.headers?.find((h) => h.name === 'Date')?.value,
          };
        })
      );
      return JSON.stringify(messages);
    }

    case 'get_email': {
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: toolInput.emailId,
        format: 'full',
      });
      const parsed = parseGmailMessage(message.data);
      return JSON.stringify({
        id: parsed.id,
        from: parsed.from,
        to: parsed.to,
        subject: parsed.subject,
        date: parsed.date,
        body: parsed.body.text || parsed.body.html,
        labels: parsed.labels,
      });
    }

    case 'draft_reply': {
      const original = await gmail.users.messages.get({
        userId: 'me',
        id: toolInput.emailId,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Message-ID'],
      });
      const headers = original.data.payload?.headers ?? [];
      const fromHeader = headers.find((h) => h.name === 'From')?.value ?? '';
      const subjectHeader = headers.find((h) => h.name === 'Subject')?.value ?? '';
      const messageId = headers.find((h) => h.name === 'Message-ID')?.value ?? '';

      const rawMessage = [
        `To: ${fromHeader}`,
        `Subject: Re: ${subjectHeader}`,
        `In-Reply-To: ${messageId}`,
        `References: ${messageId}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        toolInput.body,
      ].join('\r\n');

      const encoded = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const draft = await gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: encoded,
            threadId: original.data.threadId ?? undefined,
          },
        },
      });
      return JSON.stringify({ draftId: draft.data.id, status: 'Draft created successfully' });
    }

    case 'archive_email': {
      await gmail.users.messages.modify({
        userId: 'me',
        id: toolInput.emailId,
        requestBody: { removeLabelIds: ['INBOX'] },
      });
      return JSON.stringify({ status: 'Email archived successfully' });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages, context } = await request.json();
    const openai = createClaudeClient();
    const accessToken = session.accessToken as string;

    let systemPrompt = EMAIL_AGENT_SYSTEM_PROMPT.replace('{{TODAY}}', new Date().toISOString().split('T')[0]);
    if (context?.emailId) {
      systemPrompt += `\n\nThe user is currently viewing email ID: ${context.emailId}.`;
    }

    let claudeMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let continueLoop = true;

          while (continueLoop) {
            const response = await openai.chat.completions.create({
              model: CLAUDE_MODEL,
              max_tokens: 4096,
              messages: claudeMessages,
              tools,
              stream: true,
            });

            const pendingToolCalls: Record<number, { id: string; name: string; arguments: string }> = {};
            let finishReason = '';

            for await (const chunk of response) {
              const delta = chunk.choices[0]?.delta;
              const finish = chunk.choices[0]?.finish_reason;
              if (finish) finishReason = finish;

              if (delta?.content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`)
                );
              }

              if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                  const idx = tc.index;
                  if (!pendingToolCalls[idx]) {
                    pendingToolCalls[idx] = { id: '', name: '', arguments: '' };
                  }
                  if (tc.id) pendingToolCalls[idx].id = tc.id;
                  if (tc.function?.name) pendingToolCalls[idx].name = tc.function.name;
                  if (tc.function?.arguments) pendingToolCalls[idx].arguments += tc.function.arguments;
                }
              }
            }

            if (finishReason === 'tool_calls' && Object.keys(pendingToolCalls).length > 0) {
              const toolCallList = Object.values(pendingToolCalls);
              const toolResults: { id: string; result: string }[] = [];

              for (const tc of toolCallList) {
                const input = JSON.parse(tc.arguments || '{}');

                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ toolCall: { name: tc.name, input } })}\n\n`
                  )
                );

                const result = await executeToolCall(tc.name, input, accessToken);
                toolResults.push({ id: tc.id, result });

                // Stream email results to client for UI preview cards
                if (tc.name === 'search_emails') {
                  try {
                    const emails = JSON.parse(result);
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ emailResults: emails })}\n\n`)
                    );
                  } catch { /* ignore parse errors */ }
                }
              }

              claudeMessages = [
                ...claudeMessages,
                {
                  role: 'assistant',
                  tool_calls: toolCallList.map((tc) => ({
                    id: tc.id,
                    type: 'function',
                    function: { name: tc.name, arguments: tc.arguments },
                  })),
                },
                ...toolResults.map((tr) => ({
                  role: 'tool',
                  tool_call_id: tr.id,
                  content: tr.result,
                })),
              ];
            } else {
              continueLoop = false;
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Agent chat error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
