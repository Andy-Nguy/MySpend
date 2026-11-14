import React, { useMemo, useState } from 'react';
import { DatePicker } from 'antd';
import { Calendar, History, Layers, PieChart, Plus } from 'lucide-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppRoutes } from '../consts/routes';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/dashboard/Header';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { CategoryBreakdownCard } from '../components/dashboard/CategoryBreakdownCard';
import { RecentTransactionsList } from '../components/dashboard/RecentTransactionsList';
import { QuickAddTransaction } from '../components/transactions/QuickAddTransaction';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useDashboard } from '../hooks/useDashboard';
import { useCategoryBreakdown, useReportStats } from '../hooks/useReports';
import { useDeleteTransaction } from '../hooks/useTransactions';
import { ITransaction } from '@myspend/libs';
import { TransactionsDialog } from '../components/transactions/TransactionsDialog';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);

  const year = selectedDate.year();
  const month = selectedDate.month() + 1; // 1-indexed for backend API

  const fromDate = useMemo(
    () => selectedDate.startOf('month').format('YYYY-MM-DD'),
    [selectedDate]
  );
  const toDate = useMemo(
    () => selectedDate.endOf('month').format('YYYY-MM-DD'),
    [selectedDate]
  );

  const { data: summary, isLoading } = useDashboard(year, month);
  const { data: categoryBreakdown = [], isLoading: isBreakdownLoading } = useCategoryBreakdown(
    fromDate,
    toDate
  );
  const { data: reportStats } = useReportStats(fromDate, toDate);
  const deleteTxMutation = useDeleteTransaction();

  const handleDeleteTx = async (id: string) => {
    await deleteTxMutation.mutateAsync(id);
  };

  const displayName =
    user?.displayName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) ||
    user?.email?.split('@')[0] ||
    '';

  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return t('dashboard.greetingMorning');
    if (hour < 18) return t('dashboard.greetingAfternoon');
    return t('dashboard.greetingEvening');
  };

  return (
    <div className="min-h-screen bg-[#f4fbf4] text-[#161d19] pb-24 lg:pb-16 overflow-x-hidden">
      {/* Header */}
      <Header onOpenAddTransaction={() => setIsQuickAddOpen(true)} />

      {/* Main Container */}
      <main className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Top Greeting & Month Picker Strip */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight text-[#161d19] leading-tight">
              {displayName ? `${getGreeting()}, ${displayName} 👋` : t('dashboard.title')}
            </h1>
            <p className="text-sm text-[#3c4a42]">{t('dashboard.subtitle')}</p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] min-w-0 flex-shrink">
              <Calendar className="w-4 h-4 text-[#006c49] flex-shrink-0" />
              <DatePicker
                picker="month"
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                allowClear={false}
                format={t('dashboard.monthFormat')}
                className="!border-none !bg-transparent !p-0 !shadow-none font-semibold text-[#161d19] text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 h-10 px-4 rounded-2xl bg-[#10b981] hover:bg-[#006c49] text-[#00422b] hover:text-white font-semibold text-sm shadow-[0_4px_16px_rgba(16,185,129,0.22)] transition-all flex-shrink-0 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('dashboard.quickRecord')}</span>
            </button>
          </div>
        </section>

        {/* Main Content Area */}
        {isLoading && !summary ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <LoadingSpinner size="lg" tip={t('dashboard.loadingData')} />
          </div>
        ) : (
          <>
            {/* KPI Summary Cards (Desktop Bento Grid / Mobile Obsidian Hero + Quick Actions) */}
            <SummaryCards
              income={summary?.income}
              expense={summary?.expense}
              netSavings={summary?.netSavings}
              totalBalance={summary?.totalBalance}
              balance={summary?.balance}
              budgetLimit={reportStats?.budgetLimit}
              remainingBudget={reportStats?.remainingBudget}
              loading={isLoading || !summary}
              onOpenAddTransaction={() => setIsQuickAddOpen(true)}
            />

            {/* Main Mosaic Grid: 8 Cols Left (Transactions), 4 Cols Right (Category Breakdown & Shortcuts) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Recent Transactions */}
              <div className="lg:col-span-8 space-y-6">
                <RecentTransactionsList
                  transactions={(summary?.recentTransactions ?? []).slice(0, 7)}
                  onDeleteTransaction={handleDeleteTx}
                  onTransactionClick={(tx) => setSelectedTransaction(tx)}
                  loading={isLoading || !summary}
                  deletingId={deleteTxMutation.isPending ? deleteTxMutation.variables : null}
                />
              </div>

              {/* Right Column: Category Breakdown + Quick Navigation Shortcuts */}
              <div className="lg:col-span-4 space-y-6">
                <CategoryBreakdownCard
                  items={categoryBreakdown}
                  totalExpense={summary?.expense ?? 0}
                  budgetLimit={reportStats?.budgetLimit}
                  loading={isBreakdownLoading}
                />

                {/* Desktop Quick Navigation Shortcuts */}
                <div className="hidden md:block bg-white rounded-[28px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                  <h3 className="font-bold text-[#161d19] text-base">
                    {t('dashboard.quickActions')}
                  </h3>

                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => navigate(AppRoutes.CATEGORIES)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#eef6ee] hover:bg-[#e3eae3] transition-all text-left group"
                    >
                      <div className="p-2 bg-white text-[#006c49] rounded-xl shadow-sm">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#161d19] truncate">
                          {t('dashboard.categoryManage')}
                        </p>
                        <p className="text-[11px] text-[#6c7a71] truncate">
                          {t('dashboard.categoryManageSub')}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(AppRoutes.TRANSACTIONS)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#eef6ee] hover:bg-[#e3eae3] transition-all text-left group"
                    >
                      <div className="p-2 bg-white text-[#4b41e1] rounded-xl shadow-sm">
                        <History className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#161d19] truncate">
                          {t('dashboard.historyManage')}
                        </p>
                        <p className="text-[11px] text-[#6c7a71] truncate">
                          {t('dashboard.historyManageSub')}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(AppRoutes.REPORTS)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#eef6ee] hover:bg-[#e3eae3] transition-all text-left group"
                    >
                      <div className="p-2 bg-white text-[#006c49] rounded-xl shadow-sm">
                        <PieChart className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#161d19] truncate">
                          {t('dashboard.reportsManage')}
                        </p>
                        <p className="text-[11px] text-[#6c7a71] truncate">
                          {t('dashboard.reportsManageSub')}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Quick Add Transaction Drawer */}
      <QuickAddTransaction open={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav onOpenAddTransaction={() => setIsQuickAddOpen(true)} />

      {/* Transaction Detail Dialog */}
      <TransactionsDialog
        open={!!selectedTransaction}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};

export default Dashboard;
