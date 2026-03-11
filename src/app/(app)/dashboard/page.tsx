'use client';

import { useSession } from 'next-auth/react';
import { TopBar } from '@/components/layout/TopBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { RecentTasks } from '@/components/dashboard/RecentTasks';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Mail,
  AlertTriangle,
  Inbox,
  Calendar,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <TopBar title="Dashboard" />
      <PageTransition>
        <div className="px-4 py-6 space-y-6">

          {/* ── Hero greeting ── */}
          <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-blue-500/[0.15] via-violet-500/[0.08] to-transparent border border-white/20 dark:border-white/10">
            <div className="absolute -top-8 -right-8 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-sm text-gray-400 mt-1">
                {now.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <h1 className="text-2xl font-bold">
                {greeting}, {firstName}
              </h1>
            </div>
          </div>

          {/* ── Email summary cards ── */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard title="Unread" value="--" icon={Mail} color="bg-blue-500" />
            <SummaryCard title="Urgent" value="--" icon={AlertTriangle} color="bg-amber-500" />
            <SummaryCard title="Today" value="--" icon={Calendar} color="bg-green-500" />
            <SummaryCard title="Total" value="--" icon={Inbox} color="bg-purple-500" />
          </div>

          {/* ── Quick Actions ── */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
            <QuickActionsGrid />
          </div>

          <RecentTasks />

          {/* ── Recent Activity ── */}
          <GlassCard padding="md" className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Recent Activity</h3>
            <p className="text-sm text-gray-400">
              Connect your Gmail to see recent email activity here.
            </p>
          </GlassCard>
        </div>
      </PageTransition>
    </>
  );
}
