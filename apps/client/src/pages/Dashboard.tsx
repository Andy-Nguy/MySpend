import React, { useState } from 'react';
import { Button, DatePicker } from 'antd';
import { Calendar, Plus, Wallet, Layers, History, PieChart } from 'lucide-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../consts/routes';
import { Header } from '../components/dashboard/Header';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { RecentTransactionsList } from '../components/dashboard/RecentTransactionsList';
import { QuickAddTransaction } from '../components/transactions/QuickAddTransaction';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';
import { useDashboard } from '../hooks/useDashboard';
import { useDeleteTransaction } from '../hooks/useTransactions';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const year = selectedDate.year();
  const month = selectedDate.month() + 1; // 1-indexed for backend API

  const { data: summary, isLoading } = useDashboard(year, month);
  const deleteTxMutation = useDeleteTransaction();

  const handleDeleteTx = async (id: string) => {
    await deleteTxMutation.mutateAsync(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-24 md:pb-16 overflow-x-hidden">
      {/* Header */}
      <Header onOpenAddTransaction={() => setIsQuickAddOpen(true)} />

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Welcome & Month Picker Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tổng quan Tài chính</h1>
            <p className="text-xs text-gray-500">
              Theo dõi tình hình thu chi hàng tháng của bạn
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 min-w-0 flex-shrink">
              <Calendar className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <DatePicker
                picker="month"
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                allowClear={false}
                format="[Tháng] MM, YYYY"
                className="!border-none !bg-transparent !p-0 font-semibold text-gray-700 text-sm"
              />
            </div>

            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsQuickAddOpen(true)}
              className="!bg-emerald-700 hover:!bg-emerald-800 !h-10 !px-4 !rounded-xl !font-semibold border-none shadow-md shadow-emerald-700/20 flex-shrink-0 whitespace-nowrap"
            >
              Thêm Giao Dịch
            </Button>
          </div>
        </div>

        {/* Income / Expense / Balance Summary Cards */}
        <SummaryCards
          income={summary?.income ?? 0}
          expense={summary?.expense ?? 0}
          balance={summary?.balance ?? 0}
          loading={isLoading}
        />

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Recent Transactions */}
          <div className="lg:col-span-8 space-y-6">
            <RecentTransactionsList
              transactions={summary?.recentTransactions ?? []}
              onDeleteTransaction={handleDeleteTx}
              loading={isLoading}
            />
          </div>

          {/* Right Column: Quick Navigation Shortcuts */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-base">Lối Tắt Nhanh</h3>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate(AppRoutes.CATEGORIES)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-100">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">Quản lý Danh mục</p>
                      <p className="text-[11px] text-gray-400">Xem và sửa danh mục thu chi</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(AppRoutes.TRANSACTIONS)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-700 rounded-lg group-hover:bg-blue-100">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">Lịch sử Giao dịch</p>
                      <p className="text-[11px] text-gray-400">Tra cứu và lọc giao dịch</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(AppRoutes.REPORTS)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-700 rounded-lg group-hover:bg-purple-100">
                      <PieChart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">Báo cáo Chi tiêu</p>
                      <p className="text-[11px] text-gray-400">Biểu đồ cơ cấu chi tiêu</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quick Add Transaction Drawer */}
      <QuickAddTransaction open={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav onOpenAddTransaction={() => setIsQuickAddOpen(true)} />
    </div>
  );
};

export default Dashboard;
