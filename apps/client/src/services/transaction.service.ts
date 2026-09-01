import { ITransaction } from '@myspend/libs';
import { apiClient } from './api.service';

export interface ICreateTransactionData {
  categoryId: string;
  amount: number;
  transactionDate: string;
  note?: string;
}

export interface IUpdateTransactionData {
  categoryId?: string;
  amount?: number;
  transactionDate?: string;
  note?: string;
}

export interface ITransactionQuery {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  categoryId?: string;
}

export interface ITransactionPage {
  data: ITransaction[];
  total: number;
  page: number;
  limit: number;
}

export const transactionService = {
  async getAll(query: ITransactionQuery = {}): Promise<ITransactionPage> {
    const response = await apiClient.get<ITransactionPage>('/transactions', { params: query });
    return response.data;
  },

  async create(data: ICreateTransactionData): Promise<ITransaction> {
    const response = await apiClient.post<ITransaction>('/transactions', data);
    return response.data;
  },

  async update(id: string, data: IUpdateTransactionData): Promise<ITransaction> {
    const response = await apiClient.patch<ITransaction>(`/transactions/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/transactions/${id}`);
    return response.data;
  },
};
