'use client';

import { useWritingStyle } from '@/hooks/useWritingStyle';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pen, RefreshCw, Trash2 } from 'lucide-react';

export function WritingStyleCard() {
  const { profile, isAnalyzing, analyzeStyle, clearStyle } = useWritingStyle();

  return (
    <GlassCard padding="md" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Pen className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-medium">My Writing Style</p>
            <p className="text-xs text-gray-400">
              {profile
                ? `Based on ${profile.analyzedEmailCount} emails`
                : 'Not yet analyzed'}
            </p>
          </div>
        </div>
      </div>

      {profile && (
        <div className="space-y-2 pt-1">
          <p className="text-xs text-gray-400 leading-relaxed">{profile.rawStyleSummary}</p>
          <div className="flex flex-wrap gap-1">
            {profile.styleFingerprint.toneKeywords.map((kw) => (
              <Badge key={kw} variant="default">{kw}</Badge>
            ))}
            {profile.styleFingerprint.languages.map((lang) => (
              <Badge key={lang} variant="info">{lang.toUpperCase()}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="secondary"
          size="sm"
          loading={isAnalyzing}
          icon={profile ? <RefreshCw className="w-3.5 h-3.5" /> : undefined}
          onClick={analyzeStyle}
        >
          {profile ? 'Re-analyze' : 'Learn from my emails'}
        </Button>
        {profile && (
          <Button variant="ghost" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={clearStyle}>
            Clear
          </Button>
        )}
      </div>
    </GlassCard>
  );
}
