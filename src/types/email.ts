export interface EmailAddress {
  name: string;
  email: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export type EmailCategory =
  | 'important'
  | 'newsletter'
  | 'social'
  | 'promotional'
  | 'transactional'
  | 'personal'
  | 'work'
  | 'finance'
  | 'travel';

export interface Email {
  id: string;
  threadId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  subject: string;
  snippet: string;
  body: {
    text: string;
    html: string;
  };
  date: string;
  labels: string[];
  labelNames: string[];
  isUnread: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments: Attachment[];
  aiCategory?: EmailCategory;
  aiSummary?: string;
  aiPriority?: 'high' | 'medium' | 'low';
}

export interface EmailThread {
  id: string;
  messages: Email[];
  subject: string;
  participants: EmailAddress[];
  lastMessageDate: string;
  snippet: string;
  messageCount: number;
}

export interface EmailLabel {
  id: string;
  name: string;
  type: 'system' | 'user';
  color?: string;
  messagesTotal: number;
  messagesUnread: number;
}

export interface EmailListParams {
  labelIds?: string[];
  query?: string;
  maxResults?: number;
  pageToken?: string;
  category?: EmailCategory;
}

export interface EmailListResponse {
  emails: Email[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}
