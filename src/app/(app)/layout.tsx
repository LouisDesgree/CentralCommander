'use client';

import { BottomTabBar } from '@/components/layout/BottomTabBar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomTabBar />
    </div>
  );
}
