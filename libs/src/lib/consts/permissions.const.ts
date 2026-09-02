import { PermissionNameEnum } from '../enums/permission-name.enum';
import { UserRoleEnum } from '../enums/user-role.enum';

export const ROLE_PERMISSIONS_MAP: Record<UserRoleEnum, PermissionNameEnum[]> = {
  [UserRoleEnum.ADMIN]: [
    PermissionNameEnum.ANNOUNCEMENT_READ,
    PermissionNameEnum.ANNOUNCEMENT_CREATE,
    PermissionNameEnum.ANNOUNCEMENT_UPDATE,
    PermissionNameEnum.ANNOUNCEMENT_DELETE,
  ],
  [UserRoleEnum.USER]: [
    PermissionNameEnum.ANNOUNCEMENT_READ,
  ],
};

export const getPermissionsByRole = (role?: UserRoleEnum | string | null): PermissionNameEnum[] => {
  if (!role || !(role in ROLE_PERMISSIONS_MAP)) {
    return [PermissionNameEnum.ANNOUNCEMENT_READ];
  }
  return ROLE_PERMISSIONS_MAP[role as UserRoleEnum];
};
