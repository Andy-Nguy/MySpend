import React from 'react';
import { PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

interface ISummaryCardsProps {
  income?: number;
  expense?: number;
  netSavings?: number;
  totalBalance?: number;
  balance?: number; // Backward-compatibility
  loading?: boolean;
}

export const SummaryCards: React.FC<ISummaryCardsProps> = ({
  income,
  expense,
  netSavings,
  totalBalance,
  balance,
  loading,
}) => {
  const currentNetSavings = netSavings ?? balance;

  const cards = [
    {
      label: 'Total Balance',
      sublabel: 'Số dư thực tế hiện có',
      value: totalBalance,
      icon: <Wallet className="w-5 h-5" />,
      colorClass: (totalBalance ?? 0) >= 0 ? 'text-indigo-600' : 'text-red-500',
      bgClass: (totalBalance ?? 0) >= 0 ? 'bg-indigo-50/60' : 'bg-red-50',
      borderClass: (totalBalance ?? 0) >= 0 ? 'border-indigo-200' : 'border-red-200',
    },
    {
      label: 'Monthly Income',
      sublabel: 'Thu nhập tháng này',
      value: income,
      icon: <TrendingUp className="w-5 h-5" />,
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50/60',
      borderClass: 'border-emerald-200',
    },
    {
      label: 'Monthly Expense',
      sublabel: 'Chi tiêu tháng này',
      value: expense,
      icon: <TrendingDown className="w-5 h-5" />,
      colorClass: 'text-red-500',
      bgClass: 'bg-red-50/60',
      borderClass: 'border-red-200',
    },
    {
      label: 'Net Cashflow',
      sublabel: 'Thu ròng (Thu - Chi)',
      value: currentNetSavings,
      icon: <PiggyBank className="w-5 h-5" />,
      colorClass: (currentNetSavings ?? 0) >= 0 ? 'text-emerald-700' : 'text-amber-600',
      bgClass: (currentNetSavings ?? 0) >= 0 ? 'bg-emerald-50/60' : 'bg-amber-50/60',
      borderClass: (currentNetSavings ?? 0) >= 0 ? 'border-emerald-200' : 'border-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full overflow-hidden">
      {cards.map((card) => {
        const isCardLoading = loading || card.value === undefined;
        return (
          <div
            key={card.label}
            className={`rounded-2xl border ${card.borderClass} ${card.bgClass} p-4 sm:p-5 flex items-center gap-3 shadow-sm min-w-0 overflow-hidden bg-white/70 backdrop-blur-sm`}
          >
            <div className={`p-2.5 rounded-xl bg-white shadow-sm ${card.colorClass} flex-shrink-0`}>
              {card.icon}
            </div>
            <div className="min-w-0 overflow-hidden flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">{card.label}</p>
              {isCardLoading ? (
                <div className="h-6 w-28 bg-gray-200/80 rounded-lg animate-pulse mt-1" />
              ) : (
                <p className={`text-base sm:text-lg font-bold ${card.colorClass} truncate mt-0.5`}>
                  {formatVND(card.value!)}
                </p>
              )}
              <p className="text-[10px] text-gray-400 truncate mt-0.5">{card.sublabel}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
