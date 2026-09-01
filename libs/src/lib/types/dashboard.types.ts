import { ITransaction } from './transaction.types';

export interface IDashboardSummary {
  income: number;
  expense: number;
  balance: number;
  recentTransactions: ITransaction[];
}
