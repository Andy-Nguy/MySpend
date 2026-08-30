import React from 'react';
import {
  Home,
  LogOut,
  PieChart,
  Plus,
  Receipt,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  onOpenAddTransaction: () => void;
  activeTab: 'home' | 'transactions' | 'analytics';
  setActiveTab: (tab: 'home' | 'transactions' | 'analytics') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAddTransaction,
  activeTab,
  setActiveTab,
}) => {
  const { logout } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'home' ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        {/* Transactions */}
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'transactions' ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>Activity</span>
        </button>

        {/* Center Quick Add FAB */}
        <div className="-mt-6">
          <button
            type="button"
            onClick={onOpenAddTransaction}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-700/40 hover:scale-105 active:scale-95 transition-all focus:outline-none ring-4 ring-white"
            aria-label="Add transaction"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Analytics */}
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'analytics' ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span>Analytics</span>
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={() => logout()}
          className="flex flex-col items-center gap-1 p-1 text-[10px] font-semibold text-gray-400 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};
