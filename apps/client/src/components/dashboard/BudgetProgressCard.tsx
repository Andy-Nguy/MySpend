import React from 'react';
import { AlertCircle, CheckCircle2, Sparkles, Target } from 'lucide-react';

interface BudgetProgressCardProps {
  totalBudget: number;
  totalExpense: number;
  onOpenSetBudget: () => void;
}

export const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({
  totalBudget,
  totalExpense,
  onOpenSetBudget,
}) => {
  const percentage = totalBudget > 0 ? Math.min(100, Math.round((totalExpense / totalBudget) * 100)) : 0;
  const isOverBudget = totalExpense > totalBudget;
  const remaining = Math.max(0, totalBudget - totalExpense);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate();

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Monthly Budget</h3>
            <p className="text-xs text-gray-400">{daysLeft} days remaining this month</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSetBudget}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          Edit Target
        </button>
      </div>

      {/* Main Budget Metric */}
      <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/70 mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>Spent {formatCurrency(totalExpense)}</span>
          <span>Target {formatCurrency(totalBudget)}</span>
        </div>

        {/* Large Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? 'bg-rose-500'
                : percentage > 80
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-emerald-600 to-teal-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-800">
            {percentage}% utilized
          </span>
          <span className={`font-semibold ${isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
            {isOverBudget ? `Exceeded by ${formatCurrency(totalExpense - totalBudget)}` : `${formatCurrency(remaining)} left`}
          </span>
        </div>
      </div>

      {/* Smart Budget Advice Pill */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900">
        <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {percentage === 0
            ? 'You have 100% of your budget available. Start logging daily expenses to keep spending on track.'
            : percentage < 60
            ? 'Great pacing! Your spending is well within your budget limit for this point in the month.'
            : percentage <= 90
            ? 'You have utilized over 60% of your budget. Consider reviewing non-essential purchases.'
            : 'Caution: You have reached 90%+ of your monthly spending limit.'}
        </p>
      </div>
    </div>
  );
};
