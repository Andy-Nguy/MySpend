import { IBaseEntity } from './base.types';

export interface IProfile extends IBaseEntity {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  mobileNumber?: string | null;
  dateOfBirth?: Date | string | null;
  avatarUrl?: string | null;
}

