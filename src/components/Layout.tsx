import React from 'react';
import { BottomNav } from './BottomNav';
import { useStore } from '../lib/store';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setTab: (tab: string) => void;
}

export function Layout({ children, currentTab, setTab }: LayoutProps) {
  const { user } = useStore();

  if (!user?.onboardingCompleted) {
    return <div className="min-h-screen bg-slate-950 text-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-16">
      <main className="max-w-md mx-auto min-h-screen relative">
        {children}
      </main>
      <BottomNav currentTab={currentTab} setTab={setTab} />
    </div>
  );
}
