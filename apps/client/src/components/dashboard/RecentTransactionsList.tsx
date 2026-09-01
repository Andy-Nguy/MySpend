import React from 'react';
import { Button } from 'antd';
import { ArrowRight, ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ITransaction } from '@myspend/libs';
import { AppRoutes } from '../../consts/routes';
import { TransactionListItem } from '../transactions/TransactionListItem';

interface IRecentTransactionsListProps {
  transactions: ITransaction[];
  onDeleteTransaction?: (id: string) => void;
  loading?: boolean;
}

export const RecentTransactionsList: React.FC<IRecentTransactionsListProps> = ({
  transactions,
  onDeleteTransaction,
  loading,
}) => {
  const navigate = useNavigate();

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
        <div className="space-y-2.5">
          {transactions.map((tx) => (
            <TransactionListItem
              key={tx.id}
              transaction={tx}
              onDelete={onDeleteTransaction}
            />
          ))}
        </div>
      )}
    </div>
  );
};
