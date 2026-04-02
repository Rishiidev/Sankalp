import React from 'react';
import { Home, Flame, TrendingUp, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export function BottomNav({ currentTab, setTab }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'sadhana', icon: Flame, label: 'Sadhana' },
    { id: 'progress', icon: TrendingUp, label: 'Progress' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-orange-500" : "text-slate-500 hover:text-slate-400"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
