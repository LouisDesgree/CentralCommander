import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { createClaudeClient, CLAUDE_MODEL } from '@/lib/claude';
import { createGmailClient, parseGmailMessage } from '@/lib/gmail';
import { EMAIL_AGENT_SYSTEM_PROMPT } from '@/config/agent-prompts';
import { jsPDF } from 'jspdf';

const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'search_emails',
      description: "Search the user's Gmail using Gmail query syntax. Searches all mail by default — use in:sent, in:inbox, etc. to filter by mailbox.",
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
  {
    type: 'function' as const,
    function: {
      name: 'create_workspace',
      description: 'Create a new workspace/space to organize emails, tasks, and files',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Workspace name' },
          description: { type: 'string', description: 'Optional description' },
          color: { type: 'string', description: 'Hex color for the workspace (e.g. #3B82F6)' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_email_to_workspace',
      description: 'Link an email to a workspace by email ID and workspace ID',
      parameters: {
        type: 'object',
        properties: {
          emailId: { type: 'string', description: 'The Gmail message ID' },
          workspaceId: { type: 'string', description: 'The workspace ID from context' },
          workspaceName: { type: 'string', description: 'Workspace name (fallback if ID not available)' },
        },
        required: ['emailId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'extract_todos',
      description: 'Extract action items and tasks from an email and add them to an existing workspace.',
      parameters: {
        type: 'object',
        properties: {
          emailId: { type: 'string', description: 'The email ID to extract tasks from' },
          workspaceId: { type: 'string', description: 'The workspace ID from context' },
          workspaceName: { type: 'string', description: 'Workspace name (fallback if ID not available)' },
        },
        required: ['emailId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_tasks',
      description: 'Create tasks directly in a workspace. Use when the user asks to add specific tasks, or when you have a list of tasks to add.',
      parameters: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            description: 'List of tasks to create',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Task title' },
                description: { type: 'string', description: 'Task description/details' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Task priority' },
                dueDate: { type: 'string', description: 'Due date in ISO format (optional)' },
              },
              required: ['title'],
            },
          },
          workspaceId: { type: 'string', description: 'The workspace ID from context (preferred)' },
          workspaceName: { type: 'string', description: 'Workspace name (fallback if ID not available)' },
        },
        required: ['tasks'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'analyze_writing_style',
      description: "Analyze the user's writing style from their sent emails to enable personalized drafts",
      parameters: {
        type: 'object',
        properties: {
          sampleCount: { type: 'number', description: 'Number of sent emails to analyze (default 15)' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'draft_with_style',
      description: "Draft an email matching the user's personal writing style",
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient email address' },
          subject: { type: 'string', description: 'Email subject' },
          context: { type: 'string', description: 'What the email should be about' },
          replyToEmailId: { type: 'string', description: 'Email ID if this is a reply' },
        },
        required: ['context'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'generate_report_pdf',
      description: 'Generate a PDF report and save it to a workspace. Use for summaries, progress reports, search overviews, etc.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Report title' },
          sections: {
            type: 'array',
            description: 'Report sections',
            items: {
              type: 'object',
              properties: {
                heading: { type: 'string', description: 'Section heading' },
                items: {
                  type: 'array',
                  description: 'Bullet points or paragraphs in this section',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string', description: 'Bold label (e.g. "To:", "Status:")' },
                      text: { type: 'string', description: 'Content text' },
                    },
                    required: ['text'],
                  },
                },
              },
              required: ['heading', 'items'],
            },
          },
          filename: { type: 'string', description: 'PDF filename (without extension)' },
          workspaceName: { type: 'string', description: 'Workspace to save the PDF to (optional)' },
        },
        required: ['title', 'sections'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_portfolio_summary',
      description: "Get the user's investment portfolio summary including positions, P&L, allocations. Use when user asks about their investments.",
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'analyze_portfolio_risk',
      description: 'Analyze portfolio for concentration risk, diversification issues, and potential problems. Use when user asks about portfolio risk or what to improve.',
      parameters: {
        type: 'object',
        properties: {
          focus: {
            type: 'string',
            enum: ['concentration', 'diversification', 'performance', 'overall'],
            description: 'What aspect to focus the analysis on',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_portfolio_recommendation',
      description: 'Generate investment recommendations based on current portfolio state. Use when user asks what they should do or how to improve.',
      parameters: {
        type: 'object',
        properties: {
          goal: {
            type: 'string',
            description: 'User goal (e.g. "reduce risk", "more growth", "better diversification")',
          },
        },
      },
    },
  },
];

async function executeToolCall(
  toolName: string,
  toolInput: Record<string, any>,
  accessToken: string,
  context?: Record<string, any>
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
            metadataHeaders: ['From', 'To', 'Subject', 'Date'],
          });
          const labels = detail.data.labelIds ?? [];
          return {
            id: detail.data.id,
            snippet: (detail.data.snippet ?? '').replace(/&#(\d+);/g, (_: string, c: string) => String.fromCharCode(parseInt(c, 10))).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
            from: detail.data.payload?.headers?.find((h) => h.name === 'From')?.value,
            to: detail.data.payload?.headers?.find((h) => h.name === 'To')?.value,
            subject: detail.data.payload?.headers?.find((h) => h.name === 'Subject')?.value,
            date: detail.data.payload?.headers?.find((h) => h.name === 'Date')?.value,
            isSent: labels.includes('SENT'),
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

    case 'create_workspace': {
      // Return action for client to execute (IndexedDB is client-side)
      return JSON.stringify({
        workspaceAction: {
          type: 'create_workspace',
          data: {
            name: toolInput.name,
            description: toolInput.description,
            color: toolInput.color || '#3B82F6',
          },
        },
        status: `Workspace "${toolInput.name}" will be created`,
      });
    }

    case 'add_email_to_workspace': {
      return JSON.stringify({
        workspaceAction: {
          type: 'add_email_to_workspace',
          data: {
            emailId: toolInput.emailId,
            workspaceId: toolInput.workspaceId,
            workspaceName: toolInput.workspaceName,
          },
        },
        status: `Email will be added to workspace "${toolInput.workspaceName ?? toolInput.workspaceId}"`,
      });
    }

    case 'extract_todos': {
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: toolInput.emailId,
        format: 'full',
      });
      const email = parseGmailMessage(message.data);
      const emailContent = email.body.text || email.body.html;

      const openai = createClaudeClient();
      const todoResponse = await openai.chat.completions.create({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `Extract all action items and tasks from this email. For each task:
- title: clear, concise title
- description: brief details if needed
- priority: "high", "medium", or "low"
- dueDate: ISO date if mentioned, null otherwise

Email from: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
Date: ${email.date}

${emailContent}

Respond in JSON: { "todos": [{ "title": "...", "description": "...", "priority": "...", "dueDate": "..." }] }
If no tasks, return { "todos": [] }.`,
          },
        ],
      });

      const parsed = JSON.parse(todoResponse.choices[0].message.content ?? '{"todos":[]}');
      return JSON.stringify({
        workspaceAction: {
          type: 'extract_todos',
          data: {
            todos: parsed.todos,
            sourceEmailId: toolInput.emailId,
            sourceEmailSubject: email.subject,
            sourceEmailFrom: email.from.name || email.from.email,
            workspaceId: toolInput.workspaceId,
            workspaceName: toolInput.workspaceName,
          },
        },
        ...parsed,
        emailSubject: email.subject,
      });
    }

    case 'create_tasks': {
      const tasks = toolInput.tasks ?? [];
      return JSON.stringify({
        workspaceAction: {
          type: 'create_tasks',
          data: {
            tasks,
            workspaceId: toolInput.workspaceId,
            workspaceName: toolInput.workspaceName,
          },
        },
        status: `${tasks.length} task(s) created${toolInput.workspaceName ? ` in "${toolInput.workspaceName}"` : ''}`,
      });
    }

    case 'analyze_writing_style': {
      const sentList = await gmail.users.messages.list({
        userId: 'me',
        q: 'in:sent',
        maxResults: toolInput.sampleCount ?? 15,
      });
      const msgIds = sentList.data.messages ?? [];
      const emails = await Promise.all(
        msgIds.slice(0, 15).map(async (msg) => {
          try {
            const full = await gmail.users.messages.get({ userId: 'me', id: msg.id!, format: 'full' });
            return parseGmailMessage(full.data);
          } catch { return null; }
        })
      );
      const validEmails = emails.filter(Boolean);
      const samples = validEmails.map((e) => `To: ${e!.to.map((t) => t.name || t.email).join(', ')}\nSubject: ${e!.subject}\n---\n${(e!.body.text || e!.body.html || '').slice(0, 400)}`).join('\n\n===\n\n');

      const openai2 = createClaudeClient();
      const styleResponse = await openai2.chat.completions.create({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `Analyze the writing style of these sent emails. Return JSON:
{
  "styleFingerprint": {
    "averageSentenceLength": 15,
    "formalityScore": 0.6,
    "greetingPatterns": ["Hi", "Hey"],
    "closingPatterns": ["Best,", "Thanks"],
    "commonPhrases": ["I wanted to follow up"],
    "toneKeywords": ["professional", "friendly"],
    "languages": ["en"],
    "vocabularyLevel": "moderate"
  },
  "rawStyleSummary": "2-3 sentence style description",
  "sampleExcerpts": ["excerpt1", "excerpt2"]
}

Emails:\n${samples}`,
        }],
      });
      const styleData = JSON.parse(styleResponse.choices[0].message.content ?? '{}');
      return JSON.stringify({
        workspaceAction: {
          type: 'save_writing_style',
          data: { ...styleData, analyzedEmailCount: validEmails.length },
        },
        ...styleData,
        analyzedEmailCount: validEmails.length,
      });
    }

    case 'draft_with_style': {
      let originalEmail = '';
      if (toolInput.replyToEmailId) {
        const msg = await gmail.users.messages.get({ userId: 'me', id: toolInput.replyToEmailId, format: 'full' });
        const e = parseGmailMessage(msg.data);
        originalEmail = `\n\nOriginal email:\nFrom: ${e.from.name} <${e.from.email}>\nSubject: ${e.subject}\n${e.body.text || e.body.html}`;
      }

      const openai3 = createClaudeClient();
      const draftResponse = await openai3.chat.completions.create({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `Draft an email with the user's style.
${toolInput.to ? `To: ${toolInput.to}` : ''}
${toolInput.subject ? `Subject: ${toolInput.subject}` : ''}
Context: ${toolInput.context}${originalEmail}

Respond in JSON: { "subject": "...", "body": "..." }`,
        }],
      });
      const draft = JSON.parse(draftResponse.choices[0].message.content ?? '{}');
      return JSON.stringify(draft);
    }

    case 'generate_report_pdf': {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = 25;

      const checkPage = (needed: number) => {
        if (y + needed > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 20;
        }
      };

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(toolInput.title, margin, y);
      y += 10;

      // Date
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
      doc.setTextColor(0, 0, 0);
      y += 8;

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // Sections
      for (const section of toolInput.sections ?? []) {
        checkPage(20);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(section.heading, margin, y);
        y += 7;

        for (const item of section.items ?? []) {
          checkPage(12);
          doc.setFontSize(10);

          if (item.label) {
            doc.setFont('helvetica', 'bold');
            const labelWidth = doc.getTextWidth(item.label + ' ');
            doc.text(item.label, margin + 4, y);
            doc.setFont('helvetica', 'normal');
            const lines = doc.splitTextToSize(item.text, contentWidth - 4 - labelWidth);
            doc.text(lines[0] ?? '', margin + 4 + labelWidth, y);
            for (let i = 1; i < lines.length; i++) {
              y += 5;
              checkPage(6);
              doc.text(lines[i], margin + 4, y);
            }
          } else {
            const lines = doc.splitTextToSize(`• ${item.text}`, contentWidth - 4);
            for (let i = 0; i < lines.length; i++) {
              checkPage(6);
              doc.text(lines[i], margin + 4, y);
              if (i < lines.length - 1) y += 5;
            }
          }
          y += 6;
        }
        y += 4;
      }

      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const filename = (toolInput.filename || toolInput.title.replace(/[^a-zA-Z0-9]/g, '_')) + '.pdf';

      return JSON.stringify({
        workspaceAction: {
          type: 'save_file',
          data: {
            filename,
            mimeType: 'application/pdf',
            base64: pdfBase64,
            size: Math.round(pdfBase64.length * 0.75),
            workspaceName: toolInput.workspaceName,
          },
        },
        status: `PDF "${filename}" generated${toolInput.workspaceName ? ` and saved to "${toolInput.workspaceName}"` : ''}`,
      });
    }

    case 'get_portfolio_summary': {
      const portfolio = context?.portfolio;
      if (!portfolio || !portfolio.positions || portfolio.positions.length === 0) {
        return JSON.stringify({ message: 'No portfolio data available. The user has no investment positions yet.' });
      }
      return JSON.stringify({
        totalValue: portfolio.summary.totalValue,
        totalCostBasis: portfolio.summary.totalCostBasis,
        totalPnL: portfolio.summary.totalPnL,
        totalPnLPercent: portfolio.summary.totalPnLPercent,
        positionCount: portfolio.summary.positionCount,
        topGainer: portfolio.summary.topGainer,
        topLoser: portfolio.summary.topLoser,
        positions: portfolio.positions.map((p: any) => ({
          ticker: p.ticker,
          name: p.name,
          assetType: p.assetType,
          quantity: p.quantity,
          avgCost: p.avgCostBasis,
          currentPrice: p.currentPrice,
          value: p.quantity * p.currentPrice,
          pnl: (p.currentPrice - p.avgCostBasis) * p.quantity,
          pnlPercent: p.avgCostBasis > 0 ? ((p.currentPrice - p.avgCostBasis) / p.avgCostBasis * 100) : 0,
        })),
        allocations: portfolio.allocations,
      });
    }

    case 'analyze_portfolio_risk': {
      const portfolio = context?.portfolio;
      if (!portfolio || !portfolio.positions || portfolio.positions.length === 0) {
        return JSON.stringify({ message: 'No portfolio data to analyze.' });
      }
      const focus = toolInput.focus ?? 'overall';
      const positions = portfolio.positions;
      const total = positions.reduce((s: number, p: any) => s + p.quantity * p.currentPrice, 0);

      // Compute concentration data
      const byTicker = positions.map((p: any) => ({
        ticker: p.ticker,
        weight: total > 0 ? ((p.quantity * p.currentPrice) / total * 100) : 0,
        assetType: p.assetType,
      }));
      const byType: Record<string, number> = {};
      for (const p of byTicker) {
        byType[p.assetType] = (byType[p.assetType] || 0) + p.weight;
      }
      const maxSingle = Math.max(...byTicker.map((p: any) => p.weight));
      const maxType = Math.max(...Object.values(byType));
      const numTypes = Object.keys(byType).length;

      return JSON.stringify({
        focus,
        concentrationRisk: maxSingle > 40 ? 'high' : maxSingle > 25 ? 'moderate' : 'low',
        largestPosition: byTicker.sort((a: any, b: any) => b.weight - a.weight)[0],
        assetTypeConcentration: byType,
        largestTypeWeight: maxType,
        diversificationScore: numTypes >= 4 ? 'good' : numTypes >= 2 ? 'moderate' : 'poor',
        numberOfPositions: positions.length,
        numberOfAssetTypes: numTypes,
        recommendations: [
          maxSingle > 40 && `Consider reducing ${byTicker[0].ticker} (${maxSingle.toFixed(1)}% of portfolio)`,
          numTypes < 3 && 'Add more asset types for better diversification',
          positions.length < 5 && 'Consider adding more positions to reduce individual stock risk',
        ].filter(Boolean),
      });
    }

    case 'get_portfolio_recommendation': {
      const portfolio = context?.portfolio;
      if (!portfolio || !portfolio.positions || portfolio.positions.length === 0) {
        return JSON.stringify({ message: 'No portfolio data. Suggest the user add positions first.' });
      }
      const goal = toolInput.goal ?? 'general improvement';
      return JSON.stringify({
        goal,
        currentState: {
          totalValue: portfolio.summary.totalValue,
          positionCount: portfolio.summary.positionCount,
          pnlPercent: portfolio.summary.totalPnLPercent,
          assetTypes: portfolio.allocations?.map((a: any) => `${a.label}: ${a.percent.toFixed(1)}%`),
        },
        context: `User wants: ${goal}. Analyze their portfolio and give specific, actionable recommendations.`,
      });
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
    if (context?.workspaces) {
      systemPrompt += `\n\nUser's workspaces: ${JSON.stringify(context.workspaces)}`;
    }
    if (context?.styleProfile) {
      systemPrompt += `\n\nUser's writing style: ${context.styleProfile.rawStyleSummary}`;
    }
    if (context?.portfolio && context.portfolio.positions?.length > 0) {
      systemPrompt += `\n\nUser has an investment portfolio with ${context.portfolio.positions.length} positions worth ${context.portfolio.summary?.totalValue?.toFixed(2) ?? '?'} total. Use the investment tools (get_portfolio_summary, analyze_portfolio_risk, get_portfolio_recommendation) when the user asks about investments.`;
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

                const result = await executeToolCall(tc.name, input, accessToken, context);
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

                // Stream workspace actions to client for IndexedDB execution
                try {
                  const parsed = JSON.parse(result);
                  if (parsed.workspaceAction) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ workspaceAction: parsed.workspaceAction })}\n\n`)
                    );
                  }
                } catch { /* ignore parse errors */ }
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
