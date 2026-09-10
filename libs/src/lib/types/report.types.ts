export interface ICategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  icon: string;
  total: number;
  percentage: number;
}

export interface IReportStats {
  totalSpending: number;
  previousPeriodSpending: number;
  averageDailySpending: number;
  remainingBudget: number;
  budgetLimit: number;
}
