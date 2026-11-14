import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  History,
  Layers,
  PieChart,
  Plus,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppRoutes } from '../../consts/routes';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatCompactVND = (amount: number) => {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  }
  if (abs >= 1_000) {
    return `${Math.round(amount / 1_000)}K`;
  }
  return `${amount}`;
};

interface ISummaryCardsProps {
  income?: number;
  expense?: number;
  netSavings?: number;
  totalBalance?: number;
  balance?: number; // Backward-compatibility
  budgetLimit?: number;
  remainingBudget?: number;
  loading?: boolean;
  onOpenAddTransaction?: () => void;
}

export const SummaryCards: React.FC<ISummaryCardsProps> = ({
  income = 0,
  expense = 0,
  netSavings,
  totalBalance = 0,
  balance,
  budgetLimit = 0,
  remainingBudget = 0,
  loading,
  onOpenAddTransaction,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hideBalance, setHideBalance] = useState(false);

  const currentNetSavings = netSavings ?? balance ?? 0;
  const savingRate =
    income > 0 ? Math.max(0, Math.min(100, Math.round(((income - expense) / income) * 100))) : 0;
  const budgetUsedPercent =
    budgetLimit > 0 ? Math.min(100, Math.round((expense / budgetLimit) * 100)) : 0;
  const isOverBudget = budgetLimit > 0 && expense > budgetLimit;

  const quickActions = [
    {
      label: t('dashboard.quickRecord'),
      icon: <Plus className="w-5 h-5" />,
      bgClass: 'bg-[#006c49]/10 text-[#006c49]',
      onClick: () => onOpenAddTransaction?.(),
    },
    {
      label: t('nav.categories'),
      icon: <Layers className="w-5 h-5" />,
      bgClass: 'bg-[#e2dfff] text-[#3323cc]',
      onClick: () => navigate(AppRoutes.CATEGORIES),
    },
    {
      label: t('nav.transactions'),
      icon: <History className="w-5 h-5" />,
      bgClass: 'bg-amber-100 text-amber-800',
      onClick: () => navigate(AppRoutes.TRANSACTIONS),
    },
    {
      label: t('nav.reports'),
      icon: <PieChart className="w-5 h-5" />,
      bgClass: 'bg-[#e3eae3] text-[#161d19]',
      onClick: () => navigate(AppRoutes.REPORTS),
    },
  ];

  return (
    <>
      {/* ── DESKTOP BENTO GRID KPI CARDS ── */}
      <section className="hidden md:grid md:grid-cols-2 xl:grid-cols-12 gap-4 w-full">
        {/* Card 1: Total Balance (4 cols) */}
        <div className="md:col-span-2 xl:col-span-4 p-6 rounded-[28px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#6ffbbe]/30 blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#006c49]" />
                <span className="text-[11px] font-bold text-[#6c7a71] uppercase tracking-wider">
                  {t('dashboard.totalBalance')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHideBalance((prev) => !prev)}
                title={t('dashboard.hideBalance')}
                className="text-[#6c7a71] hover:text-[#161d19] transition-colors p-1 rounded-lg hover:bg-[#eef6ee]"
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {loading ? (
              <div className="h-10 w-44 bg-[#e8f0e9] rounded-xl animate-pulse my-2" />
            ) : (
              <div className="text-3xl xl:text-[34px] font-bold tracking-tight text-[#161d19] my-1.5">
                {hideBalance ? '•••••••• ₫' : formatVND(totalBalance)}
              </div>
            )}
          </div>

          <div className="mt-4 bg-[#eef6ee] rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2">
            <span className="text-xs text-[#3c4a42] font-medium truncate">
              {t('dashboard.netCashflow')}
            </span>
            {loading ? (
              <div className="h-4 w-24 bg-[#dde4dd] rounded animate-pulse" />
            ) : (
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold ${
                  currentNetSavings >= 0 ? 'text-[#006c49]' : 'text-[#ba1a1a]'
                }`}
              >
                {currentNetSavings >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {hideBalance
                  ? '••••••'
                  : `${currentNetSavings >= 0 ? '+' : ''}${formatVND(currentNetSavings)}`}
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Monthly Income (3 cols) */}
        <div className="xl:col-span-3 p-6 rounded-[28px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#6c7a71] uppercase tracking-wider">
                {t('dashboard.monthlyIncome')}
              </span>
              <div className="w-7 h-7 rounded-full bg-[#006c49]/10 text-[#006c49] flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-36 bg-[#e8f0e9] rounded-xl animate-pulse my-2" />
            ) : (
              <div className="text-2xl font-bold text-[#006c49] tracking-tight my-1">
                {hideBalance ? '+•••••• ₫' : `+${formatVND(income)}`}
              </div>
            )}
          </div>
          <p className="text-xs text-[#6c7a71] mt-3">{t('dashboard.monthlyIncomeSub')}</p>
        </div>

        {/* Card 3: Monthly Expense (3 cols) */}
        <div className="xl:col-span-3 p-6 rounded-[28px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#6c7a71] uppercase tracking-wider">
                {t('dashboard.monthlyExpense')}
              </span>
              <div className="w-7 h-7 rounded-full bg-[#a43a3a]/10 text-[#a43a3a] flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-36 bg-[#e8f0e9] rounded-xl animate-pulse my-2" />
            ) : (
              <div className="text-2xl font-bold text-[#161d19] tracking-tight my-1">
                {hideBalance ? '-•••••• ₫' : `-${formatVND(expense)}`}
              </div>
            )}
          </div>

          {budgetLimit > 0 ? (
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#6c7a71]">
                  {t('dashboard.budgetLimitLabel', { limit: formatCompactVND(budgetLimit) })}
                </span>
                <span className={`font-bold ${isOverBudget ? 'text-[#ba1a1a]' : 'text-[#161d19]'}`}>
                  {budgetUsedPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#e8f0e9] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget ? 'bg-[#ba1a1a]' : 'bg-[#645efb]'
                  }`}
                  style={{ width: `${budgetUsedPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#6c7a71] mt-3">{t('dashboard.monthlyExpenseSub')}</p>
          )}
        </div>

        {/* Card 4: Wallet Health / Saving Rate Gauge (2 cols) */}
        <div className="md:col-span-2 xl:col-span-2 p-5 rounded-[28px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6c7a71] uppercase tracking-wider">
              {t('dashboard.walletHealth')}
            </span>
            <ShieldCheck className="w-4 h-4 text-[#006c49]" />
          </div>

          <div className="relative my-2 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#e8f0e9]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-[#006c49] transition-all duration-700"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${savingRate}, 100`}
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-[#161d19] leading-none">
                {loading ? '--' : `${savingRate}%`}
              </span>
            </div>
          </div>

          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#006c49]/10 text-[#006c49] text-[11px] font-bold">
            {t('dashboard.savingRate', { rate: savingRate })}
          </span>
        </div>
      </section>

      {/* ── MOBILE HERO CARD + QUICK ACTIONS + BUDGET SNAPSHOT ── */}
      <div className="md:hidden space-y-5">
        {/* Obsidian Hero Balance Card */}
        <section className="relative w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-[#121926] via-[#0b1019] to-[#04070c] text-white shadow-[0_16px_36px_rgba(0,0,0,0.24)] p-5 select-none">
          <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#006c49]/15 via-transparent to-white/5 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Balance Section */}
          <div className="relative z-10 flex flex-col mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('dashboard.totalBalance')}
              </span>
              <button
                type="button"
                aria-label={t('dashboard.hideBalance')}
                onClick={() => setHideBalance((prev) => !prev)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {loading ? (
              <div className="h-9 w-44 bg-white/10 rounded-xl animate-pulse" />
            ) : (
              <span className="text-3xl tracking-tight font-extrabold text-white">
                {hideBalance ? '•••••••• ₫' : formatVND(totalBalance)}
              </span>
            )}
          </div>

          {/* Sub-metrics Strip */}
          <div className="relative z-10 bg-white/5 rounded-2xl px-3.5 py-2.5 backdrop-blur-md flex items-center justify-between gap-2">
            <span className="text-xs text-slate-300 font-medium truncate">
              {t('dashboard.netCashflow')}:{' '}
              <strong className={currentNetSavings >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                {hideBalance ? '••••' : formatCompactVND(currentNetSavings)}
              </strong>
            </span>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="flex items-center gap-0.5 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-300">
                  {hideBalance ? '•••' : `+${formatCompactVND(income)}`}
                </span>
              </div>
              <div className="flex items-center gap-0.5 bg-rose-500/15 px-2 py-0.5 rounded-full">
                <ArrowDownLeft className="w-3 h-3 text-rose-400" />
                <span className="text-[11px] font-bold text-rose-300">
                  {hideBalance ? '•••' : `-${formatCompactVND(expense)}`}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Quick Actions Row */}
        <section className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.03)] active:scale-95 transition-all text-[#161d19]"
            >
              <div className={`w-11 h-11 rounded-full ${action.bgClass} flex items-center justify-center`}>
                {action.icon}
              </div>
              <span className="text-[11px] font-bold text-[#161d19] truncate max-w-full">
                {action.label}
              </span>
            </button>
          ))}
        </section>

        {/* Budget / Financial Health Snapshot */}
        {budgetLimit > 0 && (
          <section className="flex flex-col w-full bg-white rounded-[24px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#006c49]" />
                <span className="text-sm font-bold text-[#161d19]">
                  {t('dashboard.walletHealth')}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#6ffbbe]/40 text-[11px] font-bold text-[#006c49]">
                {t('dashboard.budgetUsed', { percent: budgetUsedPercent })}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-[#e3eae3] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget ? 'bg-[#ba1a1a]' : 'bg-[#10b981]'
                }`}
                style={{ width: `${budgetUsedPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-[#3c4a42]">
              <span>
                {t('dashboard.budgetRemaining')}{' '}
                <strong className={remainingBudget >= 0 ? 'text-[#006c49]' : 'text-[#ba1a1a]'}>
                  {formatVND(remainingBudget)}
                </strong>
              </span>
              <span>{t('dashboard.budgetLimitLabel', { limit: formatVND(budgetLimit) })}</span>
            </div>
          </section>
        )}
      </div>
    </>
  );
};
