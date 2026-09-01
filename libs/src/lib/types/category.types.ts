import { IBaseEntity } from './base.types';
import { CategoryTypeEnum } from '../enums/category-type.enum';

export interface ICategory extends IBaseEntity {
  id: string;
  userId: string;
  name: string;
  type: CategoryTypeEnum;
  icon: string;
  transactionCount?: number;
  hasTransactions?: boolean;
}
