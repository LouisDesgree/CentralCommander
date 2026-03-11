'use client';

import { useCallback } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { generateId } from '@/lib/utils';
import { db, generateId as generateDbId } from '@/lib/db';
import type { AgentChatRequest, EmailPreview } from '@/types/agent';
import type { WritingStyleProfile } from '@/types/workspace';
import { calculatePortfolioSummary, calculateAllocations } from '@/lib/investment-utils';

async function resolveWorkspaceId(data: Record<string, any>): Promise<string> {
  console.log('[DEBUG] resolveWorkspaceId input:', { workspaceId: data.workspaceId, workspaceName: data.workspaceName });
  // Prefer direct ID from agent context
  if (data.workspaceId) {
    const ws = await db.workspaces.get(data.workspaceId);
    if (ws) { console.log('[DEBUG] resolved by ID:', ws.id, ws.name); return ws.id; }
    console.log('[DEBUG] workspaceId not found in DB:', data.workspaceId);
  }
  // Fall back to name matching
  if (data.workspaceName) {
    const name = data.workspaceName.toLowerCase();
    const ws = await db.workspaces.filter((w) =>
      w.name.toLowerCase() === name
    ).first();
    if (ws) { console.log('[DEBUG] resolved by exact name:', ws.id, ws.name); return ws.id; }
    // Try partial match as last resort
    const partial = await db.workspaces.filter((w) =>
      w.name.toLowerCase().includes(name) || name.includes(w.name.toLowerCase())
    ).first();
    if (partial) { console.log('[DEBUG] resolved by partial name:', partial.id, partial.name); return partial.id; }
  }
  const allWs = await db.workspaces.toArray();
  console.log('[DEBUG] no match found, using general. All workspaces:', allWs.map(w => ({ id: w.id, name: w.name })));
  return 'general';
}

async function handleWorkspaceAction(action: { type: string; data: Record<string, any> }) {
  console.log('[DEBUG] handleWorkspaceAction:', action.type, JSON.stringify(action.data).slice(0, 500));
  switch (action.type) {
    case 'create_workspace': {
      const workspaces = await db.workspaces.toArray();
      const maxOrder = workspaces.length > 0 ? Math.max(...workspaces.map((w) => w.sortOrder)) : 0;
      const now = new Date().toISOString();
      await db.workspaces.add({
        id: generateDbId(),
        name: action.data.name,
        description: action.data.description,
        color: action.data.color || '#3B82F6',
        emailIds: [],
        createdAt: now,
        updatedAt: now,
        isPinned: false,
        sortOrder: maxOrder + 1,
      });
      break;
    }

    case 'add_email_to_workspace': {
      const wsId = await resolveWorkspaceId(action.data);
      if (wsId === 'general') break;
      const ws = await db.workspaces.get(wsId);
      if (ws && !ws.emailIds.includes(action.data.emailId)) {
        await db.workspaces.update(ws.id, {
          emailIds: [...ws.emailIds, action.data.emailId],
          updatedAt: new Date().toISOString(),
        });
      }
      break;
    }

    case 'extract_todos': {
      const todos = action.data.todos ?? [];
      const now = new Date().toISOString();
      const workspaceId = await resolveWorkspaceId(action.data);

      for (const todo of todos) {
        await db.todos.add({
          id: generateDbId(),
          workspaceId,
          sourceEmailId: action.data.sourceEmailId,
          sourceEmailSubject: action.data.sourceEmailSubject,
          sourceEmailFrom: action.data.sourceEmailFrom,
          title: todo.title,
          description: todo.description,
          priority: todo.priority ?? 'medium',
          status: 'pending',
          dueDate: todo.dueDate ?? undefined,
          createdAt: now,
          updatedAt: now,
          isAutoExtracted: true,
        });
      }
      break;
    }

    case 'create_tasks': {
      const tasks = action.data.tasks ?? [];
      const now = new Date().toISOString();
      const workspaceId = await resolveWorkspaceId(action.data);

      for (const task of tasks) {
        await db.todos.add({
          id: generateDbId(),
          workspaceId,
          title: task.title,
          description: task.description,
          priority: task.priority ?? 'medium',
          status: 'pending',
          dueDate: task.dueDate ?? undefined,
          createdAt: now,
          updatedAt: now,
          isAutoExtracted: false,
        });
      }
      break;
    }

    case 'save_writing_style': {
      const existing = await db.writingStyles.toCollection().first();
      const now = new Date().toISOString();
      const profile: WritingStyleProfile = {
        id: existing?.id ?? generateDbId(),
        userId: 'current',
        analyzedEmailCount: action.data.analyzedEmailCount,
        lastAnalyzedAt: now,
        styleFingerprint: action.data.styleFingerprint,
        rawStyleSummary: action.data.rawStyleSummary,
        sampleExcerpts: action.data.sampleExcerpts ?? [],
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      await db.writingStyles.put(profile);
      break;
    }

    case 'save_file': {
      const { filename, mimeType, base64, size } = action.data;
      const now = new Date().toISOString();

      // Decode base64 to blob
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });

      const workspaceId = await resolveWorkspaceId(action.data);

      // Store blob
      const blobKey = generateDbId();
      await db.fileBlobs.add({ id: blobKey, blob });

      // Determine file type
      let type: 'document' | 'image' | 'note' | 'other' = 'document';
      if (mimeType.startsWith('image/')) type = 'image';

      // Create file record
      await db.files.add({
        id: generateDbId(),
        workspaceId,
        name: filename,
        type,
        mimeType,
        size: size ?? blob.size,
        blobKey,
        createdAt: now,
        updatedAt: now,
      });
      break;
    }
  }
}

async function getWorkspaceContext() {
  try {
    const workspaces = await db.workspaces.toArray();
    return workspaces.map((w) => ({ name: w.name, id: w.id, emailCount: w.emailIds.length }));
  } catch {
    return undefined;
  }
}

async function getStyleContext() {
  try {
    const profile = await db.writingStyles.toCollection().first();
    if (!profile) return undefined;
    return { rawStyleSummary: profile.rawStyleSummary, styleFingerprint: profile.styleFingerprint };
  } catch {
    return undefined;
  }
}

async function getPortfolioContext() {
  try {
    const positions = await db.portfolioPositions.toArray();
    if (positions.length === 0) return undefined;
    const summary = calculatePortfolioSummary(positions);
    const allocations = calculateAllocations(positions);
    return { positions, summary, allocations };
  } catch {
    return undefined;
  }
}

export function useAgent() {
  const { messages, isStreaming, addMessage, updateLastMessage, updateLastMessagePreviews, setStreaming, clearMessages } =
    useAgentStore();

  const sendMessage = useCallback(
    async (content: string, context?: AgentChatRequest['context']) => {
      const currentMessages = useAgentStore.getState().messages;

      const userMessage = {
        id: generateId(),
        role: 'user' as const,
        content,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMessage);

      const assistantMessage = {
        id: generateId(),
        role: 'assistant' as const,
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };
      addMessage(assistantMessage);
      setStreaming(true);

      try {
        const allMessages = [...currentMessages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Supply workspace, style, and portfolio context from IndexedDB
        const [workspaces, styleProfile, portfolio] = await Promise.all([
          getWorkspaceContext(),
          getStyleContext(),
          getPortfolioContext(),
        ]);

        const enrichedContext = {
          ...context,
          workspaces,
          styleProfile,
          portfolio,
        };

        const response = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: allMessages, context: enrichedContext }),
        });

        if (!response.ok) throw new Error('Agent request failed');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        const collectedEmails: EmailPreview[] = [];
        let sseBuffer = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            sseBuffer += decoder.decode(value, { stream: true });
            const parts = sseBuffer.split('\n');
            // Keep the last part in the buffer (may be incomplete)
            sseBuffer = parts.pop() ?? '';

            for (const line of parts) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;
                let parsed: any;
                try {
                  parsed = JSON.parse(data);
                } catch {
                  // Skip incomplete or invalid JSON
                  continue;
                }
                if (parsed.content) {
                  accumulated += parsed.content;
                  updateLastMessage(accumulated);
                }
                if (parsed.emailResults && Array.isArray(parsed.emailResults)) {
                  for (const e of parsed.emailResults) {
                    collectedEmails.push({
                      id: e.id,
                      from: e.from ?? '',
                      subject: e.subject ?? '(No Subject)',
                      snippet: e.snippet ?? '',
                      date: e.date ?? '',
                    });
                  }
                }
                if (parsed.toolCall) {
                  console.log('[DEBUG] SSE toolCall:', parsed.toolCall.name, parsed.toolCall.input);
                }
                if (parsed.workspaceAction) {
                  console.log('[DEBUG] SSE workspaceAction received:', parsed.workspaceAction.type);
                  try {
                    await handleWorkspaceAction(parsed.workspaceAction);
                    console.log('[DEBUG] workspaceAction completed successfully');
                  } catch (actionErr) {
                    console.error('[DEBUG] Workspace action FAILED:', actionErr, parsed.workspaceAction);
                  }
                }
              }
            }
          }
        }

        if (collectedEmails.length > 0) {
          updateLastMessagePreviews(collectedEmails);
        }
      } catch (error) {
        updateLastMessage('An error occurred. Please try again.');
        console.error('Agent error:', error);
      } finally {
        setStreaming(false);
      }
    },
    [addMessage, updateLastMessage, updateLastMessagePreviews, setStreaming]
  );

  return {
    messages,
    isStreaming,
    sendMessage,
    clearMessages,
  };
}
