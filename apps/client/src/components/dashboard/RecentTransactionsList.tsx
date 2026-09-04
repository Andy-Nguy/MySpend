import React from 'react';
import { Button } from 'antd';
import { ArrowRight, ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { ITransaction, CategoryTypeEnum } from '@myspend/libs';
import { AppRoutes } from '../../consts/routes';
import { TransactionListItem } from '../transactions/TransactionListItem';

interface IRecentTransactionsListProps {
  transactions: ITransaction[];
  onDeleteTransaction?: (id: string) => void;
  loading?: boolean;
  deletingId?: string | null;
}

export const RecentTransactionsList: React.FC<IRecentTransactionsListProps> = ({
  transactions,
  onDeleteTransaction,
  loading,
  deletingId,
}) => {
  const navigate = useNavigate();

  const groupedTransactions = transactions.reduce((acc, tx) => {
    const date = dayjs(tx.transactionDate).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, ITransaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => dayjs(b).unix() - dayjs(a).unix()
  );

  const formatDateHeader = (dateStr: string) => {
    const date = dayjs(dateStr);
    const formattedDate = date.format('DD/MM/YYYY');
    if (date.isSame(dayjs(), 'day')) return `HÔM NAY • ${formattedDate}`;
    if (date.isSame(dayjs().subtract(1, 'day'), 'day')) return `HÔM QUA • ${formattedDate}`;
    return date.format('DD MMMM, YYYY').toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Math.abs(amount)).replace('₫', 'đ');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-gray-900 text-base">Giao dịch gần đây</h3>
        </div>
        <Button
          type="text"
          onClick={() => navigate(AppRoutes.TRANSACTIONS)}
          className="!text-emerald-700 hover:!text-emerald-800 !font-semibold !text-xs !flex !items-center !gap-1"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          Chưa có giao dịch nào gần đây. Hãy tạo giao dịch đầu tiên!
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const dayTxs = groupedTransactions[date];
            const daySum = dayTxs.reduce((sum, tx) => {
              const amount = tx.category?.type === CategoryTypeEnum.INCOME ? tx.amount : -tx.amount;
              return sum + amount;
            }, 0);
            const isNegative = daySum < 0;

            return (
              <div key={date} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {formatDateHeader(date)}
                  </div>
                  <div
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isNegative
                        ? 'bg-red-50 text-red-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
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
