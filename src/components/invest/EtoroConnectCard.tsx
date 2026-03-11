'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusDot } from '@/components/ui/StatusDot';
import { useInvestmentSettings } from '@/hooks/useInvestmentSettings';
import { Link2, Link2Off, RefreshCw } from 'lucide-react';

interface EtoroConnectCardProps {
  onSync?: () => Promise<void>;
  isSyncing?: boolean;
}

export function EtoroConnectCard({ onSync, isSyncing }: EtoroConnectCardProps) {
  const { settings, saveEtoroApiKey, clearEtoroConnection } = useInvestmentSettings();
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (!apiKey.trim()) return;
    setConnecting(true);
    try {
      await saveEtoroApiKey(apiKey.trim(), username.trim() || undefined);
      setApiKey('');
      setUsername('');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await clearEtoroConnection();
  };

  return (
    <GlassCard padding="md" className="mx-4">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-semibold flex-1">eToro</h4>
        <StatusDot color={settings.etoroConnected ? 'green' : 'gray'} pulse={settings.etoroConnected} />
        <span className="text-xs text-gray-400">{settings.etoroConnected ? 'Connected' : 'Not connected'}</span>
      </div>

      {settings.etoroConnected ? (
        <div className="space-y-3">
          {settings.etoroUsername && (
            <p className="text-xs text-gray-400">Account: {settings.etoroUsername}</p>
          )}
          {settings.lastSyncAt && (
            <p className="text-[10px] text-gray-500">
              Last sync: {new Date(settings.lastSyncAt).toLocaleString()}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={onSync}
              loading={isSyncing}
              className="flex-1"
            >
              Sync Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Link2Off className="w-3.5 h-3.5" />}
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            label="API Key"
            type="password"
            placeholder="Your eToro API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Input
            label="Username (optional)"
            placeholder="eToro username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={<Link2 className="w-3.5 h-3.5" />}
            onClick={handleConnect}
            loading={connecting}
            disabled={!apiKey.trim()}
            className="w-full"
          >
            Connect eToro
          </Button>
        </div>
      )}
    </GlassCard>
  );
}
