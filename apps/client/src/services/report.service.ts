import { ICategoryBreakdownItem, IDashboardSummary } from '@myspend/libs';
import { apiClient } from './api.service';

export const reportService = {
  async getMonthlySummary(year: number, month: number): Promise<IDashboardSummary> {
    const response = await apiClient.get<IDashboardSummary>('/reports/summary', {
      params: { year, month },
    });
    return response.data;
  },

  async getCategoryBreakdown(from: string, to: string): Promise<ICategoryBreakdownItem[]> {
    const response = await apiClient.get<ICategoryBreakdownItem[]>('/reports/category-breakdown', {
      params: { from, to },
    });
    return response.data;
  },
};
