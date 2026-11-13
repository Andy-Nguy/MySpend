import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CookieOptions, Request, Response } from 'express';

import { Public } from './decorators/public.decorator';
import { AuthCredentialsDto } from './dto/auth.dto';
import {
  LoginOptionsDto,
  VerifyAuthenticationDto,
  VerifyRegistrationDto,
} from './dto/passkey.dto';
import { AuthService } from './auth.service';
import { PasskeysService } from './passkeys.service';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

interface IAuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passkeysService: PasskeysService,
  ) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 20, ttl: 60 * 60 * 1000 } })
  async register(
    @Body() credentials: AuthCredentialsDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const session = await this.authService.register(
      credentials.email,
      credentials.password
    );
    this.setRefreshTokenCookie(response, session.refreshToken);
    return this.toAuthResponse(session);
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 30, ttl: 60 * 1000 } })
  async login(
    @Body() credentials: AuthCredentialsDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const session = await this.authService.login(
      credentials.email,
      credentials.password
    );
    this.setRefreshTokenCookie(response, session.refreshToken);
    return this.toAuthResponse(session);
  }

  @Public()
  @Post('refresh')
  @Throttle({ default: { limit: 60, ttl: 60 * 1000 } })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const session = await this.authService.refresh(
      request.cookies?.[REFRESH_TOKEN_COOKIE]
    );
    this.setRefreshTokenCookie(response, session.refreshToken);
    return this.toAuthResponse(session);
  }

  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/api/auth',
    });
    return { success: true };
  }

  @Get('me')
  getMe(@Req() request: IAuthenticatedRequest) {
    return this.authService.getMe(request.user.userId);
  }

  // ==========================================
  // WebAuthn Passkeys / FaceID Endpoints
  // ==========================================

  @Get('passkey/register-options')
  async getRegisterOptions(@Req() request: IAuthenticatedRequest) {
    return this.passkeysService.getRegistrationOptions(
      request.user.userId,
      request.headers.origin,
    );
  }

  @Post('passkey/register-verify')
  async verifyRegistration(
    @Req() request: IAuthenticatedRequest,
    @Body() dto: VerifyRegistrationDto,
  ) {
    return this.passkeysService.verifyRegistration(
      request.user.userId,
      dto.response,
      dto.deviceName,
      request.headers.origin,
    );
  }

  @Public()
  @Post('passkey/login-options')
  @Throttle({ default: { limit: 30, ttl: 60 * 1000 } })
  async getLoginOptions(@Req() request: Request, @Body() dto: LoginOptionsDto) {
    return this.passkeysService.getAuthenticationOptions(
      dto.email,
      request.headers.origin,
    );
  }

  @Public()
  @Post('passkey/login-verify')
  @Throttle({ default: { limit: 30, ttl: 60 * 1000 } })
  async verifyLogin(
    @Req() request: Request,
    @Body() dto: VerifyAuthenticationDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.passkeysService.verifyAuthentication(
      dto.response,
      request.headers.origin,
    );
    this.setRefreshTokenCookie(response, session.refreshToken);
    return this.toAuthResponse(session);
  }

  @Get('passkey/list')
  async listPasskeys(@Req() request: IAuthenticatedRequest) {
    return this.passkeysService.getUserPasskeys(request.user.userId);
  }

  @Delete('passkey/:id')
  async deletePasskey(
    @Req() request: IAuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.passkeysService.deletePasskey(request.user.userId, id);
  }

  private setRefreshTokenCookie(response: Response, refreshToken: string) {
    response.cookie(
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      this.getRefreshCookieOptions()
    );
  }

  private getRefreshCookieOptions(): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/api/auth',
    };
  }

  private toAuthResponse(session: Awaited<ReturnType<AuthService['login']>>) {
    return {
      accessToken: session.accessToken,
      user: session.user,
    };
  }
}
