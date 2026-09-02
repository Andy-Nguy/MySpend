import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { announcementService } from '../services/announcement.service';
import { useAuth } from '../context/AuthContext';

export const ANNOUNCEMENTS_QUERY_KEY = ['announcements'] as const;
export const UNREAD_ANNOUNCEMENTS_QUERY_KEY = ['announcements', 'unread'] as const;

export function useUnreadAnnouncements() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: UNREAD_ANNOUNCEMENTS_QUERY_KEY,
    queryFn: () => announcementService.getUnreadSummary(),
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
  });
}

export function useUserAnnouncements() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ANNOUNCEMENTS_QUERY_KEY,
    queryFn: () => announcementService.getAnnouncements(),
    enabled: isAuthenticated,
  });
}

export function useMarkAnnouncementRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNREAD_ANNOUNCEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error?.response?.data?.message || 'Không thể đánh dấu đã đọc');
    },
  });
}

export function useMarkAllAnnouncementsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => announcementService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNREAD_ANNOUNCEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY });
      message.success('Đã đánh dấu tất cả là đã đọc');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error?.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    },
  });
}
