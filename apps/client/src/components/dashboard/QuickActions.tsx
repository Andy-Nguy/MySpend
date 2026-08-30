import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Layers, Plus, Target } from 'lucide-react';

interface QuickActionsProps {
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenSetBudget: () => void;
  onOpenCategories: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenSetBudget,
  onOpenCategories,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Quick Actions
        </h3>
        <span className="text-xs text-gray-400">
          Fast shortcuts to manage your money
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Add Expense */}
        <button
          type="button"
          onClick={onOpenAddExpense}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-100 text-rose-700 font-semibold text-xs sm:text-sm transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="font-bold truncate">Log Expense</div>
            <div className="text-[11px] font-normal text-rose-600/80 hidden sm:block">Record spending</div>
          </div>
        </button>

        {/* 2. Add Income */}
        <button
          type="button"
          onClick={onOpenAddIncome}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-100 text-emerald-700 font-semibold text-xs sm:text-sm transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="font-bold truncate">Add Income</div>
            <div className="text-[11px] font-normal text-emerald-700/80 hidden sm:block">Log earnings</div>
          </div>
        </button>

        {/* 3. Set Monthly Budget */}
        <button
          type="button"
          onClick={onOpenSetBudget}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-100 text-indigo-700 font-semibold text-xs sm:text-sm transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="font-bold truncate">Set Budget</div>
            <div className="text-[11px] font-normal text-indigo-600/80 hidden sm:block">Monthly targets</div>
          </div>
        </button>

        {/* 4. Categories */}
        <button
          type="button"
          onClick={onOpenCategories}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-100 text-amber-800 font-semibold text-xs sm:text-sm transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="font-bold truncate">Categories</div>
            <div className="text-[11px] font-normal text-amber-700/80 hidden sm:block">Manage tags</div>
          </div>
        </button>
      </div>
    </div>
  );
};
