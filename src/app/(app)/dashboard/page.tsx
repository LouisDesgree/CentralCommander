'use client';

import { useSession } from 'next-auth/react';
import { TopBar } from '@/components/layout/TopBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTaskStore } from '@/stores/taskStore';
import {
  TASK_PRIORITY_CONFIG,
  TASK_CATEGORY_CONFIG,
} from '@/types/tasks';
import {
  Mail,
  AlertTriangle,
  Inbox,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
  TrendingUp,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useRouter } from 'next/navigation';
import { ParticleField } from '@/components/ui/ParticleField';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { tasks } = useTaskStore();
  const router = useRouter();

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Task stats
  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const todayStr = now.toDateString();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayTasks = activeTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate).toDateString() === todayStr
  );
  const overdueTasks = activeTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < startOfDay
  );
  const completionRate =
    tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  // Upcoming tasks preview (top 4 by priority)
  const previewTasks = activeTasks
    .slice()
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      if (a.dueDate && b.dueDate)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    })
    .slice(0, 4);

  return (
    <>
      <TopBar title="Dashboard" />
      <PageTransition>
        <div className="px-4 py-6 space-y-6">

          {/* ── Hero greeting (enhanced from original) ── */}
          <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-blue-500/[0.15] via-violet-500/[0.08] to-transparent border border-white/20 dark:border-white/10">
            <ParticleField count={28} maxOpacity={0.3} speed={0.2} />
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
              {activeTasks.length > 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                  {overdueTasks.length > 0 && (
                    <>
                      <span className="text-red-500 font-semibold">
                        {overdueTasks.length} overdue
                      </span>
                      {' · '}
                    </>
                  )}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {activeTasks.length} active
                  </span>{' '}
                  task{activeTasks.length !== 1 ? 's' : ''}
                  {todayTasks.length > 0 && (
                    <>
                      {' · '}
                      <span className="text-amber-500 font-semibold">
                        {todayTasks.length} due today
                      </span>
                    </>
                  )}
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-1">
                  {tasks.length > 0
                    ? 'All caught up — great work!'
                    : 'Ready to take on the day!'}
                </p>
              )}
            </div>
          </div>

          {/* ── Email summary cards (ORIGINAL — preserved) ── */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard title="Unread" value="--" icon={Mail} color="bg-blue-500" />
            <SummaryCard title="Urgent" value="--" icon={AlertTriangle} color="bg-amber-500" />
            <SummaryCard title="Today" value="--" icon={Calendar} color="bg-green-500" />
            <SummaryCard title="Total" value="--" icon={Inbox} color="bg-purple-500" />
          </div>

          {/* ── Quick Actions (ORIGINAL — preserved) ── */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
            <QuickActionsGrid />
          </div>

          {/* ── My Tasks section (NEW) ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">My Tasks</h2>
              <Link
                href="/tasks"
                className="flex items-center gap-1 text-sm text-blue-500 font-medium"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <GlassCard
                interactive
                padding="md"
                className="text-center"
                onClick={() => router.push('/tasks')}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center mx-auto mb-2">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-bold">{activeTasks.length}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Active</p>
                {overdueTasks.length > 0 && (
                  <p className="text-[11px] text-red-400 font-medium mt-1">
                    {overdueTasks.length} overdue
                  </p>
                )}
              </GlassCard>
              <GlassCard
                interactive
                padding="md"
                className="text-center"
                onClick={() => router.push('/tasks')}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-bold">{todayTasks.length}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Due Today</p>
              </GlassCard>
              <GlassCard
                interactive
                padding="md"
                className="text-center"
                onClick={() => router.push('/tasks')}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-bold">{doneTasks.length}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Done</p>
              </GlassCard>
            </div>
          </div>

          {/* ── Task progress bar (NEW — only when tasks exist) ── */}
          {tasks.length > 0 && (
            <GlassCard padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold">Overall progress</span>
                </div>
                <span className="text-sm font-bold text-blue-500">{completionRate}%</span>
              </div>
              <div className="h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {doneTasks.length} of {tasks.length} tasks completed
              </p>
            </GlassCard>
          )}

          {/* ── Priority tasks preview (NEW) ── */}
          {previewTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h2 className="text-base font-bold">Priority Tasks</h2>
                </div>
                <Link
                  href="/tasks"
                  className="flex items-center gap-1 text-sm text-blue-500 font-medium"
                >
                  All tasks <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-2">
                {previewTasks.map((task) => {
                  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
                  const categoryConfig = TASK_CATEGORY_CONFIG[task.category];
                  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                  const isOverdue = dueDate && dueDate < startOfDay;
                  const isToday = dueDate && dueDate.toDateString() === todayStr;
                  const formattedDue = dueDate
                    ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : null;

                  return (
                    <Link href="/tasks" key={task.id}>
                      <GlassCard
                        padding="sm"
                        interactive
                        className="flex items-center gap-3 px-3 py-3"
                      >
                        <div
                          className={cn(
                            'flex-none w-2 h-2 rounded-full',
                            priorityConfig.dotColor
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn('text-[11px] font-medium', categoryConfig.color)}>
                              {categoryConfig.icon} {categoryConfig.label}
                            </span>
                            {formattedDue && (
                              <span
                                className={cn(
                                  'text-[11px]',
                                  isOverdue
                                    ? 'text-red-400 font-medium'
                                    : isToday
                                      ? 'text-blue-400 font-medium'
                                      : 'text-gray-400'
                                )}
                              >
                                {isOverdue ? '⚠ ' : ''}
                                {formattedDue}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-none" />
                      </GlassCard>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Recent Activity (ORIGINAL — preserved) ── */}
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
