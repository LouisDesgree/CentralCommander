export type AgentRole = 'user' | 'assistant';

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  timestamp: string;
  toolCalls?: AgentToolCall[];
  emailPreviews?: EmailPreview[];
  isStreaming?: boolean;
}

export interface AgentToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface EmailPreview {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
}

export interface Conversation {
  id: string;
  messages: AgentMessage[];
  createdAt: string;
  updatedAt: string;
  title?: string;
}

export interface AgentChatRequest {
  messages: Array<{ role: AgentRole; content: string }>;
  context?: {
    emailId?: string;
    threadId?: string;
    action?: 'summarize' | 'draft' | 'categorize' | 'general';
  };
}
