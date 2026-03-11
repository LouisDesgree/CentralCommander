'use client';

import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { useTheme } from '@/hooks/useTheme';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize theme detection on all app pages
  useTheme();

  return (
    <div className="min-h-screen pb-[72px]">
      {children}
      <BottomTabBar />
    </div>
  );
}
