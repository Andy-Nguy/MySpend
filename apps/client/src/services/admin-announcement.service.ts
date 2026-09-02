import {
  IAnnouncement,
  ICreateAnnouncementDto,
  IUpdateAnnouncementDto,
} from '@myspend/libs';
import { apiClient } from './api.service';

export const adminAnnouncementService = {
  async getAnnouncements(): Promise<IAnnouncement[]> {
    const { data } = await apiClient.get<IAnnouncement[]>('/admin/announcements');
    return data;
  },

  async getAnnouncementById(id: string): Promise<IAnnouncement> {
    const { data } = await apiClient.get<IAnnouncement>(`/admin/announcements/${id}`);
    return data;
  },

  async createAnnouncement(dto: ICreateAnnouncementDto): Promise<IAnnouncement> {
    const { data } = await apiClient.post<IAnnouncement>('/admin/announcements', dto);
    return data;
  },

  async updateAnnouncement(id: string, dto: IUpdateAnnouncementDto): Promise<IAnnouncement> {
    const { data } = await apiClient.put<IAnnouncement>(`/admin/announcements/${id}`, dto);
    return data;
  },

  async deleteAnnouncement(id: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.delete<{ success: boolean }>(`/admin/announcements/${id}`);
    return data;
  },

  async toggleActive(id: string): Promise<IAnnouncement> {
    const { data } = await apiClient.patch<IAnnouncement>(`/admin/announcements/${id}/toggle-active`);
    return data;
  },
};
