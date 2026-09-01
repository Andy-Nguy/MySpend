import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  PlusCircle,
  Sliders,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WelcomeBannerProps {
  onOpenAddTransaction: () => void;
  onOpenSetBudget: () => void;
  hasTransactions: boolean;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  onOpenAddTransaction,
  onOpenSetBudget,
  hasTransactions,
}) => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const username = user?.email?.split('@')[0] || 'there';

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 mb-8 transition-all">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-20 w-60 h-60 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-300 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold mb-3 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span>Quick Setup &amp; Getting Started</span>
        </div>

        {/* Welcome Greeting */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white">
          Welcome to MySpend, <span className="capitalize">{user?.displayName || user?.email?.split('@')[0]}</span>! 👋
        </h2>
        <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl leading-relaxed mb-6">
          Your personal financial journey begins here. Complete these 3 quick steps to organize your budget and start tracking daily expenses effortlessly.
        </p>

        {/* 3 Getting Started Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Step 1: Set Budget */}
          <div
            onClick={onOpenSetBudget}
            className="group cursor-pointer bg-white/10 hover:bg-white/15 border border-white/15 hover:border-emerald-300/40 rounded-2xl p-4 transition-all duration-200 backdrop-blur-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-emerald-200">
                  Step 1
                </span>
              </div>
              <h3 className="font-bold text-white text-base mb-1">Set Monthly Budget</h3>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                Establish spending targets for the month to stay within limits.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-300 group-hover:text-emerald-200 transition-colors">
              <span>Configure budget</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 2: Explore Categories */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 transition-all backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/30 flex items-center justify-center text-teal-300">
                  <Sliders className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-teal-200">
                  Step 2
                </span>
              </div>
              <h3 className="font-bold text-white text-base mb-1">Smart Categories</h3>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                6 pre-configured categories (Food, Housing, Transport, etc.) are ready.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ready by default</span>
            </div>
          </div>

          {/* Step 3: Record First Expense */}
          <div
            onClick={onOpenAddTransaction}
            className="group cursor-pointer bg-gradient-to-br from-emerald-600/60 to-emerald-500/40 hover:from-emerald-600/80 hover:to-emerald-500/60 border border-emerald-400/40 rounded-2xl p-4 transition-all duration-200 backdrop-blur-sm flex flex-col justify-between shadow-lg shadow-emerald-950/20"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-400/30 text-white">
                  Step 3
                </span>
              </div>
              <h3 className="font-bold text-white text-base mb-1">Log First Expense</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Record your first transaction to populate live analytics and insights.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-white group-hover:text-emerald-100 transition-colors">
              <span>{hasTransactions ? 'Add another expense' : 'Record now'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
