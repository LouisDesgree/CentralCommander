import { google } from 'googleapis';
import type { Email, EmailAddress, EmailLabel } from '@/types/email';

export function createGmailClient(accessToken: string) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oAuth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth: oAuth2Client });
}

function parseEmailAddress(raw: string): EmailAddress {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ''), email: match[2] };
  }
  return { name: raw, email: raw };
}

function getHeader(headers: { name: string; value: string }[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function extractBody(payload: any): { text: string; html: string } {
  let text = '';
  let html = '';

  if (payload.body?.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/plain') text = decoded;
    if (payload.mimeType === 'text/html') html = decoded;
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const result = extractBody(part);
      if (result.text) text = result.text;
      if (result.html) html = result.html;
    }
  }

  return { text, html };
}

export function parseGmailMessage(message: any): Email {
  const headers = message.payload?.headers ?? [];
  const body = extractBody(message.payload ?? {});
  const labels = message.labelIds ?? [];

  const from = parseEmailAddress(getHeader(headers, 'From'));
  const toRaw = getHeader(headers, 'To');
  const ccRaw = getHeader(headers, 'Cc');

  const to = toRaw ? toRaw.split(',').map((s: string) => parseEmailAddress(s.trim())) : [];
  const cc = ccRaw ? ccRaw.split(',').map((s: string) => parseEmailAddress(s.trim())) : [];

  const attachments = (message.payload?.parts ?? [])
    .filter((p: any) => p.filename && p.body?.attachmentId)
    .map((p: any) => ({
      id: p.body.attachmentId,
      filename: p.filename,
      mimeType: p.mimeType,
      size: p.body.size ?? 0,
    }));

  return {
    id: message.id,
    threadId: message.threadId,
    from,
    to,
    cc,
    bcc: [],
    subject: getHeader(headers, 'Subject') || '(No Subject)',
    snippet: message.snippet ?? '',
    body,
    date: new Date(parseInt(message.internalDate, 10)).toISOString(),
    labels,
    labelNames: labels,
    isUnread: labels.includes('UNREAD'),
    isStarred: labels.includes('STARRED'),
    hasAttachments: attachments.length > 0,
    attachments,
  };
}

export function parseGmailLabel(label: any): EmailLabel {
  return {
    id: label.id,
    name: label.name,
    type: label.type === 'system' ? 'system' : 'user',
    color: label.color?.backgroundColor,
    messagesTotal: label.messagesTotal ?? 0,
    messagesUnread: label.messagesUnread ?? 0,
  };
}
