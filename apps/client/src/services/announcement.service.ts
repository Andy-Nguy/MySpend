import {
  IAnnouncement,
  IAnnouncementUnreadResponse,
} from '@myspend/libs';
import { apiClient } from './api.service';

export const announcementService = {
  async getAnnouncements(): Promise<IAnnouncement[]> {
    const { data } = await apiClient.get<IAnnouncement[]>('/announcements');
    return data;
  },

  async getUnreadSummary(): Promise<IAnnouncementUnreadResponse> {
    const { data } = await apiClient.get<IAnnouncementUnreadResponse>('/announcements/unread');
    return data;
  },

  async markAsRead(id: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.post<{ success: boolean }>(`/announcements/${id}/read`);
    return data;
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    const { data } = await apiClient.post<{ success: boolean }>('/announcements/read-all');
    return data;
  },
};
