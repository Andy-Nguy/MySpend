import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getPermissionsByRole, PermissionNameEnum, UserRoleEnum } from '@myspend/libs';

export interface IJwtPayload {
  sub: string;
  email: string;
  role?: UserRoleEnum;
  permissions?: PermissionNameEnum[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  validate(payload: IJwtPayload) {
    const role = payload.role || UserRoleEnum.USER;
    const permissions = payload.permissions || getPermissionsByRole(role);

    return {
      userId: payload.sub,
      email: payload.email,
      role,
      permissions,
    };
  }
}
