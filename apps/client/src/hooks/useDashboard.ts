import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export const DASHBOARD_QUERY_KEY = ['dashboard'] as const;

export function useDashboard(year: number, month: number) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, year, month],
    queryFn: () => dashboardService.getSummary(year, month),
    enabled: Boolean(year && month),
  });
}
