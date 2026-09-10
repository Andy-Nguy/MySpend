import React from 'react';
import { Alert, AlertIcon } from 'antd';
import { Info, Zap, TrendingUp } from 'lucide-react';
import { IReportStats, ICategoryBreakdownItem } from '@myspend/libs';

interface ReportInsightsProps {
  stats: IReportStats;
  breakdown: ICategoryBreakdownItem[];
}

export const ReportInsights: React.FC<ReportInsightsProps> = ({ stats, breakdown }) => {
  const { totalSpending, previousPeriodSpending } = stats;
  const topCategory = breakdown[0];

  const diff = totalSpending - previousPeriodSpending;
  const isIncrease = diff > 0;
  const percentChange = previousPeriodSpending > 0
    ? Math.round((diff / previousPeriodSpending) * 100)
    : 0;

  const insights = [];

  if (percentChange !== 0) {
    insights.push({
      type: isIncrease ? 'warning' : 'success',
      title: isIncrease ? 'Chi tiêu tăng' : 'Chi tiêu giảm',
      message: `Chi tiêu của bạn ${isIncrease ? 'cao hơn' : 'thấp hơn'} ${Math.abs(percentChange)}% so với kỳ trước.`,
      icon: isIncrease ? <TrendingUp className="w-4 h-4 text-rose-500" /> : <Zap className="w-4 h-4 text-emerald-500" />,
    });
  }

  if (topCategory) {
    insights.push({
      type: 'info',
      title: 'Danh mục chủ đạo',
      message: `${topCategory.categoryName} chiếm ${topCategory.percentage}% tổng chi tiêu của bạn.`,
      icon: <Info className="w-4 h-4 text-blue-500" />,
    });
  }

  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {insights.map((insight, idx) => (
        <Alert
          key={idx}
          message={<span className="font-bold">{insight.title}</span>}
          description={insight.message}
          type={insight.type as any}
          showIcon
          icon={insight.icon}
          className="rounded-2xl border-none shadow-sm overflow-hidden"
        />
      ))}
    </div>
  );
};
