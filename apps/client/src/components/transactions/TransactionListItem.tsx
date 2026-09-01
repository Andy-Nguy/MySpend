import React from 'react';
import { Button, Popconfirm } from 'antd';
import { Trash2 } from 'lucide-react';
import { CategoryTypeEnum, ITransaction } from '@myspend/libs';
import dayjs from 'dayjs';
import { CategoryIcon } from '../categories/CategoryIconPicker';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

interface ITransactionListItemProps {
  transaction: ITransaction;
  onDelete?: (id: string) => void;
}

export const TransactionListItem: React.FC<ITransactionListItemProps> = ({
  transaction,
  onDelete,
}) => {
  const isIncome = transaction.category?.type === CategoryTypeEnum.INCOME;

  return (
    <div className="flex items-center justify-between gap-2 p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm transition-all">
      {/* Left: icon + name/date — can shrink */}
      <div className="flex items-center gap-3 min-w-0 overflow-hidden flex-1">
        <div
          className={`p-2.5 rounded-xl flex-shrink-0 ${
            isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}
        >
          <CategoryIcon slug={transaction.category?.icon || 'utensils'} className="w-5 h-5" />
        </div>
        <div className="min-w-0 overflow-hidden">
          <h4 className="font-semibold text-gray-900 text-sm truncate">
            {transaction.category?.name || 'Giao dịch'}
          </h4>
          <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0 overflow-hidden">
            <span className="flex-shrink-0">{dayjs(transaction.transactionDate).format('DD/MM/YYYY')}</span>
            {transaction.note && (
              <>
                <span className="flex-shrink-0">•</span>
                <span className="truncate italic">{transaction.note}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: amount + delete — never shrink */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span
          className={`font-bold text-sm whitespace-nowrap ${
            isIncome ? 'text-emerald-600' : 'text-gray-900'
          }`}
        >
          {isIncome ? '+' : '-'}{formatVND(transaction.amount)}
        </span>

        {onDelete && (
          <Popconfirm
            title="Xóa giao dịch này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => onDelete(transaction.id)}
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />}
              className="!p-1.5 !h-auto !rounded-lg flex-shrink-0"
            />
          </Popconfirm>
        )}
      </div>
    </div>
  );
};
