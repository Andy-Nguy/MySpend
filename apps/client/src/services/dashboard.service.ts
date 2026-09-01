import { IDashboardSummary } from '@myspend/libs';
import { reportService } from './report.service';

export const dashboardService = {
  getSummary(year: number, month: number): Promise<IDashboardSummary> {
    return reportService.getMonthlySummary(year, month);
  },
};
