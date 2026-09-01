import React, { useEffect } from 'react';
import { Form, Input, Modal, Radio } from 'antd';
import { CategoryTypeEnum, ICategory } from '@myspend/libs';
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from './CategoryIconPicker';

interface ICategoryFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; type?: CategoryTypeEnum; icon: string }) => Promise<void>;
  editingCategory?: ICategory | null;
  loading?: boolean;
}

export const CategoryFormModal: React.FC<ICategoryFormProps> = ({
  visible,
  onClose,
  onSubmit,
  editingCategory,
  loading,
}) => {
  const [form] = Form.useForm();
  const isEdit = Boolean(editingCategory);
  const isTypeDisabled = isEdit && Boolean(editingCategory?.hasTransactions);

  useEffect(() => {
    if (visible) {
      if (editingCategory) {
        form.setFieldsValue({
          name: editingCategory.name,
          type: editingCategory.type,
          icon: editingCategory.icon,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          type: CategoryTypeEnum.EXPENSE,
          icon: 'utensils',
        });
      }
    }
  }, [visible, editingCategory, form]);

  const handleFinish = async (values: { name: string; type: CategoryTypeEnum; icon: string }) => {
    await onSubmit(values);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={visible}
      title={isEdit ? 'Chỉnh sửa Danh mục' : 'Tạo Danh mục Mới'}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={isEdit ? 'Cập nhật' : 'Tạo mới'}
      cancelText="Hủy"
      destroyOnClose
      centered
      className="!rounded-2xl"
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false} className="pt-2">
        <Form.Item
          name="name"
          label={<span className="font-semibold text-gray-700">Tên danh mục</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập tên danh mục' },
            { max: 100, message: 'Tên tối đa 100 ký tự' },
          ]}
        >
          <Input placeholder="Ví dụ: Ăn uống, Giải trí..." size="large" className="!rounded-xl" />
        </Form.Item>

        <Form.Item
          name="type"
          label={<span className="font-semibold text-gray-700">Loại danh mục</span>}
          rules={[{ required: true }]}
        >
          <Radio.Group
            disabled={isTypeDisabled}
            buttonStyle="solid"
            size="large"
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
        {isTypeDisabled && (
          <p className="text-xs text-amber-600 mb-4 -mt-2">
            * Không thể đổi loại vì danh mục này đã phát sinh giao dịch.
          </p>
        )}

        <Form.Item
          name="icon"
          label={<span className="font-semibold text-gray-700">Chọn biểu tượng</span>}
          rules={[{ required: true, message: 'Vui lòng chọn biểu tượng' }]}
        >
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
            {CATEGORY_ICON_OPTIONS.map((opt) => (
              <Form.Item key={opt.slug} noStyle shouldUpdate>
                {({ getFieldValue, setFieldsValue }) => {
                  const selected = getFieldValue('icon') === opt.slug;
                  return (
                    <button
                      type="button"
                      onClick={() => setFieldsValue({ icon: opt.slug })}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                        selected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold shadow-sm scale-105'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                      }`}
                    >
                      <CategoryIcon slug={opt.slug} className="w-6 h-6 mb-1" />
                      <span className="text-[10px] truncate max-w-full text-center">{opt.label}</span>
                    </button>
                  );
                }}
              </Form.Item>
            ))}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
