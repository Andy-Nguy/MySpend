import React, { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ICategoryBreakdownItem } from '@myspend/libs';
import { CategoryIcon } from '../categories/CategoryIconPicker';
import { Segmented } from 'antd';

const COLORS = [
  '#047857', // emerald-700
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // purple-500
  '#ef4444', // red-500
  '#14b8a6', // teal-500
  '#6361f1', // indigo-500
];

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

interface ICategoryDonutChartProps {
  items: ICategoryBreakdownItem[];
  loading?: boolean;
}

export const CategoryDonutChart: React.FC<ICategoryDonutChartProps> = ({ items, loading }) => {
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);


  if (loading) {
    return (
      <div className="h-96 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Đang phân tích dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="h-96 bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center p-6 text-center text-gray-500">
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
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-lg">Cơ cấu Chi tiêu</h3>
        <Segmented
          value={chartType}
          onChange={(val) => setChartType(val as 'donut' | 'bar')}
          options={[
            { label: 'Donut', value: 'donut' },
            { label: 'Bar', value: 'bar' },
          ]}
          className="!bg-gray-100"
        />
      </div>

      <div className="h-72 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'donut' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number) => [formatVND(val), 'Tổng tiền']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(val) => `${val/1000}k`}
              />
              <Tooltip
                formatter={(val: number) => [formatVND(val), 'Tổng tiền']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>

        {chartType === 'donut' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng chi</span>
            <span className="text-xl font-black text-gray-900">{formatVND(totalAmount || 0)}</span>
          </div>
        )}
      </div>

      {/* Ranked Category List */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        {chartData.map((item) => (
          <div key={item.name} className="group">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <div className="flex items-center gap-2.5">
                <CategoryIcon slug={item.icon} className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-gray-800">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">{formatVND(item.value)}</span>
                <span className="text-xs font-bold text-gray-500">{item.percentage}%</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
