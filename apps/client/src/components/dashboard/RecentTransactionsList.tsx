import React, { useMemo, useState } from 'react';
import { Button, Input } from 'antd';
import { ArrowRight, ReceiptText, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ITransaction, CategoryTypeEnum } from '@myspend/libs';
import { AppRoutes } from '../../consts/routes';
import { TransactionListItem } from '../transactions/TransactionListItem';

type FilterType = 'ALL' | CategoryTypeEnum;

interface IRecentTransactionsListProps {
  transactions: ITransaction[];
  onDeleteTransaction?: (id: string) => void;
  onTransactionClick?: (tx: ITransaction) => void;
  loading?: boolean;
  deletingId?: string | null;
}

export const RecentTransactionsList: React.FC<IRecentTransactionsListProps> = ({
  transactions,
  onDeleteTransaction,
  onTransactionClick,
  loading,
  deletingId,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (filterType !== 'ALL' && tx.category?.type !== filterType) {
        return false;
      }
      if (!q) return true;
      const categoryName = tx.category?.name?.toLowerCase() ?? '';
      const note = tx.note?.toLowerCase() ?? '';
      return categoryName.includes(q) || note.includes(q);
    });
  }, [transactions, filterType, searchQuery]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      const date = dayjs(tx.transactionDate).format('YYYY-MM-DD');
      if (!acc[date]) acc[date] = [];
      acc[date].push(tx);
      return acc;
    }, {} as Record<string, ITransaction[]>);
  }, [filteredTransactions]);

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => dayjs(b).unix() - dayjs(a).unix()
  );

  const formatDateHeader = (dateStr: string) => {
    const date = dayjs(dateStr);
    const formattedDate = date.format('DD/MM/YYYY');
    const isVi = i18n.language.startsWith('vi');
    if (date.isSame(dayjs(), 'day')) return `${isVi ? 'HÔM NAY' : 'TODAY'} • ${formattedDate}`;
    if (date.isSame(dayjs().subtract(1, 'day'), 'day'))
      return `${isVi ? 'HÔM QUA' : 'YESTERDAY'} • ${formattedDate}`;
    return date.format('DD MMMM, YYYY').toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    })
      .format(Math.abs(amount))
      .replace('₫', 'đ');
  };

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: 'ALL', label: t('dashboard.filterAll') },
    { key: CategoryTypeEnum.EXPENSE, label: t('dashboard.filterExpense') },
    { key: CategoryTypeEnum.INCOME, label: t('dashboard.filterIncome') },
  ];

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#eef6ee] text-[#006c49] flex items-center justify-center">
            <ReceiptText className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-[#161d19] text-lg">{t('dashboard.recentTransactions')}</h3>
        </div>
        <Button
          type="text"
          onClick={() => navigate(AppRoutes.TRANSACTIONS)}
          className="!text-[#006c49] hover:!text-[#005236] !font-semibold !text-xs !flex !items-center !gap-1 !px-2"
        >
          <span>{t('dashboard.viewAll')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Filter Pills & Quick Search */}
      {!loading && transactions.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {filterTabs.map((tab) => {
              const active = filterType === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterType(tab.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#006c49] text-white shadow-sm'
                      : 'bg-[#eef6ee] text-[#3c4a42] hover:bg-[#e3eae3]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <Input
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<Search className="w-3.5 h-3.5 text-[#6c7a71]" />}
            placeholder={t('dashboard.searchPlaceholder')}
            className="sm:max-w-[220px] !rounded-full !bg-[#eef6ee] !border-transparent hover:!border-[#bbcabf] focus-within:!border-[#006c49]"
          />
        </div>
      )}

      {/* List Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-[#eef6ee] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-10 text-[#6c7a71] text-sm">
          {t('dashboard.noRecentTransactions')}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-10 text-[#6c7a71] text-sm">
          {t('dashboard.noMatchingTransactions')}
        </div>
      ) : (
        <div className="space-y-5">
          {sortedDates.map((date) => {
            const dayTxs = groupedTransactions[date];
            const daySum = dayTxs.reduce((sum, tx) => {
              const amount = tx.category?.type === CategoryTypeEnum.INCOME ? tx.amount : -tx.amount;
              return sum + amount;
            }, 0);
            const isNegative = daySum < 0;

            return (
              <div key={date} className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="text-[11px] font-bold text-[#6c7a71] uppercase tracking-wider">
                    {formatDateHeader(date)}
                  </div>
                  <div
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isNegative
                        ? 'bg-[#ffdad6]/70 text-[#ba1a1a]'
                        : 'bg-[#6ffbbe]/40 text-[#006c49]'
                    }`}
                  >
                    {isNegative ? '-' : '+'}
                    {formatCurrency(daySum)}
                  </div>
                </div>
                <div className="space-y-2.5">
                  {dayTxs.map((tx) => (
                    <TransactionListItem
                      key={tx.id}
                      transaction={tx}
                      onDelete={onDeleteTransaction}
                      isDeleting={deletingId === tx.id}
                      onClick={() => onTransactionClick?.(tx)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
