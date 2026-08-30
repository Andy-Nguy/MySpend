import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfileEntity } from '../entities/profile/profile.entity';
import { ProfilesRepository } from '../profiles/repository/profiles.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([ProfileEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ProfilesRepository],
})
export class AuthModule {}
