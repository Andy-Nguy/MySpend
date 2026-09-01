import { IBaseEntity } from './base.types';
import { ICategory } from './category.types';

export interface ITransaction extends IBaseEntity {
  id: string;
  userId: string;
  categoryId: string;
  category?: ICategory;
  amount: number;
  transactionDate: string; // ISO date YYYY-MM-DD
  note?: string | null;
}
