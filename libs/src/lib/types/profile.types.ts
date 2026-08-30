import { IBaseEntity } from './base.types';

export interface IProfile extends IBaseEntity {
  id: string;
  email: string;
}
