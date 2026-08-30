import React, { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import { DollarSign, Target } from 'lucide-react';

interface SetBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  currentBudget: number;
  onSaveBudget: (budget: number) => void;
}

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({
  visible,
  onClose,
  currentBudget,
  onSaveBudget,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ budget: currentBudget });
    }
  }, [visible, currentBudget, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSaveBudget(parseFloat(values.budget));
      onClose();
    } catch {
      // handled
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={420}
      destroyOnClose
    >
      <div className="p-2 sm:p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Set Monthly Budget</h3>
            <p className="text-xs text-gray-500">Configure your target spending limit</p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ budget: currentBudget }}
          requiredMark={false}
        >
          <Form.Item
            name="budget"
            label={<span className="text-xs font-bold text-gray-700 uppercase">Monthly Budget Target ($)</span>}
            rules={[
              { required: true, message: 'Please enter a budget amount' },
              {
                validator: (_, value) => {
                  if (!value || (!isNaN(value) && Number(value) >= 0)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Please enter a valid positive number'));
                },
              },
            ]}
            className="mb-6"
          >
            <Input
              prefix={<DollarSign className="w-4 h-4 text-gray-400" />}
              type="number"
              step="50"
              placeholder="2500"
              className="h-12 rounded-xl text-base font-semibold"
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all"
            >
              Save Budget
            </button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
