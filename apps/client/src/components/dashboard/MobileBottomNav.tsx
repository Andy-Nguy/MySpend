import React from 'react';
import { Home, Layers, PieChart, Plus, Receipt } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../consts/routes';

interface MobileBottomNavProps {
  onOpenAddTransaction: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAddTransaction,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {/* Home */}
        <button
          type="button"
          onClick={() => navigate(AppRoutes.HOME)}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-semibold transition-colors ${
            location.pathname === AppRoutes.HOME ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Trang chủ</span>
        </button>

        {/* Categories */}
        <button
          type="button"
          onClick={() => navigate(AppRoutes.CATEGORIES)}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-semibold transition-colors ${
            location.pathname === AppRoutes.CATEGORIES ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Danh mục</span>
        </button>

        {/* Center Quick Add FAB */}
        <div className="-mt-5">
          <button
            type="button"
            onClick={onOpenAddTransaction}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-700/40 hover:scale-105 active:scale-95 transition-all focus:outline-none ring-4 ring-white"
            aria-label="Add transaction"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Transactions */}
        <button
          type="button"
          onClick={() => navigate(AppRoutes.TRANSACTIONS)}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-semibold transition-colors ${
            location.pathname === AppRoutes.TRANSACTIONS ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>Lịch sử</span>
        </button>

        {/* Reports */}
        <button
          type="button"
          onClick={() => navigate(AppRoutes.REPORTS)}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-semibold transition-colors ${
            location.pathname === AppRoutes.REPORTS ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span>Báo cáo</span>
        </button>
      </div>
    </div>
  );
};
