import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/report.service';

export const REPORTS_QUERY_KEY = ['reports', 'breakdown'] as const;

export function useCategoryBreakdown(from: string, to: string) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, from, to],
    queryFn: () => reportService.getCategoryBreakdown(from, to),
    enabled: Boolean(from && to),
  });
}
