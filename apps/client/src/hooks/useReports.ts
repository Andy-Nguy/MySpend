import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { reportService } from '../services/report.service';
import { ICategoryBreakdownItem, IReportStats } from '@myspend/libs';

export const REPORTS_QUERY_KEY = ['reports', 'breakdown'] as const;
export const REPORTS_STATS_KEY = ['reports', 'stats'] as const;

export function useCategoryBreakdown(from: string, to: string, categoryId?: string) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, from, to, categoryId],
    queryFn: () => reportService.getCategoryBreakdown(from, to, categoryId),
    enabled: Boolean(from && to),
    placeholderData: keepPreviousData,
  });
}

export function useReportStats(from: string, to: string, categoryId?: string) {
  return useQuery({
    queryKey: [...REPORTS_STATS_KEY, from, to, categoryId],
    queryFn: () => reportService.getReportStats(from, to, categoryId),
    enabled: Boolean(from && to),
    placeholderData: keepPreviousData,
  });
}
