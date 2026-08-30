import React from 'react';
import { Modal } from 'antd';
import { Layers } from 'lucide-react';
import { ICategory } from '../../types/transaction.types';
import { CategoryIcon } from '../common/CategoryIcon';

interface CategoriesModalProps {
  visible: boolean;
  onClose: () => void;
  categories: ICategory[];
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  visible,
  onClose,
  categories,
}) => {
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      destroyOnClose
    >
      <div className="p-2 sm:p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Spending Categories</h3>
            <p className="text-xs text-gray-500">
              Active categories configured for your account
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/80 border border-gray-200/70"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${cat.color}15`,
                  color: cat.color,
                }}
              >
                <CategoryIcon iconName={cat.icon} className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">
                  {cat.name}
                </div>
                <div className="text-[11px] text-gray-400 capitalize">
                  {cat.type} {cat.budgetLimit ? `• $${cat.budgetLimit}/mo` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
