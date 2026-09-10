import React, { useState } from 'react';
import { DatePicker, Segmented, Select } from 'antd';
import { PieChart as PieIcon, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import { Header } from '../components/dashboard/Header';
import { CategoryDonutChart } from '../components/reports/CategoryDonutChart';
import { ReportSummaryMetrics } from '../components/reports/ReportSummaryMetrics';
import { ReportInsights } from '../components/reports/ReportInsights';
import { QuickAddTransaction } from '../components/transactions/QuickAddTransaction';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useCategoryBreakdown, useReportStats } from '../hooks/useReports';
import { useCategories } from '../hooks/useCategories';

const { RangePicker } = DatePicker;

export const ReportsPage: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [customRange, setCustomRange] = useState<[string, string]>([
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD'),
  ]);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const { data: categories } = useCategories();

  const fromDate =
    filterMode === 'today'
      ? dayjs().startOf('day').format('YYYY-MM-DD')
      : filterMode === 'week'
      ? dayjs().startOf('week').format('YYYY-MM-DD')
      : filterMode === 'month'
      ? dayjs().startOf('month').format('YYYY-MM-DD')
      : customRange[0];
  const toDate =
    filterMode === 'today'
      ? dayjs().endOf('day').format('YYYY-MM-DD')
      : filterMode === 'week'
      ? dayjs().endOf('week').format('YYYY-MM-DD')
      : filterMode === 'month'
      ? dayjs().endOf('month').format('YYYY-MM-DD')
      : customRange[1];

  const { data: breakdownItems, isLoading: isBreakdownLoading, isFetching: isBreakdownFetching } = useCategoryBreakdown(fromDate, toDate, selectedCategory);
  const { data: stats, isLoading: isStatsLoading } = useReportStats(fromDate, toDate, selectedCategory);

  const handleRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setCustomRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
    }
  };

  const isLoading = isBreakdownLoading || isStatsLoading;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-24 md:pb-16 overflow-x-hidden">
      <Header onOpenAddTransaction={() => setIsQuickAddOpen(true)} />

      <main className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 space-y-6">
        {/* Title Bar */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <PieIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Báo Cáo Chi Tiêu</h1>
            <p className="text-xs text-gray-500">Phân tích tỷ trọng chi tiêu theo từng danh mục</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Segmented
              value={filterMode}
              onChange={(val) => setFilterMode(val as 'today' | 'week' | 'month' | 'custom')}
              options={[
                { label: 'Hôm nay', value: 'today' },
                { label: 'Tuần này', value: 'week' },
                { label: 'Tháng này', value: 'month' },
                { label: 'Tùy chọn', value: 'custom' },
              ]}
              className="!bg-gray-100 w-full sm:w-auto"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                placeholder="Tất cả danh mục"
                className="w-full sm:w-48"
                allowClear
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categories?.map((cat: any) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
              />
            </div>
          </div>

          {filterMode === 'custom' && (
            <div className="flex items-center justify-center sm:justify-end gap-2 pt-2 border-t border-gray-100">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <RangePicker
                size="large"
                className="!rounded-xl"
                format="DD/MM/YYYY"
                defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]}
                onChange={handleRangeChange}
              />
            </div>
          )}
        </div>

        {isLoading && !breakdownItems ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <LoadingSpinner size="lg" tip="Đang phân tích dữ liệu..." />
          </div>
        ) : (
          <>
            {/* Summary Metrics */}
            {stats && <ReportSummaryMetrics stats={stats} />}

            {/* Smart Insights */}
            {stats && breakdownItems && <ReportInsights stats={stats} breakdown={breakdownItems} />}

            {/* Chart & List */}
            <CategoryDonutChart
              items={breakdownItems || []}
              loading={isBreakdownFetching}
            />
          </>
        )}
      </main>

      {/* Quick Add Transaction Drawer */}
      <QuickAddTransaction open={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav onOpenAddTransaction={() => setIsQuickAddOpen(true)} />
    </div>
  );
};

export default ReportsPage;
