import React from 'react';
import { Layers, PieChart } from 'lucide-react';
import { ICategory, ITransaction } from '../../types/transaction.types';
import { CategoryIcon } from '../common/CategoryIcon';

interface CategoryBreakdownProps {
  categories: ICategory[];
  transactions: ITransaction[];
  totalExpense: number;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  categories,
  transactions,
  totalExpense,
}) => {
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Compute spent amount per category
  const categoryStats = expenseCategories.map((cat) => {
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = totalExpense > 0 ? Math.round((spent / totalExpense) * 100) : 0;
    const budget = cat.budgetLimit || 500;
    const budgetPct = Math.min(100, Math.round((spent / budget) * 100));

    return {
      ...cat,
      spent,
      percentage,
      budget,
      budgetPct,
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Category Breakdown
          </h3>
          <p className="text-xs text-gray-500">
            Monthly spending distribution across categories
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <PieChart className="w-4 h-4" />
        </div>
      </div>

      {totalExpense === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400 bg-gray-50/70 rounded-xl border border-dashed border-gray-200 p-4">
          <Layers className="w-6 h-6 text-gray-300 mx-auto mb-2" />
          <p className="font-medium text-gray-600 mb-1">No category spending yet</p>
          <p>Add your expenses to see spending analytics by category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categoryStats
            .filter((c) => c.spent > 0)
            .sort((a, b) => b.spent - a.spent)
            .map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-gray-800">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {formatCurrency(cat.spent)}
                    </span>
                    <span className="text-gray-400 font-normal">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
