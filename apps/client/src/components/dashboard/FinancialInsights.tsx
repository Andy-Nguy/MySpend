import React from 'react';
import { Lightbulb, Shield, Sparkles, TrendingUp } from 'lucide-react';

export const FinancialInsights: React.FC = () => {
  const tips = [
    {
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      title: 'The 50/30/20 Budgeting Rule',
      desc: 'Aim for 50% on essential needs, 30% on discretionary wants, and 20% dedicated to savings & debt reduction.',
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-teal-600" />,
      title: 'Track Small Daily Expenses',
      desc: 'Small daily micro-purchases like coffee and snacks often add up to over 15% of monthly discretionary spend.',
      bg: 'bg-teal-50/70',
      border: 'border-teal-100',
    },
    {
      icon: <Shield className="w-4 h-4 text-indigo-600" />,
      title: 'Emergency Buffer Goal',
      desc: 'Building a 3 to 6-month living expense buffer gives total peace of mind for unexpected life events.',
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-100',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Financial Insights</h3>
            <p className="text-xs text-gray-400">Actionable advice to grow your wealth</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tips.map((item, index) => (
          <div
            key={index}
            className={`p-3.5 rounded-xl border ${item.bg} ${item.border} transition-all`}
          >
            <div className="flex items-center gap-2 mb-1">
              {item.icon}
              <h4 className="text-xs font-bold text-gray-900">{item.title}</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed pl-6">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
