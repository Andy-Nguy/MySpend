import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ICategoryBreakdownItem } from '@myspend/libs';
import { CategoryIcon } from '../categories/CategoryIconPicker';

const COLORS = [
  '#047857', // emerald-700
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // purple-500
  '#ef4444', // red-500
  '#14b8a6', // teal-500
  '#6366f1', // indigo-500
];

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

interface ICategoryDonutChartProps {
  items: ICategoryBreakdownItem[];
  loading?: boolean;
}

export const CategoryDonutChart: React.FC<ICategoryDonutChartProps> = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="h-64 bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400">
        Đang tải biểu đồ...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="h-64 bg-white rounded-2xl border border-gray-200/80 flex flex-col items-center justify-center p-6 text-center text-gray-500">
        <p className="text-sm font-medium">Không có dữ liệu chi tiêu trong khoảng thời gian này.</p>
      </div>
    );
  }

  const chartData = items.map((item, index) => ({
    name: item.categoryName,
    value: item.total,
    percentage: item.percentage,
    icon: item.icon,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-6">
      <h3 className="font-bold text-gray-900 text-base">Cơ cấu Chi tiêu theo Danh mục</h3>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number) => [formatVND(val), 'Tổng tiền']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Ranked Category List */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <CategoryIcon slug={item.icon} className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-800">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900">{formatVND(item.value)}</span>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full min-w-[45px] text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
