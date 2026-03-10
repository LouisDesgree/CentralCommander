import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { createClaudeClient, CLAUDE_MODEL } from '@/lib/claude';
import { createGmailClient, parseGmailMessage } from '@/lib/gmail';
import { EMAIL_AGENT_SYSTEM_PROMPT } from '@/config/agent-prompts';

const tools: any[] = [
  {
    name: 'search_emails',
    description: 'Search the user\'s Gmail inbox using Gmail query syntax',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Gmail search query (e.g., "from:john subject:meeting")' },
        maxResults: { type: 'number', description: 'Maximum results to return (default 10)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_email',
    description: 'Get the full content of a specific email by ID',
    input_schema: {
      type: 'object',
      properties: {
        emailId: { type: 'string', description: 'The email ID' },
      },
      required: ['emailId'],
    },
  },
  {
    name: 'draft_reply',
    description: 'Create a draft reply to an email',
    input_schema: {
      type: 'object',
      properties: {
        emailId: { type: 'string', description: 'The email ID to reply to' },
        body: { type: 'string', description: 'The reply body in HTML' },
        tone: { type: 'string', enum: ['formal', 'casual', 'brief'], description: 'Tone of the reply' },
      },
      required: ['emailId', 'body'],
    },
  },
  {
    name: 'archive_email',
    description: 'Archive an email (remove from inbox)',
    input_schema: {
      type: 'object',
      properties: {
        emailId: { type: 'string', description: 'The email ID to archive' },
      },
      required: ['emailId'],
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
            snippet: detail.data.snippet,
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
    const claude = createClaudeClient();
    const accessToken = session.accessToken as string;

    let claudeMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // Build system prompt with context
    let systemPrompt = EMAIL_AGENT_SYSTEM_PROMPT;
    if (context?.emailId) {
      systemPrompt += `\n\nThe user is currently viewing email ID: ${context.emailId}.`;
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let continueLoop = true;

          while (continueLoop) {
            const response = await claude.messages.create({
              model: CLAUDE_MODEL,
              max_tokens: 4096,
              system: systemPrompt,
              messages: claudeMessages,
              tools,
              stream: true,
            });

            let currentToolUse: { id: string; name: string; input: string } | null = null;
            let hasToolUse = false;
            const toolResults: any[] = [];

            for await (const event of response) {
              if (event.type === 'content_block_start') {
                if (event.content_block.type === 'text') {
                  // Text block starting
                } else if (event.content_block.type === 'tool_use') {
                  hasToolUse = true;
                  currentToolUse = {
                    id: event.content_block.id,
                    name: event.content_block.name,
                    input: '',
                  };
                }
              } else if (event.type === 'content_block_delta') {
                if (event.delta.type === 'text_delta') {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`)
                  );
                } else if (event.delta.type === 'input_json_delta' && currentToolUse) {
                  currentToolUse.input += event.delta.partial_json;
                }
              } else if (event.type === 'content_block_stop') {
                if (currentToolUse) {
                  // Send tool call notification
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        toolCall: {
                          name: currentToolUse.name,
                          input: JSON.parse(currentToolUse.input || '{}'),
                        },
                      })}\n\n`
                    )
                  );

                  // Execute the tool
                  const result = await executeToolCall(
                    currentToolUse.name,
                    JSON.parse(currentToolUse.input || '{}'),
                    accessToken
                  );

                  toolResults.push({
                    toolUseId: currentToolUse.id,
                    name: currentToolUse.name,
                    result,
                  });

                  currentToolUse = null;
                }
              }
            }

            if (hasToolUse && toolResults.length > 0) {
              // Add assistant response and tool results to continue the conversation
              const assistantContent: any[] = [];
              // We need to reconstruct the assistant message with tool_use blocks
              for (const tr of toolResults) {
                assistantContent.push({
                  type: 'tool_use',
                  id: tr.toolUseId,
                  name: tr.name,
                  input: JSON.parse(tr.result).error ? {} : JSON.parse(tr.result),
                });
              }

              claudeMessages = [
                ...claudeMessages,
                { role: 'assistant', content: assistantContent },
                {
                  role: 'user',
                  content: toolResults.map((tr) => ({
                    type: 'tool_result',
                    tool_use_id: tr.toolUseId,
                    content: tr.result,
                  })),
                },
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
