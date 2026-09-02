import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PermissionNameEnum } from '@myspend/libs';
import { CheckPermissions } from '../auth/decorators/check-permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Controller('admin/announcements')
@UseGuards(PermissionsGuard)
export class AdminAnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @CheckPermissions(PermissionNameEnum.ANNOUNCEMENT_READ)
  async findAll() {
    return this.announcementsService.getAdminAnnouncements();
  }

  @Get(':id')
  @CheckPermissions(PermissionNameEnum.ANNOUNCEMENT_READ)
  async findOne(@Param('id') id: string) {
    return this.announcementsService.getAdminAnnouncementById(id);
  }

  @Post()
  @CheckPermissions(PermissionNameEnum.ANNOUNCEMENT_CREATE)
  async create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateAnnouncementDto
  ) {
    return this.announcementsService.createAnnouncement(dto, req.user.userId);
  }

  @Put(':id')
  @CheckPermissions(PermissionNameEnum.ANNOUNCEMENT_UPDATE)
  async update(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto
  ) {
    return this.announcementsService.updateAnnouncement(id, dto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckPermissions(PermissionNameEnum.ANNOUNCEMENT_DELETE)
  async delete(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string
  ) {
    return this.announcementsService.deleteAnnouncement(id, req.user.userId);
  }

  @Patch(':id/toggle-active')
  @CheckPermissions(PermissionNameEnum.ANNOUNCEMENT_UPDATE)
  async toggleActive(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string
  ) {
    return this.announcementsService.toggleActive(id, req.user.userId);
  }
}
