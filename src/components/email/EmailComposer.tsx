'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Send, Sparkles } from 'lucide-react';

interface EmailComposerProps {
  defaultTo?: string;
  defaultSubject?: string;
  defaultBody?: string;
  threadId?: string;
  onSend?: (data: { to: string; subject: string; body: string }) => void;
  onClose?: () => void;
}

export function EmailComposer({
  defaultTo = '',
  defaultSubject = '',
  defaultBody = '',
  onSend,
}: EmailComposerProps) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!to || !subject) return;
    setSending(true);
    await onSend?.({ to, subject, body });
    setSending(false);
  };

  return (
    <div className="space-y-4 p-4">
      <Input label="To" value={to} onChange={(e) => setTo(e.target.value)} placeholder="email@example.com" />
      <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-500">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message..."
          rows={8}
          className="w-full bg-white/40 dark:bg-white/10 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none"
        />
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" icon={<Sparkles className="w-4 h-4" />} className="flex-1">
          AI Assist
        </Button>
        <Button variant="primary" icon={<Send className="w-4 h-4" />} loading={sending} onClick={handleSend} className="flex-1">
          Send
        </Button>
      </div>
    </div>
  );
}
