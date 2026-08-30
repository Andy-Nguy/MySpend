import React, { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  DollarSign,
  FileText,
  Layers,
  Tag,
} from 'lucide-react';
import { ICategory, ITransaction, TransactionType } from '../../types/transaction.types';
import { CategoryIcon } from '../common/CategoryIcon';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTransaction: (
    transaction: Omit<ITransaction, 'id' | 'createdAt'>
  ) => void;
  categories: ICategory[];
  defaultType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  onAddTransaction,
  categories,
  defaultType = 'expense',
}) => {
  const [form] = Form.useForm();
  const currentType = Form.useWatch('type', form) || defaultType;

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        type: defaultType,
        date: new Date().toISOString().split('T')[0],
      });
    } else {
      form.resetFields();
    }
  }, [visible, defaultType, form]);

  const filteredCategories = categories.filter(
    (c) => c.type === (currentType || 'expense')
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const selectedCategory = categories.find((c) => c.id === values.categoryId);

      onAddTransaction({
        title: values.title.trim(),
        amount: parseFloat(values.amount),
        type: values.type,
        categoryId: values.categoryId,
        categoryName: selectedCategory?.name || 'Uncategorized',
        categoryIcon: selectedCategory?.icon || 'Wallet',
        categoryColor: selectedCategory?.color || '#059669',
        date: values.date,
        notes: values.notes?.trim() || undefined,
      });

      form.resetFields();
      onClose();
    } catch {
      // validation error handled by Form
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      destroyOnClose
      className="custom-modal"
    >
      <div className="p-2 sm:p-4">
        <div className="mb-5">
          <h3 className="text-xl font-bold text-gray-900">
            {currentType === 'expense' ? 'Record New Expense' : 'Add New Income'}
          </h3>
          <p className="text-xs text-gray-500">
            Enter the details below to update your financial balance
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: defaultType,
            date: new Date().toISOString().split('T')[0],
          }}
          requiredMark={false}
        >
          {/* Type Toggle Tabs */}
          <Form.Item name="type" className="mb-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100/80 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  form.setFieldsValue({ type: 'expense', categoryId: undefined });
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  currentType === 'expense'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  form.setFieldsValue({ type: 'income', categoryId: undefined });
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  currentType === 'income'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Income</span>
              </button>
            </div>
          </Form.Item>

          {/* Amount Field */}
          <Form.Item
            name="amount"
            label={<span className="text-xs font-bold text-gray-700 uppercase">Amount ($)</span>}
            rules={[
              { required: true, message: 'Please enter transaction amount' },
              {
                validator: (_, value) => {
                  if (!value || (!isNaN(value) && Number(value) > 0)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Amount must be greater than 0'));
                },
              },
            ]}
            className="mb-4"
          >
            <Input
              prefix={<DollarSign className="w-4 h-4 text-gray-400" />}
              placeholder="0.00"
              type="number"
              step="0.01"
              className="h-11 rounded-xl text-base font-semibold"
            />
          </Form.Item>

          {/* Title / Description */}
          <Form.Item
            name="title"
            label={<span className="text-xs font-bold text-gray-700 uppercase">Title / Merchant</span>}
            rules={[{ required: true, message: 'Please enter a title or merchant' }]}
            className="mb-4"
          >
            <Input
              prefix={<Tag className="w-4 h-4 text-gray-400" />}
              placeholder="e.g. Grocery Store, Coffee, Salary"
              className="h-11 rounded-xl text-sm"
            />
          </Form.Item>

          {/* Category Select */}
          <Form.Item
            name="categoryId"
            label={<span className="text-xs font-bold text-gray-700 uppercase">Category</span>}
            rules={[{ required: true, message: 'Please select a category' }]}
            className="mb-4"
          >
            <Select
              placeholder="Select category"
              className="w-full h-11"
              options={filteredCategories.map((cat) => ({
                value: cat.id,
                label: (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </div>
                ),
              }))}
            />
          </Form.Item>

          {/* Date Picker */}
          <Form.Item
            name="date"
            label={<span className="text-xs font-bold text-gray-700 uppercase">Date</span>}
            rules={[{ required: true, message: 'Please select a date' }]}
            className="mb-4"
          >
            <Input
              type="date"
              prefix={<Calendar className="w-4 h-4 text-gray-400" />}
              className="h-11 rounded-xl text-sm"
            />
          </Form.Item>

          {/* Notes (Optional) */}
          <Form.Item
            name="notes"
            label={<span className="text-xs font-bold text-gray-700 uppercase">Notes (Optional)</span>}
            className="mb-6"
          >
            <Input
              prefix={<FileText className="w-4 h-4 text-gray-400" />}
              placeholder="Additional details or reference"
              className="h-11 rounded-xl text-sm"
            />
          </Form.Item>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all"
            >
              Save Transaction
            </button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
