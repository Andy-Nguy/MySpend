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
    <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm transition-all">
      <div className="flex items-center gap-3.5">
        <div
          className={`p-2.5 rounded-xl ${
            isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}
        >
          <CategoryIcon slug={transaction.category?.icon || 'utensils'} className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">
            {transaction.category?.name || 'Giao dịch'}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{dayjs(transaction.transactionDate).format('DD/MM/YYYY')}</span>
            {transaction.note && (
              <>
                <span>•</span>
                <span className="truncate max-w-[150px] sm:max-w-[240px] italic">{transaction.note}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`font-bold text-sm sm:text-base ${
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
              className="!p-1.5 !h-auto !rounded-lg"
            />
          </Popconfirm>
        )}
      </div>
    </div>
  );
};
