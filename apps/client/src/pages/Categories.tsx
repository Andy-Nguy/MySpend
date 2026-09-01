import React, { useState } from 'react';
import { Button, Card, Popconfirm, Segmented, Tag, Tooltip } from 'antd';
import { Plus, Trash2, Edit2, Layers } from 'lucide-react';
import { CategoryTypeEnum, ICategory } from '@myspend/libs';
import { Header } from '../components/dashboard/Header';
import { CategoryIcon } from '../components/categories/CategoryIconPicker';
import { CategoryFormModal } from '../components/categories/CategoryForm';
import { QuickAddTransaction } from '../components/transactions/QuickAddTransaction';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../hooks/useCategories';

export const CategoriesPage: React.FC = () => {
  const { data: categories = [], isLoading } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [activeTab, setActiveTab] = useState<CategoryTypeEnum>(CategoryTypeEnum.EXPENSE);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: ICategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: { name: string; type?: CategoryTypeEnum; icon: string }) => {
    if (editingCategory) {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        data: { name: values.name, type: values.type, icon: values.icon },
      });
    } else {
      await createCategoryMutation.mutateAsync({
        name: values.name,
        type: values.type || activeTab,
        icon: values.icon,
      });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCategoryMutation.mutateAsync(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20 md:pb-16">
      <Header onOpenAddTransaction={() => setIsQuickAddOpen(true)} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Quản Lý Danh Mục</h1>
              <p className="text-xs text-gray-500">Tạo, cập nhật hoặc quản lý các danh mục thu chi cá nhân</p>
            </div>
          </div>

          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
            className="!bg-emerald-700 hover:!bg-emerald-800 !h-11 !px-5 !rounded-xl !font-semibold border-none shadow-md shadow-emerald-700/20"
          >
            Thêm Danh Mục
          </Button>
        </div>

        {/* Filter Segmented (Chi tiêu / Thu nhập) */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200/80 shadow-sm">
          <Segmented
            block
            size="large"
            value={activeTab}
            onChange={(val) => setActiveTab(val as CategoryTypeEnum)}
            options={[
              { label: 'Chi tiêu (Expense)', value: CategoryTypeEnum.EXPENSE },
              { label: 'Thu nhập (Income)', value: CategoryTypeEnum.INCOME },
            ]}
            className="!bg-gray-100"
          />
        </div>

        {/* Category List Grid */}
        <Card className="!rounded-2xl shadow-sm border border-gray-200/80">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Chưa có danh mục nào trong mục này. Vui lòng bấm &quot;Thêm Danh Mục&quot; để tạo!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all bg-white shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-gray-100 rounded-xl text-gray-700">
                      <CategoryIcon slug={cat.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{cat.name}</h4>
                        {cat.transactionCount ? (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
                            {cat.transactionCount} giao dịch
                          </span>
                        ) : null}
                      </div>
                      <Tag
                        color={cat.type === CategoryTypeEnum.INCOME ? 'green' : 'red'}
                        className="!rounded-md text-[10px] uppercase font-bold mt-0.5"
                      >
                        {cat.type}
                      </Tag>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="text"
                      icon={<Edit2 className="w-4 h-4 text-gray-500 hover:text-emerald-700" />}
                      onClick={() => handleOpenEdit(cat)}
                      className="!p-2 !rounded-lg"
                    />

                    {cat.hasTransactions ? (
                      <Tooltip title="Không thể xóa danh mục đã phát sinh giao dịch">
                        <span>
                          <Button
                            type="text"
                            disabled
                            icon={<Trash2 className="w-4 h-4 text-gray-300" />}
                            className="!p-2 !rounded-lg"
                          />
                        </span>
                      </Tooltip>
                    ) : (
                      <Popconfirm
                        title="Xóa danh mục này?"
                        description="Danh mục chưa có giao dịch sẽ được xóa khỏi hệ thống."
                        onConfirm={() => handleDelete(cat.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />}
                          className="!p-2 !rounded-lg"
                        />
                      </Popconfirm>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

      {/* Category Modal */}
      <CategoryFormModal
        visible={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingCategory={editingCategory}
        loading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
      />

      {/* Quick Add Transaction Drawer */}
      <QuickAddTransaction open={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav onOpenAddTransaction={() => setIsQuickAddOpen(true)} />
    </div>
  );
};

export default CategoriesPage;
