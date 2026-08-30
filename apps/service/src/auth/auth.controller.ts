import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CookieOptions, Request, Response } from 'express';

import { Public } from './decorators/public.decorator';
import { AuthCredentialsDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

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
  constructor(private readonly authService: AuthService) {}

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
