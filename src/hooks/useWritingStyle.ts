'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateId } from '@/lib/db';
import type { WritingStyleProfile } from '@/types/workspace';

export function useWritingStyle() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const profile = useLiveQuery(
    () => db.writingStyles.toCollection().first(),
    [],
    undefined
  );

  async function analyzeStyle() {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/agent/analyze-style', { method: 'POST' });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();

      const styleProfile: WritingStyleProfile = {
        id: profile?.id ?? generateId(),
        userId: 'current',
        analyzedEmailCount: data.analyzedEmailCount,
        lastAnalyzedAt: data.lastAnalyzedAt,
        styleFingerprint: data.styleFingerprint,
        rawStyleSummary: data.rawStyleSummary,
        sampleExcerpts: data.sampleExcerpts ?? [],
        createdAt: profile?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.writingStyles.put(styleProfile);
      return styleProfile;
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function clearStyle() {
    await db.writingStyles.clear();
  }

  return {
    profile,
    isAnalyzing,
    analyzeStyle,
    clearStyle,
  };
}
