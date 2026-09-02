import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesRepository } from './repository/profiles.repository';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  private createAuthClient() {
    const supabaseUrl = this.config.get<string>('supabase.url');
    const supabaseAnonKey = this.config.get<string>('supabase.anonKey');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new InternalServerErrorException('Supabase auth is not configured');
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  private createAdminClient() {
    const supabaseUrl = this.config.get<string>('supabase.url');
    const serviceRoleKey = this.config.get<string>('supabase.serviceRoleKey');

    if (!supabaseUrl || !serviceRoleKey) {
      return null;
    }

    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.profilesRepository.findById(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const updatedProfile = await this.profilesRepository.updateProfile(userId, {
      ...dto,
      updatedBy: userId,
    });

    this.logger.log(` [Profiles] Updated profile for user: ${userId}`);
    return updatedProfile;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const profile = await this.profilesRepository.findById(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Step 1: Verify current password by signing in
    const supabase = this.createAuthClient();
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: dto.currentPassword,
    });

    if (verifyError) {
      this.logger.warn(
        ` [Profiles] Password verification failed for user: ${userId}`,
      );
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Step 2: Update password via Admin Client or User Client
    const adminClient = this.createAdminClient();
    if (adminClient) {
      const { error: updateError } =
        await adminClient.auth.admin.updateUserById(userId, {
          password: dto.newPassword,
        });

      if (updateError) {
        this.logger.error(
          ` [Profiles] Failed to update password via admin for user: ${userId}: ${updateError.message}`,
        );
        throw new BadRequestException(updateError.message);
      }
    } else {
      // Fallback: Use user session token or sign in again to update password
      const { data: sessionData, error: sessionError } =
        await supabase.auth.signInWithPassword({
          email: profile.email,
          password: dto.currentPassword,
        });

      if (sessionError || !sessionData.session?.access_token) {
        throw new UnauthorizedException(
          'Unable to authenticate password change',
        );
      }

      const authenticatedClient = createClient(
        this.config.get<string>('supabase.url')!,
        this.config.get<string>('supabase.anonKey')!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          },
        },
      );

      const { error: updateError } = await authenticatedClient.auth.updateUser({
        password: dto.newPassword,
      });

      if (updateError) {
        this.logger.error(
          ` [Profiles] Failed to update password for user: ${userId}: ${updateError.message}`,
        );
        throw new BadRequestException(updateError.message);
      }
    }

    this.logger.log(
      ` [Profiles] Password changed successfully for user: ${userId}`,
    );
    return { success: true, message: 'Password updated successfully' };
  }
}
