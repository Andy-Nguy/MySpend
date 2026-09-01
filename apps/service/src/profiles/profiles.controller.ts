import { Body, Controller, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

interface IAuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('Profiles')
@ApiBearerAuth('JWT-auth')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Patch('me')
  @ApiOperation({ summary: 'Update personal profile information' })
  updateProfile(
    @Req() request: IAuthenticatedRequest,
    @Body() dto: UpdateProfileDto
  ) {
    return this.profilesService.updateProfile(request.user.userId, dto);
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change user password' })
  changePassword(
    @Req() request: IAuthenticatedRequest,
    @Body() dto: ChangePasswordDto
  ) {
    return this.profilesService.changePassword(request.user.userId, dto);
  }
}
