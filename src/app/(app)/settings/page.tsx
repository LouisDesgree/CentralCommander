'use client';

import { useSession, signOut } from 'next-auth/react';
import { TopBar } from '@/components/layout/TopBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { StatusDot } from '@/components/ui/StatusDot';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { WritingStyleCard } from '@/components/style/WritingStyleCard';
import { Mail, LogOut, Palette, Link2, Info, Pen } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <>
      <TopBar title="Settings" />
      <PageTransition>
        <div className="px-4 py-6 space-y-6">
          {/* Profile */}
          <GlassCard padding="md" className="flex items-center gap-4">
            <Avatar
              name={session?.user?.name ?? 'User'}
              src={session?.user?.image}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{session?.user?.name}</p>
              <p className="text-sm text-gray-400 truncate">{session?.user?.email}</p>
            </div>
          </GlassCard>

          {/* Appearance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Palette className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-400 uppercase">Appearance</h3>
            </div>
            <GlassCard padding="md">
              <ThemeToggle />
            </GlassCard>
          </div>

          {/* Connections */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Link2 className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-400 uppercase">Connections</h3>
            </div>
            <GlassCard padding="md" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Gmail</p>
                  <p className="text-xs text-gray-400">{session?.user?.email}</p>
                </div>
              </div>
              <StatusDot color="green" pulse />
            </GlassCard>
          </div>

          {/* Writing Style */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Pen className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-400 uppercase">Writing Style</h3>
            </div>
            <WritingStyleCard />
          </div>

          {/* About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Info className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-400 uppercase">About</h3>
            </div>
            <GlassCard padding="md" className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Version</span>
                <span className="text-sm">0.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">AI Model</span>
                <span className="text-sm">Claude Sonnet</span>
              </div>
            </GlassCard>
          </div>

          {/* Sign Out */}
          <Button
            variant="danger"
            size="lg"
            icon={<LogOut className="w-4 h-4" />}
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </PageTransition>
    </>
  );
}
