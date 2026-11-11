import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfileEntity } from '../entities/profile/profile.entity';
import { UserPasskeyEntity } from '../entities/passkey/user-passkey.entity';
import { PasskeyChallengeEntity } from '../entities/passkey/passkey-challenge.entity';
import { ProfilesRepository } from '../profiles/repository/profiles.repository';
import { PasskeysRepository } from './repository/passkeys.repository';
import { CategoriesModule } from '../categories/categories.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasskeysService } from './passkeys.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      ProfileEntity,
      UserPasskeyEntity,
      PasskeyChallengeEntity,
    ]),
    CategoriesModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasskeysService,
    JwtStrategy,
    ProfilesRepository,
    PasskeysRepository,
  ],
  exports: [PasskeysService, PasskeysRepository],
})
export class AuthModule {}
