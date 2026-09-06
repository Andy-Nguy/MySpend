import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import { Calendar, FileText, Wallet } from 'lucide-react';
import dayjs from 'dayjs';
import { ITransaction, CategoryTypeEnum } from '@myspend/libs';
import { CategoryIcon } from '../categories/CategoryIconPicker';

interface ITransactionsDialogProps {
  open: boolean;
  transaction: ITransaction | null;
  onClose: () => void;
}

export const TransactionsDialog: React.FC<ITransactionsDialogProps> = ({
  open,
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Math.abs(amount)).replace('₫', 'đ');
  };

  return (
    <Modal
      title="Chi tiết giao dịch"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      className="detail-modal"
    >
      <div className="space-y-6 py-2">
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${transaction.category?.type === CategoryTypeEnum.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            <CategoryIcon slug={transaction.category?.icon || 'utensils'} className="w-10 h-10" />
          </div>
        </div>

        <Descriptions column={1} bordered size="small" layout="vertical">
          <Descriptions.Item label="Số tiền">
            <span className={`text-lg font-bold ${transaction.category?.type === CategoryTypeEnum.INCOME ? 'text-emerald-600' : 'text-gray-900'}`}>
              {transaction.category?.type === CategoryTypeEnum.INCOME ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Danh mục">
            <div className="flex items-center gap-2">
              <Tag color={transaction.category?.type === CategoryTypeEnum.INCOME ? 'green' : 'default'}>
                {transaction.category?.name || 'Không xác định'}
              </Tag>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày giao dịch">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              {dayjs(transaction.transactionDate).format('DD/MM/YYYY')}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú">
            <div className="flex items-center gap-2 text-gray-600 italic">
              <FileText className="w-4 h-4" />
              {transaction.note || 'Không có ghi chú'}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian tạo">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Wallet className="w-3 h-3" />
              {dayjs(transaction.createdAt).format('DD/MM/YYYY HH:mm')}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
};
