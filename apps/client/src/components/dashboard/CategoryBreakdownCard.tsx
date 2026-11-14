import React from 'react';
import { PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ICategoryBreakdownItem } from '@myspend/libs';
import { AppRoutes } from '../../consts/routes';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatCompactVND = (amount: number) => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)}k`;
  }
  return `${amount}`;
};

const SEGMENT_COLORS = ['#10b981', '#645efb', '#fc7c78', '#f59e0b', '#06b6d4'];
const CIRCUMFERENCE = 2 * Math.PI * 40; // r = 40 -> ~251.33

interface CategoryBreakdownCardProps {
  items: ICategoryBreakdownItem[];
  totalExpense: number;
  budgetLimit?: number;
  loading?: boolean;
}

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  items,
  totalExpense,
  budgetLimit = 0,
  loading,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const topItems = items.slice(0, 4);
  const budgetUsedPercent =
    budgetLimit > 0 ? Math.min(100, Math.round((totalExpense / budgetLimit) * 100)) : null;

  let cumulativePercent = 0;
  const segments = topItems.map((item, idx) => {
    const dashLength = (item.percentage / 100) * CIRCUMFERENCE;
    const dashOffset = -((cumulativePercent / 100) * CIRCUMFERENCE);
    cumulativePercent += item.percentage;
    return {
      ...item,
      color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
      dashLength,
      dashOffset,
    };
  });

  return (
    <div className="p-6 rounded-[28px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-bold text-[#161d19]">
          {t('dashboard.spendingStructure')}
        </h2>
        {budgetUsedPercent !== null && (
          <span className="px-2.5 py-1 rounded-full bg-[#006c49]/10 text-[#006c49] text-[11px] font-bold uppercase tracking-wide">
            {t('dashboard.budgetUsed', { percent: budgetUsedPercent })}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 py-4">
          <div className="w-40 h-40 rounded-full bg-[#e8f0e9] animate-pulse mx-auto" />
          <div className="h-4 w-full bg-[#e8f0e9] rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-[#e8f0e9] rounded animate-pulse" />
        </div>
      ) : topItems.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#eef6ee] text-[#006c49] flex items-center justify-center mx-auto">
            <PieChart className="w-6 h-6" />
          </div>
          <p className="text-sm text-[#6c7a71]">{t('dashboard.noCategorySpending')}</p>
        </div>
      ) : (
        <>
          {/* Donut Ring Chart */}
          <div className="flex flex-col items-center justify-center py-3">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#e8f0e9"
                  strokeWidth="12"
                />
                {segments.map((seg) => (
                  <circle
                    key={seg.categoryId}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={`${seg.dashLength} ${CIRCUMFERENCE}`}
                    strokeDashoffset={seg.dashOffset}
                    strokeLinecap="round"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <span className="text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider">
                  {t('dashboard.totalSpent')}
                </span>
                <span className="text-base font-bold text-[#161d19] leading-tight mt-0.5 truncate max-w-full">
                  {formatVND(totalExpense)}
                </span>
                {budgetLimit > 0 && (
                  <span className="text-[11px] text-[#6c7a71] mt-0.5">
                    / {formatCompactVND(budgetLimit)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Categories Progress Bars */}
          <div className="space-y-3.5 mt-3">
            {segments.map((seg) => (
              <div key={seg.categoryId} className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px] gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="font-medium text-[#161d19] truncate">
                      {seg.categoryName}
                    </span>
                  </div>
                  <span className="font-semibold text-[#161d19] flex-shrink-0">
                    {formatCompactVND(seg.total)}{' '}
                    <span className="text-[#6c7a71] font-normal">
                      ({Math.round(seg.percentage)}%)
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e8f0e9] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(4, seg.percentage))}%`,
                      backgroundColor: seg.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => navigate(AppRoutes.REPORTS)}
        className="w-full mt-5 py-2.5 px-4 rounded-2xl bg-[#e8f0e9] hover:bg-[#dde4dd] text-[13px] font-semibold text-[#161d19] transition-colors flex items-center justify-center gap-2"
      >
        <PieChart className="w-4 h-4 text-[#006c49]" />
        <span>{t('dashboard.viewDetailedReport')}</span>
      </button>
    </div>
  );
};
