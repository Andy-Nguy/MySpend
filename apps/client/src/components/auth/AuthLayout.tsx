import React from 'react';
import { CheckCircle2, Sparkles, TrendingUp, Wallet } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50">
      {/* Desktop Left Side: Split-screen aspirational hero panel (>= 768px) */}
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white flex-col justify-between p-10 lg:p-14 overflow-hidden select-none">
        {/* Ambient Decorative Background Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Branding Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-900/50">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white">
              MySpend
            </span>
            <span className="block text-xs font-medium text-emerald-300/80">
              Personal Expense Tracker
            </span>
          </div>
        </div>

        {/* Center Hero Content & Visual Mockup */}
        <div className="relative z-10 max-w-lg my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-500/30 text-emerald-200 text-xs font-medium mb-6 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Smart Personal Finance Management</span>
          </div>

          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Master your money <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
              with ease.
            </span>
          </h1>

          <p className="text-base lg:text-lg text-emerald-100/80 mb-8 leading-relaxed">
            Track daily expenses, set intelligent budgets, and take complete
            control of your financial health in one intuitive workspace.
          </p>

          {/* Floating Glassmorphism Metric Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-2xl shadow-emerald-950/40 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <div className="text-xs text-emerald-200/90 font-medium">Monthly Savings Goal</div>
                  <div className="text-lg font-bold tracking-tight">$3,450.00 <span className="text-xs font-normal text-emerald-300">/ $4,500</span></div>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                +24.5%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-emerald-950/50 rounded-full h-2 overflow-hidden mb-3">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full w-[76%]" />
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-200/75">
              <span>76% of monthly budget utilized</span>
              <span className="font-medium text-emerald-300">12 days remaining</span>
            </div>
          </div>

          {/* Value propositions */}
          <div className="mt-8 grid grid-cols-1 gap-3 text-sm text-emerald-100/90">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Real-time income and expense tracking</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Custom categorization & monthly spending limits</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Secure, encrypted personal financial data</span>
            </div>
          </div>
        </div>

        {/* Bottom Tagline / Trust Info */}
        <div className="relative z-10 text-xs text-emerald-300/60 flex items-center justify-between pt-4 border-t border-emerald-800/40">
          <span>&copy; {new Date().getFullYear()} MySpend. All rights reserved.</span>
          <span>Privacy &amp; Security First</span>
        </div>
      </div>

      {/* Right Side: Form Container (Mobile & Desktop) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 min-h-screen bg-slate-50 md:bg-gray-50/60">
        <div className="w-full max-w-md">
          {/* Mobile Top Branding (< 768px) */}
          <div className="md:hidden flex items-center justify-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              MySpend
            </span>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-100 p-6 sm:p-9 transition-all">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-1.5">
                {title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Form Slot */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
