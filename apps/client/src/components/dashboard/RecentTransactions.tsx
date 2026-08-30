import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Filter,
  Plus,
  Receipt,
  Search,
  Trash2,
} from 'lucide-react';
import { ITransaction, TransactionType } from '../../types/transaction.types';
import { CategoryIcon } from '../common/CategoryIcon';

interface RecentTransactionsProps {
  transactions: ITransaction[];
  onOpenAddTransaction: (type?: TransactionType) => void;
  onDeleteTransaction: (id: string) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onOpenAddTransaction,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm">
      {/* Section Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Recent Transactions
          </h3>
          <p className="text-xs text-gray-500">
            Monitor and review your latest income and expenses
          </p>
        </div>

        {/* Action / Add button on desktop */}
        <button
          type="button"
          onClick={() => onOpenAddTransaction()}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Tabs & Search Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Filter Pills */}
        <div className="inline-flex p-1 bg-gray-100/80 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'expense'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'income'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Income
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-600 rounded-xl outline-none transition-colors"
          />
        </div>
      </div>

      {/* Transaction List or Empty State */}
      {filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-gray-50/60 border border-dashed border-gray-200">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-3.5 shadow-sm">
            <Receipt className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1">
            {searchQuery || filterType !== 'all'
              ? 'No matching transactions'
              : 'No transactions logged yet'}
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mb-5 leading-relaxed">
            {searchQuery || filterType !== 'all'
              ? 'Try changing your search keywords or active filter criteria.'
              : 'Your transaction history is empty. Start recording your expenses or income to unlock real-time financial tracking!'}
          </p>
          <button
            type="button"
            onClick={() => onOpenAddTransaction()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record First Transaction</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredTransactions.map((item) => {
            const isExpense = item.type === 'expense';
            return (
              <div
                key={item.id}
                className="py-3.5 sm:py-4 flex items-center justify-between hover:bg-gray-50/70 rounded-xl px-2 sm:px-3 transition-colors group"
              >
                {/* Left: Category Icon & Title */}
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{
                      backgroundColor: `${item.categoryColor}15`,
                      color: item.categoryColor,
                    }}
                  >
                    <CategoryIcon iconName={item.categoryIcon} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-medium text-gray-500">
                        {item.categoryName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.date)}
                      </span>
                      {item.notes && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline truncate max-w-[140px] italic">
                            &quot;{item.notes}&quot;
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Delete button */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-extrabold tracking-tight ${
                        isExpense ? 'text-gray-900' : 'text-emerald-700'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(item.amount)}
                    </div>
                    <div className="text-[11px] text-gray-400 capitalize">
                      {item.type}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteTransaction(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all focus:opacity-100"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
