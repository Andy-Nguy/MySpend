import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { createClient } from '@supabase/supabase-js';

import { ProfileEntity } from '../entities/profile/profile.entity';
import { ProfilesRepository } from '../profiles/repository/profiles.repository';

interface IRefreshPayload {
  sub: string;
  tokenType: 'refresh';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly profilesRepository: ProfilesRepository
  ) { }

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

  async register(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const adminClient = this.createAdminClient();

    let user: { id: string; email?: string } | null = null;

    if (adminClient) {
      // Auto-confirm user upon registration so subsequent logins work immediately
      const { data, error } = await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
      });

      if (error) {
        this.logger.warn(`❌ [Auth] Registration failed for ${normalizedEmail}: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      user = data.user;
    } else {
      const supabase = this.createAuthClient();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

      if (error) {
        this.logger.warn(`❌ [Auth] Registration failed for ${normalizedEmail}: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      user = data.user;
    }

    if (!user?.id || !user.email) {
      throw new BadRequestException('Unable to register user');
    }

    const profile = await this.profilesRepository.upsertFromSupabaseUser(user);
    this.logger.log(`✅ [Auth] User registered successfully: ${profile.email} (${profile.id})`);
    return this.createSession(profile);
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const supabase = this.createAuthClient();

    let { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    // Handle case where user was created unconfirmed
    if (error && error.message.toLowerCase().includes('email not confirmed')) {
      const adminClient = this.createAdminClient();
      if (adminClient) {
        this.logger.log(`ℹ️ [Auth] User ${normalizedEmail} is unconfirmed. Auto-confirming via admin client...`);
        const profile = await this.profilesRepository.findByEmail(normalizedEmail);
        if (profile) {
          await adminClient.auth.admin.updateUserById(profile.id, {
            email_confirm: true,
          });
          const retry = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });
          data = retry.data;
          error = retry.error;
        }
      }
    }

    if (error || !data?.user?.id || !data?.user?.email) {
      this.logger.warn(`❌ [Auth] Failed login attempt for: ${normalizedEmail}: ${error?.message || 'Invalid credentials'}`);
      throw new UnauthorizedException(error?.message || 'Invalid credentials');
    }

    const profile = await this.profilesRepository.upsertFromSupabaseUser(data.user);
    this.logger.log(`✅ [Auth] User logged in: ${profile.email} (${profile.id})`);
    return this.createSession(profile);
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload: IRefreshPayload;

    try {
      payload = await this.jwtService.verifyAsync<IRefreshPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const profile = await this.profilesRepository.findById(payload.sub);

    if (!profile) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.logger.log(`🔄 [Auth] Token refreshed for: ${profile.email}`);
    return this.createSession(profile);
  }

  async getMe(userId: string) {
    const profile = await this.profilesRepository.findById(userId);

    if (!profile) {
      throw new UnauthorizedException('Profile not found');
    }

    return profile;
  }

  private async createSession(profile: ProfileEntity) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: profile.id, email: profile.email },
        {
          secret: this.config.get<string>('jwt.secret'),
          expiresIn: this.getJwtExpiresIn('jwt.expiresIn'),
        }
      ),
      this.jwtService.signAsync(
        { sub: profile.id, tokenType: 'refresh' },
        {
          secret: this.config.get<string>('jwt.refreshSecret'),
          expiresIn: this.getJwtExpiresIn('jwt.refreshExpiresIn'),
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      user: profile,
    };
  }

  private getJwtExpiresIn(key: string): JwtSignOptions['expiresIn'] {
    return this.config.get<string>(key) as JwtSignOptions['expiresIn'];
  }
}
