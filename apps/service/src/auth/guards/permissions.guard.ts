import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  getPermissionsByRole,
  PermissionNameEnum,
  UserRoleEnum,
} from '@myspend/libs';
import { PERMISSIONS_KEY } from '../decorators/check-permissions.decorator';
import { ProfilesRepository } from '../../profiles/repository/profiles.repository';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly profilesRepository: ProfilesRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionNameEnum[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Access denied: Unauthorized session');
    }

    // Always fetch fresh profile from DB to prevent stale permissions
    const currentProfile = await this.profilesRepository.findById(user.userId);
    if (!currentProfile) {
      throw new ForbiddenException('Access denied: User profile not found');
    }

    const currentRole = currentProfile.role || UserRoleEnum.USER;
    const currentPermissions = getPermissionsByRole(currentRole);

    const hasPermission = requiredPermissions.every((permission) =>
      currentPermissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Access denied: You do not have required permissions'
      );
    }

    // Attach fresh role & permissions to request user object
    user.role = currentRole;
    user.permissions = currentPermissions;

    return true;
  }
}
