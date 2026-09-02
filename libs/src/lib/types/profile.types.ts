import { IBaseEntity } from './base.types';
import { UserRoleEnum } from '../enums/user-role.enum';
import { PermissionNameEnum } from '../enums/permission-name.enum';

export interface IProfile extends IBaseEntity {
  id: string;
  email: string;
  role: UserRoleEnum;
  permissions?: PermissionNameEnum[];
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  mobileNumber?: string | null;
  dateOfBirth?: Date | string | null;
  avatarUrl?: string | null;
}
