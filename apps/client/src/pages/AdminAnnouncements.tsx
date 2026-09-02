import React, { useState } from 'react';
import { Button } from 'antd';
import { Plus, Megaphone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IAnnouncement, ICreateAnnouncementDto, IUpdateAnnouncementDto } from '@myspend/libs';
import { AppRoutes } from '../consts/routes';
import { Header } from '../components/dashboard/Header';
import { QuickAddTransaction } from '../components/transactions/QuickAddTransaction';
import { AdminAnnouncementTable } from '../components/announcements/AdminAnnouncementTable';
import { AdminAnnouncementDialog } from '../components/announcements/AdminAnnouncementDialog';
import {
  useAdminAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useToggleAnnouncementActive,
  useUpdateAnnouncement,
} from '../hooks/useAdminAnnouncements';

export const AdminAnnouncementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IAnnouncement | null>(null);

  const { data: announcements = [], isLoading } = useAdminAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const toggleActiveMutation = useToggleAnnouncementActive();

  const handleOpenCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: IAnnouncement) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: ICreateAnnouncementDto | IUpdateAnnouncementDto) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data: values });
    } else {
      await createMutation.mutateAsync(values as ICreateAnnouncementDto);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleToggleActive = async (id: string) => {
    await toggleActiveMutation.mutateAsync(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-24 md:pb-16 overflow-x-hidden">
      {/* Header */}
      <Header onOpenAddTransaction={() => setIsQuickAddOpen(true)} />

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button
            type="button"
            onClick={() => navigate(AppRoutes.HOME)}
            className="hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </button>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Quản lý thông báo</span>
        </div>

        {/* Page Title & Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Quản lý Thông báo Cập nhật</h1>
              <p className="text-xs text-gray-500">
                Tạo và quản lý các thông báo phiên bản mới (What's New) gửi đến người dùng
              </p>
            </div>
          </div>

          <Button
            type="primary"
            onClick={handleOpenCreate}
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            className="!bg-emerald-700 hover:!bg-emerald-800 !h-10 font-semibold shadow-md shadow-emerald-700/25 inline-flex items-center"
          >
            Tạo thông báo mới
          </Button>
        </div>

        {/* Announcements Table */}
        <AdminAnnouncementTable
          data={announcements}
          loading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      </main>

      {/* Create / Edit Dialog */}
      <AdminAnnouncementDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingItem}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Quick Add Transaction Modal */}
      <QuickAddTransaction
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
};
