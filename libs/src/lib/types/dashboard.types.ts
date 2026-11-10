import { ITransaction } from './transaction.types';

export interface IDashboardSummary {
  income: number;
  expense: number;
  balance: number; // Keep for backward-compatibility (same as netSavings)
  netSavings: number; // Income - Expense of current period
  totalBalance: number; // initialBalance + all-time income - all-time expense
  recentTransactions: ITransaction[];
}
