import { SetMetadata } from '@nestjs/common';
import { PermissionNameEnum } from '@myspend/libs';

export const PERMISSIONS_KEY = 'permissions';

export const CheckPermissions = (...permissions: PermissionNameEnum[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
