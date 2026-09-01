import { apiClient } from './api.service';
import { IAuthUser } from '../context/AuthContext';

export interface IUpdateProfileData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
}

export interface IChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  async updateProfile(data: IUpdateProfileData): Promise<IAuthUser> {
    const response = await apiClient.patch<IAuthUser>('/profiles/me', data);
    return response.data;
  },

  async changePassword(data: IChangePasswordData): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/profiles/me/change-password',
      data
    );
    return response.data;
  },
};
