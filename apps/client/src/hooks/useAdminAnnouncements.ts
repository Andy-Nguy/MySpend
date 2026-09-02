import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { ICreateAnnouncementDto, IUpdateAnnouncementDto } from '@myspend/libs';
import { adminAnnouncementService } from '../services/admin-announcement.service';
import { ANNOUNCEMENTS_QUERY_KEY, UNREAD_ANNOUNCEMENTS_QUERY_KEY } from './useAnnouncements';

export const ADMIN_ANNOUNCEMENTS_QUERY_KEY = ['admin', 'announcements'] as const;

export function useAdminAnnouncements() {
  return useQuery({
    queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY,
    queryFn: () => adminAnnouncementService.getAnnouncements(),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateAnnouncementDto) =>
      adminAnnouncementService.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_ANNOUNCEMENTS_QUERY_KEY });
      message.success('Tạo thông báo thành công!');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error?.response?.data?.message || 'Không thể tạo thông báo');
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateAnnouncementDto }) =>
      adminAnnouncementService.updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_ANNOUNCEMENTS_QUERY_KEY });
      message.success('Cập nhật thông báo thành công!');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error?.response?.data?.message || 'Không thể cập nhật thông báo');
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAnnouncementService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_ANNOUNCEMENTS_QUERY_KEY });
      message.success('Đã xóa thông báo!');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error?.response?.data?.message || 'Không thể xóa thông báo');
    },
  });
}

export function useToggleAnnouncementActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAnnouncementService.toggleActive(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_ANNOUNCEMENTS_QUERY_KEY });
      message.success(
        updated.isActive ? 'Đã kích hoạt thông báo' : 'Đã ẩn thông báo'
      );
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error?.response?.data?.message || 'Không thể thay đổi trạng thái');
    },
  });
}
