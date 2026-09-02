import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

interface MetricCardsProps {
  totalIncome?: number;
  totalExpense?: number;
  totalBudget?: number;
  loading?: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalIncome = 0,
  totalExpense = 0,
  totalBudget = 0,
  loading = false,
}) => {
  const netBalance = totalIncome - totalExpense;
  const remainingBudget = Math.max(0, totalBudget - totalExpense);
  const budgetUtilization =
    totalBudget > 0 ? Math.min(100, Math.round((totalExpense / totalBudget) * 100)) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="w-10 h-10 rounded-xl bg-gray-100" />
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {/* 1. Total Balance */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Net Balance
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
          {formatCurrency(netBalance)}
        </div>
        <div className="flex items-center text-xs font-medium text-gray-500">
          {netBalance >= 0 ? (
            <span className="inline-flex items-center text-emerald-600 font-semibold mr-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              Positive
            </span>
          ) : (
            <span className="inline-flex items-center text-rose-600 font-semibold mr-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              Deficit
            </span>
          )}
          <span>Overall net savings</span>
        </div>
      </div>

      {/* 2. Monthly Income */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Monthly Income
          </span>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-teal-900 tracking-tight mb-1">
          {formatCurrency(totalIncome)}
        </div>
        <div className="flex items-center text-xs font-medium text-gray-500">
          <span className="inline-flex items-center text-teal-600 font-semibold mr-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            Active
          </span>
          <span>Earned this month</span>
        </div>
      </div>

      {/* 3. Monthly Expenses */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Monthly Expenses
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
          {formatCurrency(totalExpense)}
        </div>
        <div className="flex items-center text-xs font-medium text-gray-500">
          <span className="text-rose-600 font-semibold mr-1.5">
            {budgetUtilization}%
          </span>
          <span>of monthly budget</span>
        </div>
      </div>

      {/* 4. Budget Remaining */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Budget Remaining
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          {formatCurrency(remainingBudget)}
        </div>

        {/* Mini progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-1.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetUtilization > 90
                ? 'bg-rose-500'
                : budgetUtilization > 75
                ? 'bg-amber-500'
                : 'bg-emerald-600'
            }`}
            style={{ width: `${budgetUtilization}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>Target: {formatCurrency(totalBudget)}</span>
          <span className="font-semibold text-gray-600">{100 - budgetUtilization}% left</span>
        </div>
      </div>
    </div>
  );
};
