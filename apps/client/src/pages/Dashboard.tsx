import React, { useEffect, useState } from 'react';
import { Toast } from 'antd-mobile';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { ICategory, ITransaction, TransactionType } from '../types/transaction.types';
import { Header } from '../components/dashboard/Header';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { MetricCards } from '../components/dashboard/MetricCards';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown';
import { BudgetProgressCard } from '../components/dashboard/BudgetProgressCard';
import { FinancialInsights } from '../components/dashboard/FinancialInsights';
import { AddTransactionModal } from '../components/dashboard/AddTransactionModal';
import { SetBudgetModal } from '../components/dashboard/SetBudgetModal';
import { CategoriesModal } from '../components/dashboard/CategoriesModal';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';

const STORAGE_KEY_TRANSACTIONS = 'myspend_transactions';
const STORAGE_KEY_BUDGET = 'myspend_budget';

export const Dashboard: React.FC = () => {
  const [categories] = useState<ICategory[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<ITransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [totalBudget, setTotalBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUDGET);
      return saved ? parseFloat(saved) : 2500;
    } catch {
      return 2500;
    }
  });

  // Modal visibility states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<TransactionType>('expense');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  // Mobile active tab state
  const [mobileTab, setMobileTab] = useState<'home' | 'transactions' | 'analytics'>('home');

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGET, totalBudget.toString());
    } catch {
      // ignore
    }
  }, [totalBudget]);

  // Compute metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Handlers
  const handleOpenAdd = (type: TransactionType = 'expense') => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  const handleAddTransaction = (
    data: Omit<ITransaction, 'id' | 'createdAt'>
  ) => {
    const newTx: ITransaction = {
      ...data,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    Toast.show({
      icon: 'success',
      content: `${data.type === 'expense' ? 'Expense' : 'Income'} added!`,
      duration: 1500,
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    Toast.show({
      icon: 'success',
      content: 'Transaction deleted',
      duration: 1200,
    });
  };

  const handleSaveBudget = (newBudget: number) => {
    setTotalBudget(newBudget);
    Toast.show({
      icon: 'success',
      content: 'Monthly budget updated!',
      duration: 1500,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20 md:pb-12">
      {/* Top Header */}
      <Header onOpenAddTransaction={() => handleOpenAdd('expense')} />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Onboarding Welcome Banner for user entering post-login */}
        <WelcomeBanner
          onOpenAddTransaction={() => handleOpenAdd('expense')}
          onOpenSetBudget={() => setIsBudgetModalOpen(true)}
          hasTransactions={transactions.length > 0}
        />

        {/* Financial Metric Cards */}
        <MetricCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalBudget={totalBudget}
        />

        {/* Quick Action Shortcuts */}
        <QuickActions
          onOpenAddExpense={() => handleOpenAdd('expense')}
          onOpenAddIncome={() => handleOpenAdd('income')}
          onOpenSetBudget={() => setIsBudgetModalOpen(true)}
          onOpenCategories={() => setIsCategoriesModalOpen(true)}
        />

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Primary): Recent Transactions & Category Breakdown */}
          <div className="lg:col-span-8 space-y-8">
            <RecentTransactions
              transactions={transactions}
              onOpenAddTransaction={handleOpenAdd}
              onDeleteTransaction={handleDeleteTransaction}
            />

            <CategoryBreakdown
              categories={categories}
              transactions={transactions}
              totalExpense={totalExpense}
            />
          </div>

          {/* Right Column (Secondary): Budget Meter & Financial Insights */}
          <div className="lg:col-span-4 space-y-6">
            <BudgetProgressCard
              totalBudget={totalBudget}
              totalExpense={totalExpense}
              onOpenSetBudget={() => setIsBudgetModalOpen(true)}
            />

            <FinancialInsights />
          </div>
        </div>
      </main>

      {/* Interactive Modal Dialogs */}
      <AddTransactionModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        categories={categories}
        defaultType={addModalType}
      />

      <SetBudgetModal
        visible={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={totalBudget}
        onSaveBudget={handleSaveBudget}
      />

      <CategoriesModal
        visible={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
      />

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav
        onOpenAddTransaction={() => handleOpenAdd('expense')}
        activeTab={mobileTab}
        setActiveTab={setMobileTab}
      />
    </div>
  );
};

export default Dashboard;
