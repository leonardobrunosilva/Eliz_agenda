import React from 'react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const navItems: { id: ViewState; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'dashboard', label: 'Geral' },
    { id: 'schedule', icon: 'calendar_month', label: 'Agenda' },
    { id: 'clients', icon: 'group', label: 'Clientes' },
    { id: 'financial', icon: 'receipt_long', label: 'Finanças' },
  ];

  return (
    <nav className="z-50 w-full bg-white dark:bg-[#1C1917] px-6 pb-6 pt-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className="group flex flex-col items-center gap-1 min-w-[64px] transition-all duration-200"
            >
              <div
                className={`flex h-10 w-16 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-primary shadow-soft shadow-primary/40'
                    : 'bg-transparent group-hover:bg-gray-50 dark:group-hover:bg-white/5'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[24px] transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-primary dark:text-gray-500'
                  }`}
                >
                  {item.icon}
                </span>
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-gray-400 group-hover:text-primary dark:text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;