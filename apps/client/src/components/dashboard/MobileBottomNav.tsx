import React from 'react';
import { Home, Layers, PieChart, Plus, Receipt } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppRoutes } from '../../consts/routes';

interface MobileBottomNavProps {
  onOpenAddTransaction: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAddTransaction,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f4fbf4]/90 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.05)] border-t border-[#bbcabf]/40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex items-center justify-around px-2 h-16">
        {/* Home */}
        <button
          type="button"
          onClick={() => navigate(AppRoutes.HOME)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 text-[11px] transition-colors ${
            location.pathname === AppRoutes.HOME
              ? 'text-[#006c49] font-bold'
              : 'text-[#3c4a42] font-medium hover:text-[#161d19]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{t('nav.dashboard')}</span>
        </button>

        {/* Categories */}
        <button
          type="button"
          onClick={() => navigate(AppRoutes.CATEGORIES)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 text-[11px] transition-colors ${
            location.pathname === AppRoutes.CATEGORIES
              ? 'text-[#006c49] font-bold'
              : 'text-[#3c4a42] font-medium hover:text-[#161d19]'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>{t('nav.categories')}</span>
        </button>

        {/* Center Quick Add FAB */}
        <div className="-mt-6">
          <button
            type="button"
            onClick={onOpenAddTransaction}
            className="w-14 h-14 rounded-full bg-[#006c49] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,108,73,0.35)] hover:scale-105 active:scale-95 transition-all duration-150 focus:outline-none ring-4 ring-[#f4fbf4]"
            aria-label="Add transaction"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Transactions */}
        <button
          type="button"
          onClick={() => navigate(AppRoutes.TRANSACTIONS)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 text-[11px] transition-colors ${
            location.pathname === AppRoutes.TRANSACTIONS
              ? 'text-[#006c49] font-bold'
              : 'text-[#3c4a42] font-medium hover:text-[#161d19]'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>{t('nav.transactions')}</span>
        </button>

        {/* Reports */}
        <button
          type="button"
          onClick={() => navigate(AppRoutes.REPORTS)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 text-[11px] transition-colors ${
            location.pathname === AppRoutes.REPORTS
              ? 'text-[#006c49] font-bold'
              : 'text-[#3c4a42] font-medium hover:text-[#161d19]'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span>{t('nav.reports')}</span>
        </button>
      </div>
    </div>
  );
};
