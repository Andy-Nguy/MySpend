export type TransactionType = 'expense' | 'income';

export interface ICategory {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  budgetLimit?: number;
}

export interface ITransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface IBudgetOverview {
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  savingsGoal: number;
}
