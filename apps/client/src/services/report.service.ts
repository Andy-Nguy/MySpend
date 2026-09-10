import { ICategoryBreakdownItem, IDashboardSummary, IReportStats } from '@myspend/libs';
import { apiClient } from './api.service';

export const reportService = {
  async getMonthlySummary(year: number, month: number): Promise<IDashboardSummary> {
    const response = await apiClient.get<IDashboardSummary>('/reports/summary', {
      params: { year, month },
    });
    return response.data;
  },

  async getCategoryBreakdown(from: string, to: string, categoryId?: string): Promise<ICategoryBreakdownItem[]> {
    const response = await apiClient.get<ICategoryBreakdownItem[]>('/reports/category-breakdown', {
      params: { from, to, categoryId },
    });
    return response.data;
  },

  async getReportStats(from: string, to: string, categoryId?: string): Promise<IReportStats> {
    const response = await apiClient.get<IReportStats>('/reports/stats', {
      params: { from, to, categoryId },
    });
    return response.data;
  },
};
