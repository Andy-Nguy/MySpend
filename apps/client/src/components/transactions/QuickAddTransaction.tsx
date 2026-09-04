import React, { useEffect } from 'react';
import { Button, DatePicker, Drawer, Form, Input, Radio, message } from 'antd';
import { CategoryTypeEnum } from '@myspend/libs';
import dayjs from 'dayjs';
import { useCategories } from '../../hooks/useCategories';
import { useCreateTransaction } from '../../hooks/useTransactions';
import { CategoryIcon } from '../categories/CategoryIconPicker';

interface IQuickAddTransactionProps {
  open: boolean;
  onClose: () => void;
  defaultType?: CategoryTypeEnum;
}

const FormattedNumberInput = ({ value, onChange }: { value?: number | null; onChange?: (val: number | null) => void }) => {
  const formattedValue = value ? value.toLocaleString('vi-VN') : '';

  return (
    <div className="relative flex items-center">
      <Input
        inputMode="decimal"
        className="w-full !rounded-xl !text-xl pr-10"
        size="large"
        placeholder="0"
        value={formattedValue}
        onChange={(e) => {
          const rawValue = e.target.value.replace(/\D/g, '');
          if (onChange) {
            onChange(rawValue ? parseInt(rawValue, 10) : null);
          }
        }}
      />
      <span className="absolute right-3 text-gray-500 font-medium">₫</span>
    </div>
  );
};

export const QuickAddTransaction: React.FC<IQuickAddTransactionProps> = ({
  open,
  onClose,
  defaultType = CategoryTypeEnum.EXPENSE,
}) => {
  const [form] = Form.useForm();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const createTxMutation = useCreateTransaction();

  const selectedType = Form.useWatch('type', form) || defaultType;

  const filteredCategories = categories.filter((cat) => cat.type === selectedType);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        type: defaultType,
        transactionDate: dayjs(),
        amount: null,
      });

      // Auto-select first matching category
      const firstCat = categories.find((c) => c.type === defaultType);
      if (firstCat) {
        form.setFieldsValue({ categoryId: firstCat.id });
      }
    }
  }, [open, defaultType, categories, form]);

  const handleTypeChange = (type: CategoryTypeEnum) => {
    const firstCat = categories.find((c) => c.type === type);
    form.setFieldsValue({
      type,
      categoryId: firstCat?.id || null,
    });
  };

  const handleSubmit = async (values: {
    categoryId: string;
    amount: number;
    transactionDate: dayjs.Dayjs;
    note?: string;
  }) => {
    if (!values.categoryId) {
      message.error('Vui lòng chọn danh mục');
      return;
    }

    await createTxMutation.mutateAsync({
      categoryId: values.categoryId,
      amount: values.amount,
      transactionDate: values.transactionDate.format('YYYY-MM-DD'),
      note: values.note?.trim() || undefined,
    });

    onClose();
  };

  return (
    <Drawer
      title="Thêm Giao Dịch Mới"
      placement="bottom"
      height="90vh"
      onClose={onClose}
      open={open}
      className="!rounded-t-3xl"
      // Fix: force the drawer mask + wrapper to cover exactly the viewport width
      // This prevents the horizontal shift that occurs when the iOS keyboard appears
      rootStyle={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden',
      }}
      styles={{
        wrapper: {
          left: 0,
          right: 0,
          maxWidth: '100vw',
        },
        body: {
          overflowX: 'hidden',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="max-w-xl mx-auto pb-4 space-y-4"
      >
        {/* Type Toggle */}
        <Form.Item name="type" className="!mb-2">
          <Radio.Group
            buttonStyle="solid"
            size="large"
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full grid grid-cols-2 gap-2"
          >
            <Radio.Button value={CategoryTypeEnum.EXPENSE} className="!text-center !rounded-xl">
              Chi tiêu (Expense)
            </Radio.Button>
            <Radio.Button value={CategoryTypeEnum.INCOME} className="!text-center !rounded-xl">
              Thu nhập (Income)
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Amount Input */}
        <Form.Item
          name="amount"
          label={<span className="font-semibold text-gray-700">Số tiền (VND)</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập số tiền' },
            { type: 'number', min: 1, message: 'Số tiền phải lớn hơn 0' },
          ]}
        >
          <FormattedNumberInput />
        </Form.Item>

        {/* Category Icon Grid Selection */}
        <Form.Item
          name="categoryId"
          label={<span className="font-semibold text-gray-700">Danh mục</span>}
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        >
          {isLoadingCategories ? (
            <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ) : filteredCategories.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">
              Chưa có danh mục nào thuộc loại này. Hãy tạo danh mục trước!
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
              {filteredCategories.map((cat) => (
                <Form.Item key={cat.id} noStyle shouldUpdate>
                  {({ getFieldValue, setFieldsValue }) => {
                    const selected = getFieldValue('categoryId') === cat.id;
                    return (
                      <button
                        type="button"
                        onClick={() => setFieldsValue({ categoryId: cat.id })}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          selected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold shadow-sm scale-105'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                        }`}
                      >
                        <CategoryIcon slug={cat.icon} className="w-6 h-6 mb-1.5" />
                        <span className="text-xs truncate max-w-full text-center">{cat.name}</span>
                      </button>
                    );
                  }}
                </Form.Item>
              ))}
            </div>
          )}
        </Form.Item>

        {/* Date Field */}
        <Form.Item
          name="transactionDate"
          label={<span className="font-semibold text-gray-700">Ngày giao dịch</span>}
          rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
        >
          <DatePicker
            className="w-full !rounded-xl"
            size="large"
            format="DD/MM/YYYY"
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </Form.Item>

        {/* Note Field */}
        <Form.Item
          name="note"
          label={<span className="font-semibold text-gray-700">Ghi chú</span>}
        >
          <Input placeholder="Ví dụ: Ăn trưa cùng đồng nghiệp..." size="large" className="!rounded-xl" maxLength={200} />
        </Form.Item>

        {/* Action Button */}
        <Button
          type="primary"
          htmlType="submit"
          loading={createTxMutation.isPending}
          disabled={createTxMutation.isPending}
          className="!w-full !h-12 !bg-emerald-700 hover:!bg-emerald-800 active:!bg-emerald-900 !text-white !font-semibold !rounded-xl !border-none transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 mt-2"
        >
          Lưu Giao Dịch
        </Button>
      </Form>
    </Drawer>
  );
};

