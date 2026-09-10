import React from 'react';
import { IReportStats } from '@myspend/libs';
import { TrendingUp, TrendingDown, Wallet, CalendarDays, PiggyBank } from 'lucide-react';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

interface ReportSummaryMetricsProps {
  stats: IReportStats;
}

export const ReportSummaryMetrics: React.FC<ReportSummaryMetricsProps> = ({ stats }) => {
  const { totalSpending, previousPeriodSpending, averageDailySpending, remainingBudget, budgetLimit } = stats;

  const diff = totalSpending - previousPeriodSpending;
  const percentChange = previousPeriodSpending > 0
    ? Math.round((diff / previousPeriodSpending) * 100)
    : 0;
  const isIncrease = diff > 0;
  const budgetUtilization = budgetLimit > 0
    ? Math.min(100, Math.round((totalSpending / budgetLimit) * 100))
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Spending Card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          {percentChange !== 0 && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              isIncrease ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(percentChange)}%
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Tổng chi tiêu</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatVND(totalSpending)}</h3>
        </div>
      </div>

      {/* Avg Daily Card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Trung bình/ngày</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatVND(averageDailySpending)}</h3>
        </div>
      </div>

      {/* Budget Remaining Card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <PiggyBank className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-400">{100 - budgetUtilization}% còn lại</span>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Ngân sách còn lại</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatVND(remainingBudget)}</h3>
          <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                budgetUtilization > 90 ? 'bg-rose-500' : budgetUtilization > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetUtilization}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
