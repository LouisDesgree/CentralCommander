'use client';

import useSWR from 'swr';
import type { EmailListResponse, EmailListParams } from '@/types/email';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useEmails(params?: EmailListParams) {
  const searchParams = new URLSearchParams();
  if (params?.maxResults) searchParams.set('maxResults', String(params.maxResults));
  if (params?.pageToken) searchParams.set('pageToken', params.pageToken);
  if (params?.query) searchParams.set('q', params.query);
  // labelIds: undefined = default (API defaults to INBOX), [] = all mail, ['SENT'] = sent, etc.
  if (params?.labelIds !== undefined) {
    searchParams.set('labelIds', params.labelIds.join(','));
  }

  const query = searchParams.toString();
  const url = `/api/gmail/messages${query ? `?${query}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<EmailListResponse>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  return {
    emails: data?.emails ?? [],
    nextPageToken: data?.nextPageToken,
    resultSizeEstimate: data?.resultSizeEstimate ?? 0,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useEmail(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/gmail/messages/${id}` : null,
    fetcher
  );

  return {
    email: data?.email ?? null,
    isLoading,
    error,
  };
}
