import React, { useState } from 'react';
import { DatePicker, Segmented } from 'antd';
import { PieChart as PieIcon, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import { Header } from '../components/dashboard/Header';
import { CategoryDonutChart } from '../components/reports/CategoryDonutChart';
import { QuickAddTransaction } from '../components/transactions/QuickAddTransaction';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';
import { useCategoryBreakdown } from '../hooks/useReports';

const { RangePicker } = DatePicker;

export const ReportsPage: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'month' | 'custom'>('month');
  const [customRange, setCustomRange] = useState<[string, string]>([
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD'),
  ]);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const fromDate =
    filterMode === 'month'
      ? dayjs().startOf('month').format('YYYY-MM-DD')
      : customRange[0];
  const toDate =
    filterMode === 'month'
      ? dayjs().endOf('month').format('YYYY-MM-DD')
      : customRange[1];

  const { data: breakdownItems, isLoading, isFetching } = useCategoryBreakdown(fromDate, toDate);

  const handleRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setCustomRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
    }
  };

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
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <Segmented
            value={filterMode}
            onChange={(val) => setFilterMode(val as 'month' | 'custom')}
            options={[
              { label: 'Tháng này', value: 'month' },
              { label: 'Tùy chọn ngày', value: 'custom' },
            ]}
            className="!bg-gray-100"
          />

          {filterMode === 'custom' && (
            <div className="flex items-center gap-2">
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

        {/* Donut Chart & Ranked List */}
        <CategoryDonutChart
          items={breakdownItems || []}
          loading={isLoading || isFetching || !breakdownItems}
        />
      </main>

      {/* Quick Add Transaction Drawer */}
      <QuickAddTransaction open={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav onOpenAddTransaction={() => setIsQuickAddOpen(true)} />
    </div>
  );
};

export default ReportsPage;
