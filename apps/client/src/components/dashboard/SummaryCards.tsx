import React from 'react';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

interface ISummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
  loading?: boolean;
}

export const SummaryCards: React.FC<ISummaryCardsProps> = ({ income, expense, balance, loading }) => {
  const cards = [
    {
      label: 'Income',
      value: income,
      icon: <TrendingUp className="w-5 h-5" />,
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200',
    },
    {
      label: 'Expense',
      value: expense,
      icon: <TrendingDown className="w-5 h-5" />,
      colorClass: 'text-red-500',
      bgClass: 'bg-red-50',
      borderClass: 'border-red-200',
    },
    {
      label: 'Balance',
      value: balance,
      icon: <Wallet className="w-5 h-5" />,
      colorClass: balance >= 0 ? 'text-blue-600' : 'text-orange-500',
      bgClass: balance >= 0 ? 'bg-blue-50' : 'bg-orange-50',
      borderClass: balance >= 0 ? 'border-blue-200' : 'border-orange-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-2xl border ${card.borderClass} ${card.bgClass} p-5 flex items-center gap-4 shadow-sm`}
        >
          <div className={`p-2.5 rounded-xl bg-white shadow-sm ${card.colorClass}`}>
            {card.icon}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
            {loading ? (
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className={`text-lg font-bold ${card.colorClass}`}>{formatVND(card.value)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
