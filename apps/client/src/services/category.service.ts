import { ICategory } from '@myspend/libs';
import { apiClient } from './api.service';

export interface ICreateCategoryData {
  name: string;
  type: string;
  icon: string;
}

export interface IUpdateCategoryData {
  name?: string;
  icon?: string;
}

export const categoryService = {
  async getAll(): Promise<ICategory[]> {
    const response = await apiClient.get<ICategory[]>('/categories');
    return response.data;
  },

  async create(data: ICreateCategoryData): Promise<ICategory> {
    const response = await apiClient.post<ICategory>('/categories', data);
    return response.data;
  },

  async update(id: string, data: IUpdateCategoryData): Promise<ICategory> {
    const response = await apiClient.patch<ICategory>(`/categories/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/categories/${id}`);
    return response.data;
  },
};
